import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config();

if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("Missing FIREBASE_PROJECT_ID in .env");
    process.exit(1);
}

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID?.replace(/"/g, ''),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, ''),
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/"/g, '')?.replace(/\\n/g, '\n'),
        }),
    });
}

const auth = getAuth();

async function listAllUsers() {
    try {
        console.log('Fetching Firebase users...');
        const listUsersResult = await auth.listUsers(1000);
        
        if (listUsersResult.users.length === 0) {
            console.log('No users found in Firebase Authentication.');
            return;
        }

        console.log(`\nFound ${listUsersResult.users.length} users:\n`);
        
        for (const userRecord of listUsersResult.users) {
            // Get custom claims to check for role
            const customClaims = userRecord.customClaims || {};
            const role = customClaims.admin ? 'admin' : (customClaims.role || 'user');
            
            console.log(`- Email: ${userRecord.email}`);
            console.log(`  UID: ${userRecord.uid}`);
            console.log(`  Role: ${role}`);
            console.log(`  Last Sign In: ${userRecord.metadata.lastSignInTime || 'Never'}`);
            console.log('-----------------------------------');
        }
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

listAllUsers();
