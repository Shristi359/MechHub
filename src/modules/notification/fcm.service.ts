import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { env } from '../../config/env';

let firebaseApp: App;

function getFirebaseApp(): App {
    if (!firebaseApp) {
        if (getApps().length === 0) {
            firebaseApp = initializeApp({
                credential: cert({
                    projectId:   env.FIREBASE_PROJECT_ID,
                    clientEmail: env.FIREBASE_CLIENT_EMAIL,
                    privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        } else {
            firebaseApp = getApps()[0];
        }
    }
    return firebaseApp;
}

export interface PushPayload {
    token: string;
    title: string;
    body: string;
    data: Record<string, string>;
}

export async function sendPushBatch(payloads: PushPayload[]): Promise<{
    successCount: number;
    failureCount: number;
    failedTokens: string[];
}> {
    if (payloads.length === 0) {
        return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    const messaging = getMessaging(getFirebaseApp());

    const messages = payloads.map(p => ({
        token: p.token,
        notification: { title: p.title, body: p.body },
        data: p.data,
        android: {
            priority: 'high' as const,
            ttl: 60_000,
        },
    }));

    const result = await messaging.sendEach(messages);

    const failedTokens: string[] = [];
    result.responses.forEach((res, i) => {
        if (!res.success) failedTokens.push(payloads[i].token);
    });

    return {
        successCount: result.successCount,
        failureCount: result.failureCount,
        failedTokens,
    };
}
