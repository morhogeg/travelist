/**
 * Firebase Client
 * Replaces Supabase as the backend service provider.
 * Provides Auth and Firestore with offline persistence for travelers.
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import {
    getFirestore,
    Firestore,
    enableIndexedDbPersistence,
    connectFirestoreEmulator
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId;

if (!isFirebaseConfigured) {
    console.warn('[Firebase] Missing configuration. Set VITE_FIREBASE_* environment variables.');
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Enable offline persistence for travelers (works offline!)
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time
                console.warn('[Firebase] Multiple tabs open, persistence only enabled in one tab');
            } else if (err.code === 'unimplemented') {
                // The current browser doesn't support persistence
                console.warn('[Firebase] Browser does not support offline persistence');
            }
        });

        // Connect to emulators in development (optional)
        if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
            connectAuthEmulator(auth, 'http://localhost:9099');
            connectFirestoreEmulator(db, 'localhost', 8080);
            console.log('[Firebase] Connected to emulators');
        }

        console.log('[Firebase] Initialized successfully');
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
    }
}

export { app, auth, db };

/**
 * Check if Firebase is ready to use
 */
export function isFirebaseReady(): boolean {
    return !!(app && auth && db);
}

/**
 * Lightweight connectivity check
 * Returns { ok: boolean, error?: string }
 */
export async function checkFirebaseConnection(): Promise<{ ok: boolean; error?: string }> {
    if (!auth) {
        return { ok: false, error: 'Firebase not initialized (missing env vars).' };
    }

    try {
        // Auth state is always available, even offline
        await auth.authStateReady();
        return { ok: true };
    } catch (err: unknown) {
        const error = err as Error;
        return { ok: false, error: error?.message ?? 'Unknown error' };
    }
}
