/**
 * Centralized Gemini Client
 * Uses Raw Fetch API for maximum compatibility with Capacitor/iOS
 */

import { generateGeminiDescription } from './gemini-service';
import { getCachedAISummary, cacheAISummary } from './ai-cache-service';
import { Capacitor } from '@capacitor/core';

const MODEL_ID = 'gemini-3-flash-preview';

export interface GeminiMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

export interface GeminiOptions {
    temperature?: number;
    maxOutputTokens?: number;
    thinkingLevel?: 'minimal' | 'low' | 'medium' | 'high';
    enableGrounding?: boolean;
    thoughtSignature?: string; // Pass back for conversation continuity
}

export interface GeminiResponse {
    content: string;
    model: string;
    thoughtSignature?: string;
    groundingMetadata?: object;
    error?: string;
}

/**
 * Main function to call Gemini via Raw REST API
 * Bypasses @google/genai SDK to avoid Capacitor compatibility issues
 */
export async function callGemini(
    messages: GeminiMessage[],
    options: GeminiOptions = {},
    context?: { placeName: string, city: string, country: string, category?: string }
): Promise<GeminiResponse> {

    // 1. Check AI Cache first if we have context
    // WRAPPER: Add timeout to prevent Firebase from blocking the main thread on iOS
    if (context) {
        const query = `${context.placeName} in ${context.city}`;
        try {
            // Create a timeout promise that rejects after 1500ms
            const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
                setTimeout(() => resolve({ timeout: true }), 1500);
            });

            // Race the cache lookup against the timeout
            const result = await Promise.race([
                getCachedAISummary(query, context.category || 'Attraction'),
                timeoutPromise
            ]);

            // If we got a real result (not null and not timeout)
            if (result && !('timeout' in result)) {
                console.log('[Gemini Client] Using cached summary for:', query);
                return {
                    content: result.summary,
                    model: result.model,
                    thoughtSignature: result.thoughtSignature,
                    groundingMetadata: { sources: result.groundingSources }
                };
            } else if ((result as any)?.timeout) {
                console.warn('[Gemini Client] Cache lookup timed out - skipping cache');
            }
        } catch (err) {
            console.warn('[Gemini Client] Cache lookup failed:', err);
        }
    }

    // 2. Fallback to Raw API
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('[Gemini Client] API key not configured');
        return { content: '', model: '', error: 'API key not configured' };
    }

    try {
        console.log('[Gemini Client] Calling Raw API model:', MODEL_ID);

        // Separate system instruction from messages
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        // Construct Request Payload
        const payload: any = {
            contents: conversationMessages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            generationConfig: {
                temperature: options.temperature ?? 0.3,
                maxOutputTokens: options.maxOutputTokens ?? 1000,
            }
        };

        // Add System Instruction if present
        if (systemMessage) {
            payload.systemInstruction = {
                parts: [{ text: systemMessage.content }]
            };
        }

        // Add Thinking Config
        if (options.thinkingLevel) {
            payload.generationConfig.thinkingConfig = {
                thinkingBudget: getThinkingBudget('minimal')
            };
        }

        // Add Grounding (Google Search)
        if (options.enableGrounding !== false) {
            payload.tools = [{ googleSearch: {} }];
        }

        // Perform Fetch
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        const candidate = data.candidates?.[0];
        const contentPart = candidate?.content?.parts?.[0];
        const textContent = contentPart?.text || '';

        // Extract Metadata
        const thoughtSignature = extractThoughtSignature(data);
        const groundingMetadata = candidate?.groundingMetadata;

        if (!textContent) {
            return { content: '', model: MODEL_ID, error: 'Empty response from model' };
        }

        // 3. Update Cache
        if (context) {
            const query = `${context.placeName} in ${context.city}`;
            // Fire and forget cache update
            cacheAISummary(
                query,
                context.category || 'Attraction',
                textContent,
                [],
                MODEL_ID,
                thoughtSignature
            ).catch(err => console.error('[Gemini Client] Cache update failed:', err));
        }

        return {
            content: textContent,
            model: MODEL_ID,
            thoughtSignature,
            groundingMetadata: groundingMetadata,
        };

    } catch (error: any) {
        console.error('[Gemini Client] Error:', error);
        return { content: '', model: MODEL_ID, error: error.message || 'Unknown error' };
    }
}

/**
 * Convert thinking level to budget tokens
 */
function getThinkingBudget(level: 'minimal' | 'low' | 'medium' | 'high'): number {
    const budgets: Record<string, number> = {
        minimal: 128,
        low: 1024,
        medium: 4096,
        high: 16384,
    };
    return budgets[level] ?? 1024;
}

/**
 * Extract thought signature from response for conversation continuity
 */
function extractThoughtSignature(data: any): string | undefined {
    // Look in output usage metadata
    const usageMetadata = data.usageMetadata;
    if (usageMetadata?.candidatesTokenCount) {
        // Create a signature from the thinking tokens used (if available)
        // Note: Raw API response structure for thinking usage might vary
        return `thought-${usageMetadata.totalTokenCount ?? 0}-${Date.now()}`;
    }
    return undefined;
}

/**
 * Category-aware system prompt builder for place descriptions
 */
export function buildCategoryAwarePrompt(category?: string): string {
    const categoryInstructions: Record<string, string> = {
        food: 'If the category is Food, mention a specific dish or cuisine worth trying.',
        nightlife: 'If the category is Nightlife, mention the vibe, atmosphere, or signature drinks.',
        attractions: 'If the category is Attraction, mention history, architecture, or cultural significance.',
        lodging: 'If the category is Lodging, mention unique amenities or what makes it stand out.',
        shopping: 'If the category is Shopping, mention what items or brands to look for.',
        outdoors: 'If the category is Outdoors, mention the best time of day or scenic highlights.',
        general: 'Provide a helpful description of what makes this place worth visiting.',
    };

    const instruction = category && categoryInstructions[category.toLowerCase()]
        ? categoryInstructions[category.toLowerCase()]
        : categoryInstructions.general;

    return `You are a knowledgeable travel guide assistant. Write exactly 2 sentences about a place that a traveler would find useful.

CRITICAL LOCATION RULE: The user provides a SPECIFIC city and country. You MUST write about that EXACT location.
- If the user says "Tel Aviv, Israel" - write ONLY about Tel Aviv, NOT Jerusalem or any other city.
- If the user says "Paris, France" - write ONLY about Paris, NOT Lyon or any other city.
- Never guess or assume a different location than what is specified.

GUIDELINES:
1. ${instruction}
2. Be specific and informative - avoid generic praise like "great", "amazing", "wonderful", "fantastic"
3. Include practical tips when relevant (best time to visit, what to order, etc.)
4. Use Google Search to verify details are accurate for that specific location.
5. Keep it concise - exactly 2 sentences maximum.

CRITICAL: Respond with ONLY the final 2-sentence description. Do NOT include any thinking process, revisions, self-corrections, or explanations. Output the answer directly without any preamble.`;
}
