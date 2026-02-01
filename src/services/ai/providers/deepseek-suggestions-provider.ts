import {
  LLMProvider,
  AISuggestionRequest,
  AISuggestionResult,
  AISuggestion,
  PlaceCategory,
} from '../types';
import { callOpenRouter, OpenRouterMessage } from '../openrouter-client';

/**
 * Generates a unique ID for suggestions
 */
function generateId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
 * Validate price range
 */
function validatePriceRange(price: string | undefined): '$' | '$$' | '$$$' | '$$$$' | undefined {
  const valid = ['$', '$$', '$$$', '$$$$'];
  return price && valid.includes(price) ? price as '$' | '$$' | '$$$' | '$$$$' : undefined;
}

/**
 * Grok LLM Provider implementation
 */
export class DeepSeekSuggestionsProvider implements LLMProvider {
  name = 'grok';

  async generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult> {
    console.log('[AI Suggestions] Generating suggestions for:', request.cityName, request.countryName);
    console.log('[AI Suggestions] Based on saved places:', request.savedPlaces.map(p => p.name));

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request);

    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const result = await callOpenRouter(messages, {
        temperature: 0.7,
        max_tokens: 2000
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.content) {
        throw new Error('Empty response from API');
      }

      // Parse the JSON response
      const suggestions = this.parseResponse(result.content, request.maxSuggestions || 5);

      console.log('[AI Suggestions] Parsed suggestions:', suggestions);

      return {
        suggestions,
        cityName: request.cityName,
        countryName: request.countryName,
        generatedAt: new Date().toISOString(),
        basedOnPlaces: request.savedPlaces.map(p => p.name),
      };
    } catch (error) {
      console.error('[AI Suggestions] Error:', error);
      throw error;
    }
  }

  private buildSystemPrompt(): string {
    return `You are a knowledgeable travel recommendation AI. Your job is to suggest places a traveler would enjoy based on places they've already saved for a city.

IMPORTANT GUIDELINES:
1. Suggest REAL, ACTUAL places that exist - not generic placeholders
2. Each suggestion should be a specific named establishment or location
3. Analyze the saved places to understand the user's preferences (budget, cuisine types, activity preferences, etc.)
4. Recommend places that complement their existing list - similar vibes but different venues
5. Include a mix of categories unless the user clearly prefers one type
6. The "whyRecommended" field should specifically reference their saved places and explain the connection

Categories (use exactly these lowercase values):
- food: restaurants, cafes, bakeries, any eating establishment
- nightlife: bars, clubs, pubs, lounges
- attractions: museums, landmarks, monuments, tourist sites, experiences
- lodging: hotels, hostels, B&Bs, accommodations
- shopping: stores, malls, markets, boutiques
- outdoors: parks, beaches, hiking trails, nature spots
- general: anything that doesn't fit above

Price ranges:
- $: Budget-friendly
- $$: Moderate
- $$$: Upscale
- $$$$: Luxury

Tags should be 2-3 descriptive words like: "local favorite", "hidden gem", "romantic", "casual", "trendy", "historic", "scenic", etc.

Respond ONLY with a valid JSON array, no markdown, no explanation:
[
  {
    "name": "Actual Place Name",
    "category": "food",
    "description": "Brief 1-2 sentence description of what makes this place special",
    "whyRecommended": "Explanation connecting to their saved places",
    "estimatedPriceRange": "$$",
    "tags": ["local favorite", "casual"]
  }
]`;
  }

  private buildUserPrompt(request: AISuggestionRequest): string {
    const { cityName, countryName, savedPlaces, maxSuggestions = 5, excludeCategories } = request;

    // Format saved places for context
    const placesContext = savedPlaces.map(p => {
      let entry = `- ${p.name} (${p.category})`;
      if (p.description) entry += `: ${p.description}`;
      if (p.visited) entry += ' [visited]';
      return entry;
    }).join('\n');

    // Category analysis
    const categoryCount: Record<string, number> = {};
    savedPlaces.forEach(p => {
      const cat = p.category.toLowerCase();
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat} (${count})`)
      .join(', ');

    let prompt = `Location: ${cityName}, ${countryName}

The user has saved these ${savedPlaces.length} places:
${placesContext}

Their top interests appear to be: ${topCategories || 'varied'}

Please suggest ${maxSuggestions} additional places they would likely enjoy in ${cityName}.`;

    if (excludeCategories && excludeCategories.length > 0) {
      prompt += `\n\nDo NOT suggest places in these categories: ${excludeCategories.join(', ')}`;
    }

    prompt += `\n\nFocus on real, well-known establishments that match their apparent preferences. Each suggestion should have a clear connection to their existing saved places.`;

    return prompt;
  }

  private parseResponse(content: string, maxSuggestions: number): AISuggestion[] {
    let parsed: unknown[];

    try {
      const cleanContent = content
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Strip reasoning blocks
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      const data = JSON.parse(cleanContent);
      parsed = Array.isArray(data) ? data : [data];
    } catch (e) {
      console.error('[DeepSeek Suggestions] Failed to parse response:', content);
      throw new Error('Failed to parse AI response');
    }

    // Validate and normalize the response
    const suggestions: AISuggestion[] = (parsed as any[])
      .filter((s: any) => s.name && typeof s.name === 'string')
      .slice(0, maxSuggestions)
      .map((s: any) => ({
        id: generateId(),
        name: s.name.trim(),
        category: validateCategory(s.category),
        description: s.description || 'A local favorite worth checking out.',
        whyRecommended: s.whyRecommended || 'Recommended based on your saved places',
        estimatedPriceRange: validatePriceRange(s.estimatedPriceRange),
        tags: Array.isArray(s.tags) ? s.tags.slice(0, 3) : undefined,
      }));

    return suggestions;
  }
}

// Export singleton instance
export const deepSeekSuggestionsProvider = new DeepSeekSuggestionsProvider();
