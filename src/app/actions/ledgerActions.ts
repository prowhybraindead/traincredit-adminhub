'use server';

import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function processRefund(transactionId: string, adminEmail: string) {
    try {
        if (!adminEmail) {
            return { success: false, error: "Unauthorized access: Admin identity missing." };
        }

        const txRef = adminDb.collection('transactions').doc(transactionId);

        await adminDb.runTransaction(async (t) => {
            // ==========================================
            // 1. READ PHASE (Locks the documents)
            // ==========================================
            const txDoc = await t.get(txRef);

            if (!txDoc.exists) {
                throw new Error("Transaction not found.");
            }

            const txData = txDoc.data();

            if (!txData) {
                throw new Error("Transaction data is corrupt.");
            }

            if (txData.status !== 'COMPLETED') {
                throw new Error(`Refund failed: Transaction is currently ${txData.status}. Only COMPLETED transactions can be refunded.`);
            }

            if (txData.type !== 'PAYMENT') {
                throw new Error(`Refund failed: Can only refund PAYMENT transactions, not ${txData.type}.`);
            }

            const senderId = txData.senderId;
            const receiverId = txData.receiverId || txData.merchantId; // TrainCredit Core uses merchantId sometimes

            if (!senderId) {
                throw new Error("Cannot identify the Consumer (Sender) to refund.");
            }

            if (!receiverId) {
                throw new Error("Cannot identify the Merchant (Receiver) to debit.");
            }

            // TrainCredit ecosystem places wallets in either 'users' or 'merchants'
            const senderRef = adminDb.collection('users').doc(senderId);

            // Note: In TrainCredit Ecosystem, Merchants are in 'merchants', but some early ones might be in 'users'.
            // Because this is an atomic transaction, we must use a single known collection.
            // Assumption based on architecture: B2B accounts are in 'merchants'. 
            const receiverRef = adminDb.collection('merchants').doc(receiverId);

            const senderDoc = await t.get(senderRef);
            const receiverDoc = await t.get(receiverRef);

            if (!senderDoc.exists) {
                throw new Error("Consumer wallet not found.");
            }

            if (!receiverDoc.exists) {
                throw new Error("Merchant account not found. Cannot reverse funds.");
            }

            // ==========================================
            // 2. MATH & VALIDATION PHASE
            // ==========================================
            const totalAmount = txData.amount; // What the consumer paid (e.g. $10)
            const netAmount = txData.netAmount || totalAmount; // What the merchant received (e.g. $9.50)
            const merchantBalance = receiverDoc.data()?.balance || 0;

            // Protection Lock: Prevent Merchant from going negative
            if (merchantBalance < netAmount) {
                throw new Error(`Refund aborted: Merchant has insufficient funds ($${merchantBalance.toFixed(2)}) to cover this reversal ($${netAmount.toFixed(2)}).`);
            }

            // ==========================================
            // 3. WRITE PHASE (Atomic writes)
            // ==========================================

            // A. Debit Merchant
            t.update(receiverRef, {
                balance: FieldValue.increment(-netAmount)
            });

            // B. Credit Consumer
            t.update(senderRef, {
                mainBalance: FieldValue.increment(totalAmount)
            });

            // C. Mutate Original Transaction
            t.update(txRef, {
                status: 'REFUNDED',
                refundedAt: FieldValue.serverTimestamp(),
                refundedByAdmin: adminEmail
            });

            // D. Create Append-Only Audit Ticket
            const refundTicketRef = adminDb.collection('transactions').doc(); // Auto-ID
            t.set(refundTicketRef, {
                type: 'REFUND_TICKET',
                originalTxId: transactionId,
                amount: totalAmount,
                netAmountReversed: netAmount,
                senderId: receiverId, // The merchant is sending it back
                receiverId: senderId, // The consumer is receiving
                executedBy: adminEmail,
                status: 'COMPLETED',
                timestamp: FieldValue.serverTimestamp(),
                description: `Refund for TX ${transactionId.slice(0, 8)}`
            });
        });

        // Trigger UI Refresh
        revalidatePath('/dashboard/ledger');

        return { success: true };

    } catch (error: any) {
        console.error("Refund Transaction Failed:", error);
        // Extract inner error message if thrown from inside the transaction block
        const message = error.message || "An unexpected error occurred during the refund process.";
        return { success: false, error: message };
    }
}
