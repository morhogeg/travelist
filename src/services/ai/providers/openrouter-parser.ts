/**
 * OpenRouter Provider for parsing free-text recommendations using Grok
 */

import { PlaceCategory } from '../types';
import { SourceType, RecommendationSource } from '@/utils/recommendation/types';
import { callOpenRouter, OpenRouterMessage } from '../openrouter-client';

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

CRITICAL: Extract name, city, and country from Google Maps URLs.

PARSING GOOGLE MAPS ADDRESSES:
The URL format is: /place/Name,+Street,+City,+Country/ OR /place/Name,+Street,+City/

IMPORTANT: Not all URLs include the country! When country is missing, you MUST infer it from the city.

EXAMPLES:
1. /place/Villa+Mare,+Derech+Ben+Gurion+69,+Bat+Yam/
   → name: "Villa Mare", city: "Bat Yam", country: "Israel"
   (Bat Yam is an Israeli city, so country = "Israel")

2. /place/Café+Central,+Herrengasse+14,+Vienna/
   → name: "Café Central", city: "Vienna", country: "Austria"
   (Vienna is in Austria)

3. /place/Joe's+Pizza,+7+Carmine+St,+New+York,+USA/
   → name: "Joe's Pizza", city: "New York", country: "USA"

HOW TO PARSE:
- First segment = place name
- Last segment = check if it's a COUNTRY or a CITY:
  - If it's a country name (Israel, USA, UK, Italy, etc.) → use as country, previous segment = city
  - If it's a city name → use as city, infer country from city
- Middle segments = street address (ignore)

ISRAELI CITIES (country = "Israel"):
Tel Aviv, Jerusalem, Haifa, Bat Yam, Netanya, Herzliya, Ramat Gan, Eilat, Beersheba, Ashdod, Ashkelon, Petah Tikva, Rishon LeZion, Holon, Bnei Brak, Ra'anana, Kfar Saba, Givatayim

COMMON COUNTRIES:
Israel, USA, UK, Italy, France, Spain, Germany, Austria, Greece, Portugal, Japan, Thailand, Vietnam, Turkey, Netherlands, Belgium, Switzerland

Categories: food, nightlife, attractions, lodging, shopping, outdoors, general

Respond ONLY with JSON array:
[{"name": "Place Name", "category": "general", "confidence": 0.9, "city": "City Name", "country": "Country Name"}]

If cannot extract place name, respond: []`;

const FREEFORM_TEXT_PROMPT = `You are a travel recommendation parser that extracts place info from natural language text (e.g., Instagram captions, friend recommendations, messages).

Extract place names, cities, countries, categories, tips, and sources from descriptive text.

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
- instagram: saw on Instagram or shared from Instagram app
- tiktok: saw on TikTok
- youtube: saw on YouTube
- blog: read in a blog or article
- article: read in news/magazine
- email: received via email
- text: received via text message
- other: any other source mentioned

RULES:
1. Extract the actual place NAME (e.g., "Amazing café called Café Central" → name: "Café Central")
2. Look for city and country mentions (e.g., "in Barcelona", "Tel Aviv", "Israel")
3. If city/country not explicitly mentioned, try to infer from context or hashtags (#barcelona, #telaviv)
4. Extract TIPS from descriptive text:
   - "try the shakshuka" → tip: "Try the shakshuka"
   - "best coffee in town" → tip: "Great coffee"
   - "go for sunset" → tip: "Go for sunset"
5. Extract SOURCE if mentioned:
   - "via @username" → source: {type: "instagram", name: "@username"}
   - "my friend Sarah recommended" → source: {type: "friend", name: "Sarah"}
6. Handle emojis and hashtags gracefully (ignore or use for context)
7. Confidence: 1.0 if clear, 0.7-0.9 if inferred, 0.5 if uncertain
8. LANGUAGE: Keep tips in the SAME LANGUAGE as input

EXAMPLES:
- "Found this amazing café in Barcelona! ☕ Café Federal on Carrer del Parlament - amazing brunch spot. Highly recommend the shakshuka! 🍳 #barcelona #foodie"
  → [{"name": "Café Federal", "city": "Barcelona", "category": "food", "tip": "Highly recommend the shakshuka", "confidence": 0.95}]

- "Villa Mare in Bat Yam has the best seafood!via @foodie_israel"
  → [{"name": "Villa Mare", "city": "Bat Yam", "country": "Israel", "category": "food", "tip": "Best seafood", "source": {"type": "instagram", "name": "@foodie_israel"}, "confidence": 0.9}]

Respond ONLY with valid JSON array:
[{"name": "Place Name", "city": "City", "country": "Country", "category": "food", "confidence": 0.9, "tip": "Try X", "source": {"type": "friend", "name": "Sarah"}}]

Omit source field if no source. Omit tip if no specific recommendation. Omit city/country if truly unable to determine (but try hard to infer from context/hashtags).`;


/**
 * Parse free-text recommendations using AI via OpenRouter
 */
export async function parseWithDeepSeek(
  text: string,
  city: string,
  country: string
): Promise<ParseResult> {
  console.log('[Parser] Starting parseWithDeepSeek');

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: BASE_SYSTEM_PROMPT },
    { role: 'user', content: `Location: ${city}, ${country}\n\nParse these recommendations:\n${text}` }
  ];

  const result = await callOpenRouter(messages, { temperature: 0.1 });

  if (result.error) {
    return { places: [], error: result.error, model: result.model };
  }

  return processAIResult(result.content, text, result.model);
}

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

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const result = await callOpenRouter(messages, { temperature: 0.1, max_tokens: 900 });

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
