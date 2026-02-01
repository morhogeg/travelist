/**
 * Centralized OpenRouter Client
 * Implements primary model and multi-turn reasoning fallback logic for maximum reliability.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const PRIMARY_MODEL = 'tngtech/deepseek-r1t2-chimera:free';
const FALLBACK_MODEL = 'openai/gpt-oss-120b:free';

export interface OpenRouterMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    reasoning_details?: string;
}

export interface OpenRouterOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    reasoning?: { enabled: boolean };
}

export interface OpenRouterResponse {
    content: string;
    model: string;
    error?: string;
}

/**
 * Main function to call OpenRouter with built-in fallback logic
 */
export async function callOpenRouter(
    messages: OpenRouterMessage[],
    options: OpenRouterOptions = {}
): Promise<OpenRouterResponse> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        console.error('[OpenRouter Client] API key not configured');
        return { content: '', model: '', error: 'API key not configured' };
    }

    // 1. Try Primary Model
    try {
        console.log('[OpenRouter Client] Calling primary model:', PRIMARY_MODEL);
        const result = await makeRequest(PRIMARY_MODEL, messages, apiKey, options);

        if (result.content) {
            return {
                content: result.content,
                model: result.model
            };
        }

        console.warn('[OpenRouter Client] Primary model returned empty content, falling back...');
    } catch (error) {
        console.error('[OpenRouter Client] Primary model failed:', error);
    }

    // 2. Fallback Logic with Reasoning Multi-turn
    console.log('[OpenRouter Client] Starting fallback logic with model:', FALLBACK_MODEL);
    try {
        // Phase 1: Initial call with reasoning enabled
        const phase1Options = {
            ...options,
            reasoning: { enabled: true }
        };

        const result1 = await makeRequest(FALLBACK_MODEL, messages, apiKey, phase1Options);

        if (!result1.content && !result1.reasoning_details) {
            throw new Error('Fallback Phase 1 returned no content or reasoning');
        }

        // Phase 2: Refinement ("Are you sure? Think carefully.")
        const refinedMessages: OpenRouterMessage[] = [
            ...messages,
            {
                role: 'assistant',
                content: result1.content || '',
                reasoning_details: result1.reasoning_details
            },
            {
                role: 'user',
                content: 'Are you sure? Think carefully and provide the final result in the requested format.'
            }
        ];

        console.log('[OpenRouter Client] Falling back to Phase 2 (Refinement)...');
        const result2 = await makeRequest(FALLBACK_MODEL, refinedMessages, apiKey, phase1Options);

        if (result2.content) {
            return {
                content: result2.content,
                model: result2.model
            };
        }

        // If Phase 2 fails but Phase 1 had content, return Phase 1
        if (result1.content) {
            return {
                content: result1.content,
                model: result1.model
            };
        }

        throw new Error('Fallback Phase 2 returned no content');
    } catch (error) {
        console.error('[OpenRouter Client] Fallback failed:', error);
        return { content: '', model: '', error: error instanceof Error ? error.message : 'Unknown fallback error' };
    }
}

/**
 * Basic request helper
 */
async function makeRequest(
    model: string,
    messages: OpenRouterMessage[],
    apiKey: string,
    options: OpenRouterOptions
): Promise<{ content: string; reasoning_details?: string; model: string }> {

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://travelist.ai',
            'X-Title': 'Travelist App',
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.1,
            max_tokens: options.max_tokens ?? 1000,
            reasoning: options.reasoning,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;

    if (!message) {
        throw new Error('No message in API response');
    }

    return {
        content: message.content,
        reasoning_details: message.reasoning_details,
        model: data.model || model
    };
}
