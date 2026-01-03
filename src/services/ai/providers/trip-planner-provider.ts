/**
 * Trip Planner Provider (OpenRouter)
 *
 * Uses OpenRouter AI to generate optimized trip itineraries
 * based on user's saved places in a city, considering:
 * - Geographic proximity (minimize travel between places)
 * - Time of day appropriateness (no viewpoints at night)
 * - Category balance across days
 * - Meal timing for restaurants
 */

import { TripPlanRequest, TripPlanResult, TimeSlot } from '@/types/trip';
import { PlaceCategory } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'tngtech/deepseek-r1t2-chimera:free';

/**
 * Map categories to their time-of-day constraints
 */
const CATEGORY_TIME_CONSTRAINTS: Record<string, TimeSlot[]> = {
    food: ['morning', 'lunch', 'afternoon', 'evening'],
    nightlife: ['evening', 'night'],
    attractions: ['morning', 'afternoon', 'evening'],
    lodging: ['morning', 'afternoon', 'evening'],
    shopping: ['morning', 'lunch', 'afternoon'],
    outdoors: ['morning', 'afternoon'], // Avoid extreme heat/darkness
    general: ['morning', 'lunch', 'afternoon', 'evening'],
};

/**
 * Categories that should NEVER be scheduled at night
 */
const NO_NIGHT_CATEGORIES = ['outdoors', 'attractions', 'shopping'];

/**
 * Trip Planner AI Provider
 */
export class TripPlannerProvider {
    name = 'trip-planner';

    async generateTripPlan(request: TripPlanRequest): Promise<TripPlanResult> {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

        if (!apiKey) {
            console.error('[Trip Planner] OpenRouter API key not configured');
            throw new Error('OpenRouter API key not configured.');
        }

        console.log('[Trip Planner] Generating plan for:', request.city, request.country);
        console.log('[Trip Planner] Duration:', request.durationDays, 'days');
        console.log('[Trip Planner] Places to schedule:', request.places.length);

        const systemPrompt = this.buildSystemPrompt();
        const userPrompt = this.buildUserPrompt(request);

        try {
            console.log('[Trip Planner] Calling OpenRouter API...');

            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Travelist App - Trip Planner',
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.5, // Lower for more deterministic planning
                    max_tokens: 3000,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[Trip Planner] API error:', response.status, errorData);
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            console.log('[Trip Planner] Response received');

            if (!content) {
                throw new Error('Empty response from API');
            }

            return this.parseResponse(content, request);
        } catch (error) {
            console.error('[Trip Planner] Error:', error);
            throw error;
        }
    }

    private buildSystemPrompt(): string {
        return `You are an expert travel itinerary optimizer. Your job is to:
1. Organize a list of the user's SAVED places into an efficient day-by-day trip schedule
2. Suggest 3-5 ADDITIONAL places that would complement their trip

CRITICAL SCHEDULING RULES:
1. GROUP places by proximity - nearby places should be on the same day to minimize travel
2. ORDER places within each day to create an efficient walking/driving route
3. NEVER schedule viewpoints, outdoor activities, or scenic spots at night (after 18:00)
4. Schedule restaurants around meal times:
   - Breakfast/brunch: 9:00-11:00 (morning)
   - Lunch: 12:00-14:00 (lunch)
   - Dinner: 19:00-21:00 (evening)
5. Schedule nightlife/bars only for evening/night slots (after 18:00)
6. Museums and indoor attractions can be scheduled any time during daylight
7. Outdoor activities should be morning or afternoon (avoid midday heat and darkness)
8. Aim for a balanced number of places per day
9. Prioritize unvisited places over visited ones
10. Consider travel time between places (estimate walking minutes)

TIME SLOTS:
- "morning": 9:00-12:00
- "lunch": 12:00-14:00
- "afternoon": 14:00-18:00
- "evening": 18:00-21:00
- "night": 21:00+

CATEGORY CLASSIFICATIONS:
- food: restaurants, cafes, bakeries → schedule around meal times
- nightlife: bars, clubs → evening/night only
- attractions: museums, landmarks → morning/afternoon/evening (NOT night)
- outdoors: parks, viewpoints, nature → morning/afternoon ONLY (never at night!)
- shopping: stores, markets → daytime only
- lodging: hotels → flexible
- general: treat as attractions

SUGGESTED ADDITIONS RULES:
- Suggest 3-5 REAL, well-known places in the same city that the user HASN'T saved
- These should COMPLEMENT their existing preferences (similar categories/vibes)
- Fill gaps: if they have no lunch spots, suggest restaurants; if all attractions, suggest a cafe break
- Consider proximity to their planned areas
- Explain WHY each suggestion fits their trip

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "days": [
    {
      "dayNumber": 1,
      "theme": "Short descriptive theme like 'Historic Old Town'",
      "neighborhood": "Primary area name",
      "estimatedWalkingMinutes": 45,
      "places": [
        {
          "placeId": "exact-id-from-input",
          "order": 1,
          "suggestedTimeSlot": "morning",
          "suggestedTime": "10:00",
          "travelToNextMinutes": 15
        }
      ]
    }
  ],
  "suggestedAdditions": [
    {
      "name": "Actual Place Name",
      "category": "food",
      "description": "Brief description of what makes this place special",
      "whyItFits": "Explanation of why this complements their trip",
      "suggestedDay": 2,
      "estimatedPriceRange": "$$"
    }
  ]
}`;
    }

