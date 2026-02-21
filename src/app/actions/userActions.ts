"use strict";
"use server";

import { adminDb } from '@/lib/firebase/firebaseAdmin';
import { revalidatePath } from 'next/cache';

/**
 * Toggles a user's `isFrozen` status in Firestore.
 * Requires Firebase Admin privileges (executed securely on the server).
 * 
 * @param userId The ID of the user to mutate
 * @param currentStatus The current frozen status of the user
 */
export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    try {
        if (!userId) {
            throw new Error("User ID is required.");
        }

        const newStatus = !currentStatus;

        // Perform the mutation using Admin SDK
        await adminDb.collection('users').doc(userId).update({
            isFrozen: newStatus,
            updatedAt: new Date().toISOString()
        });

        // Revalidate the specific user detail page to instantly reflect the updated status
        revalidatePath(`/dashboard/users/${userId}`);

        // Revalidate the users directory to ensure the table list is fresh too
        revalidatePath('/dashboard/users');

        return { success: true, newStatus };
    } catch (error: any) {
        console.error("Error toggling user status:", error);
        return { success: false, error: error.message };
    }
}
