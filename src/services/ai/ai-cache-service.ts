/**
 * AI Cache Service
 * Stores grounded Gemini 3 Flash summaries in Firestore to be shared globally.
 * Documentation: https://firebase.google.com/docs/firestore
 */

import { db, auth } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

const CACHE_COLLECTION = 'ai_cache';

export interface CachedAISummary {
    query: string;
    category: string;
    summary: string;
    groundingSources: string[];
    thoughtSignature?: string;
    model: string;
    createdAt: any; // serverTimestamp or Timestamp
    expiresAt: any;
}

/**
 * Generate a deterministic cache key from query and category
 */
function generateCacheKey(query: string, category: string): string {
    // Normalize: lowercase, remove special characters, replace spaces with hyphens
    const normalizedQuery = query.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    const normalizedCategory = category.toLowerCase().trim();
    return `${normalizedQuery}_${normalizedCategory}`;
}

/**
 * Get a cached AI summary from Firestore
 */
export async function getCachedAISummary(
    query: string,
    category: string
): Promise<CachedAISummary | null> {
    if (!db) return null;

    const cacheKey = generateCacheKey(query, category);

    try {
        const docRef = doc(db, CACHE_COLLECTION, cacheKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as CachedAISummary;

            // Check for expiration (e.g., 30 days)
            const now = Timestamp.now();
            if (data.expiresAt && data.expiresAt.toMillis() < now.toMillis()) {
                console.log('[AI Cache] Cached entry expired:', cacheKey);
                return null;
            }

            console.log('[AI Cache] Using cached summary for:', query);
            return data;
        }
    } catch (error) {
        console.warn('[AI Cache] Error reading from cache:', error);
    }

    return null;
}

/**
 * Store an AI summary in the global Firestore cache
 */
export async function cacheAISummary(
    query: string,
    category: string,
    summary: string,
    groundingSources: string[],
    model: string,
    thoughtSignature?: string
): Promise<void> {
    if (!db) return;

    const cacheKey = generateCacheKey(query, category);

    try {
        const docRef = doc(db, CACHE_COLLECTION, cacheKey);

        // Set expiration to 30 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await setDoc(docRef, {
            query,
            category,
            summary,
            groundingSources,
            model,
            thoughtSignature,
            createdAt: serverTimestamp(),
            expiresAt: Timestamp.fromDate(expiresAt),
        });

        console.log('[AI Cache] Summary cached for:', query);
    } catch (error) {
        console.warn('[AI Cache] Error writing to cache:', error);
    }
}
