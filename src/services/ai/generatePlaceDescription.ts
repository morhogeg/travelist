/**
 * AI-powered place description generator
 * Uses OpenRouter API (Google Gemma) to generate brief descriptions for user's saved places
 */

import { logger } from '@/utils/logger';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemma-3-27b-it:free';

export interface GenerateDescriptionResult {
    description: string | null;
    error?: string;
}

/**
 * Generate a brief 1-2 sentence description for a place
 */
export async function generatePlaceDescription(
    placeName: string,
    city: string,
    country: string,
    category?: string
): Promise<GenerateDescriptionResult> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
        logger.error('AI Description', 'OpenRouter API key not configured');
        return { description: null, error: 'API key not configured' };
    }

    const systemPrompt = `You are a travel guide assistant. Write ONE sentence about a place.

CRITICAL RULES:
1. NEVER guess the cuisine type, food style, or specialty - you will often be WRONG
2. NEVER say "Colombian", "Italian", "Mexican" etc. unless the place NAME clearly indicates it
3. For restaurants/cafes: Say "A popular dining spot" or "A local favorite" - NEVER guess the food type
4. Only mention specific details if the place name OBVIOUSLY indicates them (e.g., "Joe's Pizza" = pizza)
5. Maximum 20 words
6. Better to be generic than WRONG

SAFE EXAMPLES:
- "La Tigre" → "A popular local spot in [city] worth checking out." (NOT "Colombian restaurant"!)
- "Joe's Pizza" → "A beloved pizza spot in [city]." (pizza is in the name, so OK)
- "Cafe Central" → "A charming cafe in [city]." (cafe is in the name)

Respond with ONLY the description, no quotes or explanation.`;

    const categoryHint = category ? ` (Category: ${category})` : '';
    const userPrompt = `Describe: ${placeName} in ${city}, ${country}${categoryHint}`;

    try {
        logger.debug('AI Description', 'Generating description for:', placeName);

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Travelist AI'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 60
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('AI Description', 'API error:', response.status, errorData);
            return {
                description: null,
                error: `API error: ${response.status}`
            };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return { description: null, error: 'Empty response from AI' };
        }

        logger.debug('AI Description', 'Generated:', content);
        return { description: content };

    } catch (error) {
        logger.error('AI Description', 'Network error:', error);
        return { description: null, error: 'Network error - please try again' };
    }
}
