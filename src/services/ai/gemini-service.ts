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

    // 2. Call JS Client (Fallback for disabled Native Plugin)
    try {
        logger.info('Gemini Service', 'Calling JS Gemini Client for:', query);

        // Dynamic import to avoid circular dependency issues if any
        const { callGemini, buildCategoryAwarePrompt } = await import('./gemini-client');

        const systemPrompt = buildCategoryAwarePrompt(category);
        const userMessage = `Write a brief description for: ${placeName}
LOCATION: ${city}, ${country}
Category: ${category}`;

        const result = await callGemini(
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            {
                temperature: 0.3,
                maxOutputTokens: 500,
                enableGrounding: true
            },
            { placeName, city, country, category }
        );

        if (result.content) {
            return {
                summary: result.content,
                groundingSources: (result.groundingMetadata as any)?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [],
                thoughtSignature: result.thoughtSignature
            };
        }

        return { summary: null, groundingSources: [], error: result.error || 'Empty response from Gemini' };

    } catch (err: any) {
        logger.error('Gemini Service', 'Generation failed:', err);
        return {
            summary: null,
            groundingSources: [],
            error: err?.message ?? 'Gemini call failed'
        };
    }
}
