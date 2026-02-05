/**
 * Gemini Provider for parsing free-text recommendations
 * Uses Gemini 3 Flash with Google Search grounding
 */

import { PlaceCategory } from '../types';
import { SourceType, RecommendationSource } from '@/utils/recommendation/types';
import { callGemini, GeminiMessage } from '../gemini-client';

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

const SHARE_SYSTEM_PROMPT = `You are a travel recommendation parser that extracts place info from shared URLs.

CRITICAL: Extract name, city, and country from Google Maps URLs. Use Google Search to verify the location details.

PARSING RULES:
1. STRICTLY SEPARATE the Name, City, and Country.
2. The "Name" field must NOT contain the city or country.
3. If the input is "Cafe Trumpeldor, Trumpeldor St 6, Tel Aviv", the Name is ONLY "Cafe Trumpeldor".
4. Infer country if missing (e.g., Tel Aviv -> Israel, Paris -> France).

EXAMPLES:
1. /place/Villa+Mare,+Derech+Ben+Gurion+69,+Bat+Yam/
   → name: "Villa Mare", city: "Bat Yam", country: "Israel"

2. /place/Café+Central,+Herrengasse+14,+Vienna/
   → name: "Café Central", city: "Vienna", country: "Austria"

3. /place/Joe's+Pizza,+7+Carmine+St,+New+York,+USA/
   → name: "Joe's Pizza", city: "New York", country: "USA"

Categories: food, nightlife, attractions, lodging, shopping, outdoors, general

Respond ONLY with JSON array:
[{"name": "Place Name", "category": "general", "confidence": 0.9, "city": "City Name", "country": "Country Name"}]

If cannot extract place name, respond: []`;

const FREEFORM_TEXT_PROMPT = `You are a travel recommendation parser that extracts place info from natural language text.

Extract separate fields for Name, City, and Country.

RULES:
1. Extract the actual place NAME (e.g., "Amazing café called Café Central" → name: "Café Central").
2. DO NOT include the city or country in the "Name" field.
   - WRONG: name: "Cafe Trumpeldor, Tel Aviv"
   - RIGHT: name: "Cafe Trumpeldor", city: "Tel Aviv"
3. Look for city and country mentions and extract them into their own fields.
4. Extract TIPS from descriptive text.
5. Extract SOURCE if mentioned.

Categories: food, nightlife, attractions, lodging, shopping, outdoors, general

Source types: friend, instagram, tiktok, youtube, blog, article, email, text, other

Respond ONLY with valid JSON array:
[{"name": "Place Name", "city": "City", "country": "Country", "category": "food", "confidence": 0.9, "tip": "Try X", "source": {"type": "friend", "name": "Sarah"}}]

Omit source field if no source. Omit tip if no specific recommendation.`;


/**
 * Parse free-text recommendations using AI via Gemini
 */
export async function parseWithGemini(
  text: string,
  city: string,
  country: string
): Promise<ParseResult> {
  console.log('[Parser] Starting parseWithGemini');

  const messages: GeminiMessage[] = [
    { role: 'system', content: BASE_SYSTEM_PROMPT },
    { role: 'user', content: `Location: ${city}, ${country}\n\nParse these recommendations:\n${text}` }
  ];

  const result = await callGemini(messages, {
    temperature: 0.1,
    thinkingLevel: 'low',
    enableGrounding: true,
  });

  if (result.error) {
    return { places: [], error: result.error, model: result.model };
  }

  return processAIResult(result.content, text, result.model);
}

// Keep old function name for backward compatibility
export const parseWithDeepSeek = parseWithGemini;

/**
 * Parse shared text (no guaranteed location) and infer city/country when present.
 */
export async function parseSharedText(text: string): Promise<ParseResult> {
  // Detect if input is URL or freeform text
  const urlPattern = /https?:\/\/[^\s]+/;
  const hasURL = urlPattern.test(text);
  const inputType = hasURL ? 'url' : 'text';

  console.log('[Parser] Detected input type:', inputType);

  const systemPrompt = inputType === 'url' ? SHARE_SYSTEM_PROMPT : FREEFORM_TEXT_PROMPT;
  const userPrompt = inputType === 'url'
    ? `Extract place information from this Google Maps URL.\n\nCRITICAL: The last segment may be a CITY (not a country). If it's a city like "Bat Yam", "Tel Aviv", etc., set it as city and infer country = "Israel".\n\nExample: /place/Villa+Mare,+Derech+Ben+Gurion+69,+Bat+Yam/\n→ name: "Villa Mare", city: "Bat Yam", country: "Israel"\n\nShared URL:\n${text}`
    : `Extract place information from this text:\n\n${text}`;

  const messages: GeminiMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const result = await callGemini(messages, {
    temperature: 0.1,
    maxOutputTokens: 900,
    thinkingLevel: 'low',
    enableGrounding: true, // Use Google Search to verify location
  });

  if (result.error) {
    return { places: [], error: result.error, model: result.model };
  }

  return processAIResult(result.content, text, result.model);
}

/**
 * Common helper to process AI JSON response
 */
function processAIResult(content: string, originalText: string, model: string): ParseResult {
  if (!content) {
    return { places: [], error: 'Empty response from API', model };
  }

  let parsed: unknown[];
  try {
    // Clean the response - handle various AI response formats
    let cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find the first [ and extract from there to handle preamble text
    const arrayStart = cleanContent.indexOf('[');
    const arrayEnd = cleanContent.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      cleanContent = cleanContent.substring(arrayStart, arrayEnd + 1);
    }

    const data = JSON.parse(cleanContent);
    parsed = Array.isArray(data) ? data : [data];
  } catch (e) {
    console.error('[Parser] Failed to parse response:', content);
    return { places: [], error: 'Failed to parse AI response', model };
  }

  interface AIResponsePlace {
    name: string;
    category: string;
    confidence?: number;
    tip?: string;
    description?: string;
    city?: string;
    country?: string;
    location?: {
      city?: string;
      country?: string;
    };
    source?: {
      type: string;
      name?: string;
      relationship?: string;
      url?: string;
    };
  }

  const places: ParsedPlace[] = (parsed as AIResponsePlace[])
    .filter((p) => p && p.name && typeof p.name === 'string')
    .map((p, index: number) => {
      const place: ParsedPlace = {
        name: p.name.trim(),
        category: validateCategory(p.category),
        confidence: typeof p.confidence === 'number' ? p.confidence : 0.8,
        originalText: originalText.split('\n')[index] || originalText,
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

  console.log('[Parser] Successfully parsed places:', places, 'with model:', model);
  return { places, model };
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
