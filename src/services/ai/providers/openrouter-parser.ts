/**
 * OpenRouter Provider for parsing free-text recommendations using Grok
 */

import { PlaceCategory } from '../types';
import { SourceType, RecommendationSource } from '@/utils/recommendation/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Gemma 3 27B via OpenRouter (free tier) - excellent JSON extraction
const MODEL = 'google/gemma-3-27b-it:free';

export interface ParsedPlace {
  name: string;
  category: PlaceCategory;
  confidence: number;
  originalText: string;
  description?: string;
  source?: RecommendationSource;
  city?: string;
  country?: string;
}

export interface ParseResult {
  places: ParsedPlace[];
  error?: string;
  model?: string; // For debugging - shows which model was used
}

/**
 * Shared prompt for standard parsing (city/country provided).
 */
const BASE_SYSTEM_PROMPT = `You are a travel recommendation parser. Extract place names, categories, source attribution, and tips from user input.

Categories (use exactly these lowercase values):
- food: restaurants, cafes, bakeries, any eating establishment
- nightlife: bars, clubs, pubs, lounges
- attractions: museums, landmarks, monuments, tourist sites
- lodging: hotels, hostels, B&Bs, accommodations
- shopping: stores, malls, markets, boutiques
- outdoors: parks, beaches, hiking trails, nature spots
- general: anything that doesn't fit above

Source types (use exactly these lowercase values if detected):
- friend: recommended by a person (extract their name if mentioned)
- instagram: saw on Instagram
- tiktok: saw on TikTok
- youtube: saw on YouTube
- blog: read in a blog or article
- article: read in news/magazine
- email: received via email
- text: received via text message
- other: any other source mentioned

Rules:
1. Extract the actual place NAME, not the action (e.g., "eat at Luigi's" → name is "Luigi's")
2. Remove action words: eat at, visit, check out, try, go to, stay at, etc.
3. Keep the authentic name (preserve accents, apostrophes, "&" symbols)
4. If multiple places mentioned, extract each separately
5. Infer category from context clues
6. Confidence: 1.0 if clear, 0.7-0.9 if inferred, 0.5 if uncertain
7. IMPORTANT: Extract source if WHO recommended it or WHERE they heard about it is mentioned:
   - "Sarah told me about X" → source: {type: "friend", name: "Sarah"}
   - "saw X on Instagram" → source: {type: "instagram", name: "Instagram"}
8. IMPORTANT: Extract TIPS - if the text mentions what to order, what to see, best time to go, or any specific item/dish/activity:
   - "the falafel at X is great" → tip: "Get the falafel"
   - "X has amazing sunset views" → tip: "Go for sunset views"
   - "try the pasta at X" → tip: "Try the pasta"
   - "X is best on weekends" → tip: "Best on weekends"
   - "the rooftop bar at X" → tip: "Check out the rooftop bar"
   - "recommending pizza at X" → tip: "Try the pizza"
   - "X for the pizza" → tip: "Get the pizza"
   - "for coffee at X" → tip: "Try the coffee"
   Write tips as actionable advice (start with verbs like "Try", "Get", "Order", "Visit", "Go for")
   If a specific food item, drink, or activity is mentioned in connection with the place, ALWAYS extract it as a tip.
9. LANGUAGE: Keep tips in the SAME LANGUAGE as the user's input. If input is in Hebrew, write tip in Hebrew. If in Spanish, write in Spanish. Never translate.

Respond ONLY with valid JSON array, no markdown, no explanation:
[{"name": "Place Name", "category": "food", "confidence": 0.9, "tip": "Try the falafel", "source": {"type": "friend", "name": "Sarah"}}]

Omit source field if no source mentioned. Omit tip field if no specific recommendation mentioned.`;

const SHARE_SYSTEM_PROMPT = `${BASE_SYSTEM_PROMPT}

Additional rules for shared text without guaranteed location:
10. Infer CITY and COUNTRY only if the text clearly mentions them (e.g., "in Rome" → city: "Rome", country: "Italy" if obvious). If not present, leave city and country as empty strings.
11. If only city is clear but country isn't, fill city and leave country empty.
12. Never hallucinate locations; keep them blank if uncertain.
13. Always include "city" and "country" keys in each object, even if blank strings.

Respond with a JSON array where each object includes: name, category, confidence, tip/description (optional), source (optional), city, country.`;

/**
 * Parse free-text recommendations using Grok via OpenRouter
 */
