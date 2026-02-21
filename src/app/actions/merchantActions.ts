"use server";

import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { revalidatePath } from 'next/cache';

export async function updateMerchantPlan(merchantId: string, newPlan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE') {
    try {
        await adminDb.collection('merchants').doc(merchantId).update({
            currentPlan: newPlan,
            updatedAt: new Date().toISOString()
        });

        revalidatePath(`/dashboard/merchants/${merchantId}`);
        revalidatePath(`/dashboard/merchants`);

        return { success: true };
    } catch (error) {
        console.error(`Failed to update plan for merchant ${merchantId}:`, error);
        return { success: false, error: "Failed to update plan" };
    }
}
