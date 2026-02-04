/**
 * Gemini 3 Flash Service
 * Primary provider for AI grounded summaries.
 * Integrated with global Firestore cache.
 */

import { registerPlugin } from '@capacitor/core';
import { getCachedAISummary, cacheAISummary } from './ai-cache-service';
import { logger } from '@/utils/logger';

// Plugin interface for native FirebaseAI
export interface FirebaseAIPlugin {
    generateDescription(options: {
        placeName: string;
        city: string;
        country: string;
        category?: string
    }): Promise<{ content: string; groundingSources: string[]; thoughtSignature?: string }>;
}

const NativeGemini = registerPlugin<FirebaseAIPlugin>('FirebaseAIPlugin');

export interface GeminiResult {
    summary: string | null;
    groundingSources: string[];
    thoughtSignature?: string;
    error?: string;
    cached?: boolean;
}

/**
 * Generate a grounded description for a place using Gemini 3 Flash
 */
export async function generateGeminiDescription(
    placeName: string,
    city: string,
    country: string,
    category: string = 'Attraction'
): Promise<GeminiResult> {
    const query = `${placeName} in ${city}`;

    // 1. Check AI Cache first
    try {
        const cached = await getCachedAISummary(query, category);
        if (cached) {
            return {
                summary: cached.summary,
                groundingSources: cached.groundingSources,
                thoughtSignature: cached.thoughtSignature,
                cached: true
            };
        }
    } catch (err) {
        logger.warn('Gemini Service', 'Cache lookup failed:', err);
    }

    // 2. Call Native Gemini (FirebaseAI)
    try {
        logger.info('Gemini Service', 'Calling native Gemini for:', query);

        // We attempt to call the native plugin. 
        // If we're on web and it's not implemented, it will fail.
        const result = await NativeGemini.generateDescription({
            placeName,
            city,
            country,
            category
        });

        if (result.content) {
            // 3. Store in global cache
            await cacheAISummary(
                query,
                category,
                result.content,
                result.groundingSources || [],
                'gemini-3-flash',
                result.thoughtSignature
            );

            return {
                summary: result.content,
                groundingSources: result.groundingSources || [],
                thoughtSignature: result.thoughtSignature
            };
        }

        return { summary: null, groundingSources: [], error: 'Empty response from Gemini' };

    } catch (err: any) {
        logger.error('Gemini Service', 'Generation failed:', err);

        // Fallback or error return
        return {
            summary: null,
            groundingSources: [],
            error: err?.message ?? 'Native Gemini call failed'
        };
    }
}
