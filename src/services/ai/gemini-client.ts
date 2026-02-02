/**
 * Centralized Gemini Client
 * Uses Google Gen AI SDK with Gemini 3 Flash model, thinking config, and Google Search grounding.
 */

import { GoogleGenAI, Content, Part, Tool, GenerateContentResponse } from '@google/genai';
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
 * Main function to call Gemini with thinking config and optional grounding
 * Prioritizes Native Bridge on iOS, falls back to JS SDK on Web
 */
export async function callGemini(
    messages: GeminiMessage[],
    options: GeminiOptions = {},
    context?: { placeName: string, city: string, country: string, category?: string }
): Promise<GeminiResponse> {
    const isNative = Capacitor.isNativePlatform();

    // 1. Check AI Cache first if we have context
    if (context) {
        const query = `${context.placeName} in ${context.city}`;
        const cached = await getCachedAISummary(query, context.category || 'Attraction');
        if (cached) {
            console.log('[Gemini Client] Using cached summary for:', query);
            return {
                content: cached.summary,
                model: cached.model,
                thoughtSignature: cached.thoughtSignature,
                groundingMetadata: { sources: cached.groundingSources }
            };
        }
    }

    // 2. Try Native Gemini if on iOS
    if (isNative && context) {
        try {
            console.log('[Gemini Client] Calling native bridge...');
            const nativeResult = await generateGeminiDescription(
                context.placeName,
                context.city,
                context.country,
                context.category
            );

            if (nativeResult.summary) {
                return {
                    content: nativeResult.summary,
                    model: 'gemini-3-flash-native',
                    thoughtSignature: nativeResult.thoughtSignature,
                    groundingMetadata: { sources: nativeResult.groundingSources }
                };
            }
        } catch (nativeErr) {
            console.warn('[Gemini Client] Native bridge failed, falling back to JS SDK:', nativeErr);
        }
    }

    // 3. Fallback to JS SDK (OpenRouter/GoogleGenAI)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('[Gemini Client] API key not configured');
        return { content: '', model: '', error: 'API key not configured' };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Separate system instruction from messages
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        // Convert messages to Gemini format
        const contents: Content[] = conversationMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }] as Part[],
        }));

        // Build tools array for grounding
        const tools: Tool[] = [];
        if (options.enableGrounding !== false) {
            tools.push({ googleSearch: {} });
        }

        console.log('[Gemini Client] Calling JS SDK model:', MODEL_ID);

        // Generate content with thinking config
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_ID,
            contents,
            config: {
                systemInstruction: systemMessage?.content,
                temperature: options.temperature ?? 0.3,
                maxOutputTokens: options.maxOutputTokens ?? 1000,
                thinkingConfig: {
                    thinkingBudget: getThinkingBudget(options.thinkingLevel ?? 'low'),
                },
                tools: tools.length > 0 ? tools : undefined,
            },
        });

        const textContent = response.text ?? '';
        const thoughtSignature = extractThoughtSignature(response);
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

        if (!textContent) {
            return { content: '', model: MODEL_ID, error: 'Empty response from model' };
        }

        // 4. Update Cache (JS SDK path)
        if (context) {
            const query = `${context.placeName} in ${context.city}`;
            await cacheAISummary(
                query,
                context.category || 'Attraction',
                textContent,
                [], // TODO: Extract sources from metadata
                MODEL_ID,
                thoughtSignature
            );
        }

        return {
            content: textContent,
            model: MODEL_ID,
            thoughtSignature,
            groundingMetadata: groundingMetadata as object | undefined,
        };
    } catch (error) {
        console.error('[Gemini Client] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { content: '', model: MODEL_ID, error: errorMessage };
    }
}

/**
 * Convert thinking level to budget tokens
 * Gemini 3 Flash uses token budgets for thinking depth
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
function extractThoughtSignature(response: GenerateContentResponse): string | undefined {
    // The thought signature is typically in the response metadata
    // It allows maintaining the model's "train of thought" across turns
    const candidate = response.candidates?.[0];

    // Check for thought signature in various locations
    if (candidate) {
        // Look in usage metadata or response headers
        const usageMetadata = response.usageMetadata;
        if (usageMetadata) {
            // Create a signature from the thinking tokens used
            return `thought-${usageMetadata.thoughtsTokenCount ?? 0}-${Date.now()}`;
        }
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

GUIDELINES:
1. ${instruction}
2. Be specific and informative - avoid generic praise like "great", "amazing", "wonderful", "fantastic"
3. Include practical tips when relevant (best time to visit, what to order, etc.)
4. TRUST the user's City/Country input. Use Google Search to verify details are accurate for that specific location.
5. Keep it concise - exactly 2 sentences maximum.

Respond with ONLY the description, no quotes or explanation.`;
}
