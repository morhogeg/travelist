/**
 * AI-powered place description generator
 * Uses OpenRouter API (Google Gemma) to generate brief descriptions for user's saved places
 */

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
        console.error('[AI Description] OpenRouter API key not configured');
        return { description: null, error: 'API key not configured' };
    }

    const systemPrompt = `You are a knowledgeable travel guide. Generate a brief, ACCURATE description for a specific place.

Rules:
- ONLY describe if you have verified knowledge of this specific place
- If unsure, say "A local spot worth exploring"
- Keep it to ONE sentence, maximum 25 words
- Be factual - mention what they serve/offer or what makes it notable
- NO made-up details about cuisine, history, or atmosphere

Respond with ONLY the description text, no quotes.`;

    const categoryHint = category ? ` (Category: ${category})` : '';
    const userPrompt = `Describe: ${placeName} in ${city}, ${country}${categoryHint}`;

    try {
        console.log('[AI Description] Generating description for:', placeName);

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
            console.error('[AI Description] API error:', response.status, errorData);
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

        console.log('[AI Description] Generated:', content);
        return { description: content };

    } catch (error) {
        console.error('[AI Description] Network error:', error);
        return { description: null, error: 'Network error - please try again' };
    }
}