export async function parseWithDeepSeek(
  text: string,
  city: string,
  country: string
): Promise<ParseResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('[DeepSeek Parser] OpenRouter API key not configured');
    return { places: [], error: 'API key not configured' };
  }

  console.log('[DeepSeek Parser] Starting parse with model:', MODEL);
  console.log('[DeepSeek Parser] Input text:', text);

  const userPrompt = `Location: ${city}, ${country}

Parse these recommendations:
${text}`;

  try {
    console.log('[DeepSeek Parser] Calling OpenRouter API...');

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Travelist App'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: BASE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DeepSeek Parser] API error:', response.status, errorData);
      return { places: [], error: `API error: ${response.status} - ${errorData?.error?.message || 'Unknown'}` };
    }

    const data = await response.json();
    const actualModel = data.model || MODEL;
    const content = data.choices?.[0]?.message?.content;

    console.log('[DeepSeek Parser] Response received from model:', actualModel);
    console.log('[DeepSeek Parser] Raw response:', content);

    if (!content) {
      return { places: [], error: 'Empty response from API', model: actualModel };
    }

    // Parse the JSON response
    let parsed: any[];
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error('[DeepSeek Parser] Failed to parse response:', content);
      return { places: [], error: 'Failed to parse response', model: actualModel };
    }

    // Validate and normalize the response
    const places: ParsedPlace[] = parsed
      .filter((p: any) => p.name && typeof p.name === 'string')
      .map((p: any, index: number) => {
        const place: ParsedPlace = {
          name: p.name.trim(),
          category: validateCategory(p.category),
          confidence: typeof p.confidence === 'number' ? p.confidence : 0.8,
          originalText: text.split('\n')[index] || text,
          // Use tip field if present, fallback to description
          description: p.tip || p.description || undefined,
          city: p.city || p.location?.city,
          country: p.country || p.location?.country,
        };

        // Add source if present and valid
        if (p.source && p.source.type) {
          const sourceType = validateSourceType(p.source.type);
          // Capitalize source name for display (e.g., "article" → "Article")
          const sourceName = p.source.name || sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
          place.source = {
            type: sourceType,
            name: sourceName,
            relationship: p.source.relationship,
            url: p.source.url
          };
        }

        return place;
      });

    console.log('[DeepSeek Parser] Parsed places:', places);
    return { places, model: actualModel };
  } catch (error) {
    console.error('[DeepSeek Parser] Network error:', error);
    return { places: [], error: 'Network error' };
  }
}

/**
 * Parse shared text (no guaranteed location) and infer city/country when present.
 */
export async function parseSharedText(text: string): Promise<ParseResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('[DeepSeek Parser] OpenRouter API key not configured');
    return { places: [], error: 'API key not configured' };
  }

  console.log('[DeepSeek Parser] Starting shared-text parse with model:', MODEL);
  console.log('[DeepSeek Parser] Shared input:', text);

  const userPrompt = `A user shared this message. Extract place names and infer city/country if the text mentions them. If missing, leave city and country blank.

Shared text:
${text}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Travelist App'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SHARE_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 900
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[DeepSeek Parser] Shared-text API error:', response.status, errorData);
      return { places: [], error: `API error: ${response.status} - ${errorData?.error?.message || 'Unknown'}` };
    }

    const data = await response.json();
    const actualModel = data.model || MODEL;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { places: [], error: 'Empty response from API', model: actualModel };
    }

    let parsed: any[];
    try {
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleanContent);
    } catch (e) {
      console.error('[DeepSeek Parser] Failed to parse shared response:', content);
      return { places: [], error: 'Failed to parse response', model: actualModel };
    }

    const places: ParsedPlace[] = parsed
      .filter((p: any) => p.name && typeof p.name === 'string')
      .map((p: any) => {
        const place: ParsedPlace = {
          name: p.name.trim(),
          category: validateCategory(p.category),
          confidence: typeof p.confidence === 'number' ? p.confidence : 0.8,
          originalText: text,
          description: p.tip || p.description || undefined,
          city: (p.city ?? '').trim() || (p.location?.city ?? '').trim() || undefined,
          country: (p.country ?? '').trim() || (p.location?.country ?? '').trim() || undefined,
        };

        if (p.source && p.source.type) {
          const sourceType = validateSourceType(p.source.type);
          const sourceName = p.source.name || sourceType.charAt(0).toUpperCase() + sourceType.slice(1);
          place.source = {
            type: sourceType,
            name: sourceName,
            relationship: p.source.relationship,
            url: p.source.url
          };
        }

        return place;
      });

    console.log('[DeepSeek Parser] Shared-text parsed places:', places);
    return { places, model: actualModel };
  } catch (error) {
    console.error('[DeepSeek Parser] Shared-text network error:', error);
    return { places: [], error: 'Network error' };
  }
}

/**
 * Validate and normalize category
 */
function validateCategory(category: string): PlaceCategory {
  const valid: PlaceCategory[] = ['food', 'nightlife', 'attractions', 'lodging', 'shopping', 'outdoors', 'general'];
  const normalized = category?.toLowerCase() as PlaceCategory;
  return valid.includes(normalized) ? normalized : 'general';
}

/**
 * Validate and normalize source type
 */
function validateSourceType(type: string): SourceType {
  const valid: SourceType[] = ['friend', 'instagram', 'blog', 'email', 'text', 'tiktok', 'youtube', 'article', 'ai', 'other'];
  const normalized = type?.toLowerCase() as SourceType;
  return valid.includes(normalized) ? normalized : 'other';
}
