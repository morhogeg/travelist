import { logger } from '@/utils/logger';
import { callGemini, buildCategoryAwarePrompt, GeminiMessage } from './gemini-client';

export interface GenerateDescriptionResult {
    description: string | null;
    thoughtSignature?: string;
    error?: string;
}

/**
 * Generate a brief 2-sentence description for a place using Gemini 3 Flash
 */
export async function generatePlaceDescription(
    placeName: string,
    city: string,
    country: string,
    category?: string
): Promise<GenerateDescriptionResult> {
    // Build category-aware system prompt
    const systemPrompt = buildCategoryAwarePrompt(category);

    const userPrompt = `Write a brief, helpful description for: ${placeName} in ${city}, ${country}${category ? ` (Category: ${category})` : ''}`;

    const messages: GeminiMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];

    const maxRetries = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            logger.debug('AI Description', `Attempt ${attempt}/${maxRetries} for:`, placeName);

            const result = await callGemini(messages, {
                temperature: 0.3,
                maxOutputTokens: 500,
                thinkingLevel: 'low',
                enableGrounding: true, // Use Google Search to verify location details
            }, {
                placeName,
                city,
                country,
                category
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

            return {
                description: content,
                thoughtSignature: result.thoughtSignature,
            };

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
