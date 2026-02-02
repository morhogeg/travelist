/**
 * Firestore Places Sync
 * Replaces supabase-recommendations.ts for cloud sync functionality.
 * Uses Firestore with offline persistence for travelers.
 */

import { db, auth } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { ParsedRecommendation, RecommendationPlace } from './types';

const PLACES_COLLECTION = 'places';

interface FirestorePlaceDoc {
    id: string;
    name: string;
    category: string;
    city: string;
    country: string | null;
    description: string | null;
    visited: boolean;
    website: string | null;
    source_type: string | null;
    source_name: string | null;
    user_id: string;
    created_at?: Timestamp;
    updated_at?: Timestamp;
}

/**
 * Convert a recommendation place to a Firestore document
 */
function toFirestoreDoc(
    rec: ParsedRecommendation,
    place: RecommendationPlace,
    userId: string
): FirestorePlaceDoc {
    return {
        id: place.recId || place.id || '',
        name: place.name,
        category: place.category,
        city: rec.city,
        country: rec.country ?? null,
        description: place.description ?? rec.rawText ?? null,
        visited: Boolean(place.visited),
        website: place.website ?? null,
        source_type: place.source?.type ?? null,
        source_name: place.source?.name ?? null,
        user_id: userId,
    };
}

/**
 * Convert a Firestore document back to a RecommendationPlace
 */
function fromFirestoreDoc(doc: FirestorePlaceDoc): RecommendationPlace {
    return {
        id: doc.id,
        recId: doc.id,
        name: doc.name,
        category: doc.category,
        description: doc.description ?? undefined,
        visited: doc.visited,
        website: doc.website ?? undefined,
        source: doc.source_type || doc.source_name
            ? {
                type: (doc.source_type ?? 'other') as RecommendationPlace['source'] extends { type: infer T } ? T : never,
                name: doc.source_name ?? '',
            }
            : undefined,
    };
}

/**
 * Group Firestore documents by city into ParsedRecommendations
 */
function groupDocsByCity(docs: FirestorePlaceDoc[]): ParsedRecommendation[] {
    const byCity = new Map<string, ParsedRecommendation>();

    docs.forEach((doc) => {
        const key = doc.city.toLowerCase();
        const place = fromFirestoreDoc(doc);

        if (!byCity.has(key)) {
            byCity.set(key, {
                id: doc.id,
                city: doc.city,
                country: doc.country ?? undefined,
                categories: [doc.category],
                places: [place],
                rawText: '',
            });
        } else {
            const rec = byCity.get(key)!;
            rec.places.push(place);
            if (!rec.categories.includes(doc.category)) {
                rec.categories.push(doc.category);
            }
        }
    });

    return Array.from(byCity.values());
}

/**
 * Sync a single place to Firestore.
 * Safe to call even if Firebase isn't configured.
 */
export async function syncPlaceToFirestore(
    rec: ParsedRecommendation,
    place: RecommendationPlace
): Promise<void> {
    if (!db || !auth) return;

    const user = auth.currentUser;
    if (!user) {
        console.warn('[Firestore] No signed-in user; skipping cloud sync.');
        return;
    }

    const placeId = place.recId || place.id;
    if (!placeId) {
        console.warn('[Firestore] Place has no ID; skipping sync.');
        return;
    }

    try {
        const placeRef = doc(db, PLACES_COLLECTION, placeId);
        const data = toFirestoreDoc(rec, place, user.uid);

        await setDoc(placeRef, {
            ...data,
            updated_at: serverTimestamp(),
        }, { merge: true });

        console.log('[Firestore] Synced place:', place.name);
    } catch (error) {
        console.warn('[Firestore] Failed to sync place:', error);
    }
}

/**
 * Sync all places from a recommendation to Firestore.
 * Safe to call even if Firebase isn't configured.
 */
export async function syncRecommendationToFirestore(rec: ParsedRecommendation): Promise<void> {
    if (!db || !auth) return;

    const user = auth.currentUser;
    if (!user) {
        console.warn('[Firestore] No signed-in user; skipping cloud sync.');
        return;
    }

    for (const place of rec.places) {
        await syncPlaceToFirestore(rec, place);
    }
}

/**
 * Fetch all places for the signed-in user from Firestore.
 */
export async function fetchFirestorePlaces(): Promise<ParsedRecommendation[]> {
    if (!db || !auth) return [];

    const user = auth.currentUser;
    if (!user) {
        return [];
    }

    try {
        const q = query(
            collection(db, PLACES_COLLECTION),
            where('user_id', '==', user.uid)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => doc.data() as FirestorePlaceDoc);

        return groupDocsByCity(docs);
    } catch (error) {
        console.warn('[Firestore] Failed to fetch places:', error);
        return [];
    }
}

/**
 * Backfill all local recommendations to Firestore.
 */
export async function backfillLocalToFirestore(recs: ParsedRecommendation[]): Promise<void> {
    if (!db || !auth) return;

    const user = auth.currentUser;
    if (!user) {
        return;
    }

    for (const rec of recs) {
        await syncRecommendationToFirestore(rec);
    }
}
