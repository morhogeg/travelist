import { logger } from '@/utils/logger';
import { callOpenRouter, OpenRouterMessage } from './openrouter-client';

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

    const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    try {
        logger.debug('AI Description', 'Generating description for:', placeName);

        const result = await callOpenRouter(messages, {
            temperature: 0.3,
            max_tokens: 60
        });

        if (result.error) {
            logger.error('AI Description', 'Error:', result.error);
            return {
                description: null,
                error: result.error
            };
        }

        if (!result.content) {
            return { description: null, error: 'Empty response from AI' };
        }

        const content = result.content.trim();
        logger.debug('AI Description', 'Generated:', content);
        return { description: content };

    } catch (error) {
        logger.error('AI Description', 'Network error:', error);
        return { description: null, error: 'Network error - please try again' };
    }
}
