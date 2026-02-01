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
    const systemPrompt = `You are a knowledgeable travel guide assistant. Write a helpful 1-2 sentence description about a place that a traveler would find useful.

GUIDELINES:
1. Include what makes this place special or worth visiting
2. Mention the type of experience (cozy café, upscale restaurant, hidden gem, iconic landmark, etc.)
3. If it's a restaurant/café, you can mention the general cuisine or vibe if it's commonly known
4. Add a helpful tip if relevant (best time to visit, what to try, atmosphere)
5. Keep it concise but informative - 1-2 sentences maximum

EXAMPLES:
- "A beloved neighborhood pizzeria known for its thin-crust pies and casual atmosphere. Perfect for a quick, authentic slice."
- "An iconic Parisian landmark offering panoramic city views. Best visited at sunset for stunning photo opportunities."
- "A charming café popular with locals for its specialty coffee and freshly baked pastries."

Respond with ONLY the description, no quotes or explanation.`;

    const categoryHint = category ? ` (Category: ${category})` : '';
    const userPrompt = `Write a brief, helpful description for: ${placeName} in ${city}, ${country}${categoryHint}`;

    const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.debug('AI Description', `Attempt ${attempt}/${maxRetries} for:`, placeName);

            const result = await callOpenRouter(messages, {
                temperature: 0.3,
                max_tokens: 500
            });

            if (result.error) {
                lastError = result.error;
                logger.error('AI Description', `Attempt ${attempt} error:`, result.error);

                // If rate limited, wait and retry
                if (result.error.includes('429') && attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }

                // For other errors on last attempt, return error
                if (attempt === maxRetries) {
                    return {
                        description: null,
                        error: result.error
                    };
                }
                continue;
            }

            if (!result.content) {
                lastError = 'Empty response from AI';
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                    continue;
                }
                return { description: null, error: lastError };
            }

            const content = result.content.trim();
            logger.debug('AI Description', 'Generated:', content);
            return { description: content };

        } catch (error) {
            logger.error('AI Description', `Attempt ${attempt} network error:`, error);
            lastError = 'Network error - please try again';
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                continue;
            }
        }
    }

    return { description: null, error: lastError || 'Failed after multiple attempts' };
}
