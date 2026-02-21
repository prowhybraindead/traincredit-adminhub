import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from the root of the project
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Ensure args are provided
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.error("❌ Usage: npx tsx scripts/create-root.ts <email> <password>");
    process.exit(1);
}

// Check for required env vars
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("❌ Error: Missing Firebase Admin SDK credentials in .env.local");
    process.exit(1);
}

// Initialize Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const auth = admin.auth();
const db = admin.firestore();

async function createRootAdmin() {
    try {
        let user;
        try {
            // Check if user already exists
            user = await auth.getUserByEmail(email);
            console.log(`User ${email} already exists. Updating password and claims...`);
            await auth.updateUser(user.uid, { password });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`Creating new user: ${email}...`);
                user = await auth.createUser({
                    email,
                    password,
                    displayName: 'Root Administrator',
                });
            } else {
                throw error;
            }
        }

        // Set Custom Claims for RBAC
        console.log(`Assigning ROOT role to ${user.uid}...`);
        await auth.setCustomUserClaims(user.uid, { role: 'ROOT' });

        // Create Admin Profile Document in Firestore
        console.log(`Creating Admin Profile in Firestore...`);
        await db.collection('admins').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Root Administrator',
            role: 'ROOT',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
        }, { merge: true });

        console.log('\n================================================');
        console.log('✅ ROOT Admin successfully created/updated!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Role: ROOT`);
        console.log('================================================\n');
        console.log(`You can now log into your deployed Admin Hub on Vercel!\n`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Failed to create ROOT admin:', error);
        process.exit(1);
    }
}

createRootAdmin();