    private buildUserPrompt(request: TripPlanRequest): string {
        const { city, country, durationDays, places, placesPerDay = 5, preferences } = request;

        // Format places for context
        const placesContext = places
            .map((p) => {
                let entry = `- ID: "${p.id}" | Name: ${p.name} | Category: ${p.category}`;
                if (p.visited) entry += ' | [VISITED - lower priority]';
                if (p.description) entry += ` | ${p.description}`;
                return entry;
            })
            .join('\n');

        // Category distribution
        const categoryCount: Record<string, number> = {};
        places.forEach((p) => {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });

        const unvisitedCount = places.filter((p) => !p.visited).length;
        const visitedCount = places.filter((p) => p.visited).length;

        let prompt = `TRIP PLANNING REQUEST

Location: ${city}, ${country}
Duration: ${durationDays} days
Target places per day: ${placesPerDay}

PLACES TO SCHEDULE (${places.length} total, ${unvisitedCount} unvisited, ${visitedCount} visited):
${placesContext}

Category breakdown: ${Object.entries(categoryCount)
                .map(([cat, count]) => `${cat}: ${count}`)
                .join(', ')}

REQUIREMENTS:
1. Create a ${durationDays}-day itinerary using ONLY the places listed above
2. Use the EXACT placeId values from the list
3. Group nearby places together on the same day
4. Order places efficiently to minimize walking between them
5. IMPORTANT: Never schedule "outdoors" or "attractions" category places at night
6. Schedule "food" category around meal times
7. Schedule "nightlife" category only for evening/night
8. Prioritize unvisited places`;

        if (preferences?.pacePreference === 'relaxed') {
            prompt += '\n9. User prefers a relaxed pace - schedule fewer places per day (3-4 max)';
        } else if (preferences?.pacePreference === 'packed') {
            prompt += '\n9. User wants a packed schedule - maximize places per day (6-7)';
        }

        prompt += `\n\nGenerate the optimized itinerary now.`;

        return prompt;
    }

    private parseResponse(content: string, request: TripPlanRequest): TripPlanResult {
        let parsed: any;

        try {
            // Strip <think> blocks from DeepSeek R1 models
            let cleanContent = content
                .replace(/<think>[\s\S]*?<\/think>/gi, '')
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            // Try to find JSON object in the response
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanContent = jsonMatch[0];
            }

            console.log('[Trip Planner] Cleaned content length:', cleanContent.length);
            parsed = JSON.parse(cleanContent);
        } catch (e) {
            console.error('[Trip Planner] Failed to parse response:', content.substring(0, 500));
            throw new Error('Failed to parse AI response');
        }

        if (!parsed.days || !Array.isArray(parsed.days)) {
            throw new Error('Invalid response structure - missing days array');
        }

        // Validate placeIds exist in the request
        const validPlaceIds = new Set(request.places.map((p) => p.id));
        const usedPlaceIds = new Set<string>();

        const validatedDays = parsed.days.map((day: any, index: number) => {
            const validPlaces = (day.places || [])
                .filter((p: any) => {
                    // Must be a valid place ID from the request
                    if (!validPlaceIds.has(p.placeId)) return false;

                    // Prevent duplicates across the entire trip
                    if (usedPlaceIds.has(p.placeId)) return false;

                    usedPlaceIds.add(p.placeId);
                    return true;
                })
                .map((p: any, pIndex: number) => ({
                    placeId: p.placeId,
                    order: pIndex + 1,
                    suggestedTimeSlot: this.validateTimeSlot(p.suggestedTimeSlot),
                    suggestedTime: p.suggestedTime || this.getDefaultTime(p.suggestedTimeSlot || 'morning'),
                    travelToNextMinutes: typeof p.travelToNextMinutes === 'number' ? p.travelToNextMinutes : 10,
                }));

            return {
                dayNumber: index + 1,
                theme: day.theme || `Day ${index + 1}`,
                neighborhood: day.neighborhood,
                estimatedWalkingMinutes: day.estimatedWalkingMinutes || validPlaces.length * 15,
                places: validPlaces,
            };
        });

        // Parse suggested additions from AI
        const suggestedAdditions = (parsed.suggestedAdditions || [])
            .filter((s: any) => s.name && typeof s.name === 'string')
            .slice(0, 5)
            .map((s: any) => ({
                name: s.name.trim(),
                category: s.category || 'general',
                description: s.description || '',
                whyItFits: s.whyItFits || 'Would complement your trip',
                suggestedDay: typeof s.suggestedDay === 'number' ? s.suggestedDay : undefined,
                estimatedPriceRange: this.validatePriceRange(s.estimatedPriceRange),
            }));

        return {
            days: validatedDays,
            suggestedAdditions: suggestedAdditions.length > 0 ? suggestedAdditions : undefined,
            generatedAt: new Date().toISOString(),
        };
    }

    private validatePriceRange(price: string | undefined): '$' | '$$' | '$$$' | '$$$$' | undefined {
        const valid = ['$', '$$', '$$$', '$$$$'];
        return price && valid.includes(price) ? (price as '$' | '$$' | '$$$' | '$$$$') : undefined;
    }

    private validateTimeSlot(slot: string | undefined): TimeSlot {
        const valid: TimeSlot[] = ['morning', 'lunch', 'afternoon', 'evening', 'night'];
        return valid.includes(slot as TimeSlot) ? (slot as TimeSlot) : 'afternoon';
    }

    private getDefaultTime(slot: TimeSlot): string {
        const times: Record<TimeSlot, string> = {
            morning: '10:00',
            lunch: '12:30',
            afternoon: '15:00',
            evening: '19:00',
            night: '21:30',
        };
        return times[slot] || '14:00';
    }
}

// Export singleton instance
export const tripPlannerProvider = new TripPlannerProvider();
