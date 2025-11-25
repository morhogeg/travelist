/**
 * Mock LLM Provider
 *
 * Provides realistic-looking AI suggestions for development and testing.
 * Designed to be easily swapped with a real LLM provider later.
 */

import {
  LLMProvider,
  AISuggestionRequest,
  AISuggestionResult,
  AISuggestion,
  PlaceCategory,
} from '../types';

// Mock data organized by city and category
const MOCK_SUGGESTIONS: Record<string, Record<PlaceCategory, AISuggestion[]>> = {
  // Default suggestions for any city
  default: {
    food: [
      {
        id: 'mock-food-1',
        name: 'The Local Kitchen',
        category: 'food',
        description: 'Farm-to-table restaurant showcasing regional ingredients with modern techniques.',
        whyRecommended: 'Based on your interest in authentic local cuisine',
        estimatedPriceRange: '$$',
        tags: ['local favorite', 'farm-to-table'],
      },
      {
        id: 'mock-food-2',
        name: 'Street Food Market',
        category: 'food',
        description: 'Bustling market with dozens of local vendors serving traditional dishes.',
        whyRecommended: 'You seem to enjoy casual dining experiences',
        estimatedPriceRange: '$',
        tags: ['casual', 'authentic'],
      },
      {
        id: 'mock-food-3',
        name: 'Chef\'s Table Experience',
        category: 'food',
        description: 'Intimate fine dining with a seasonal tasting menu.',
        whyRecommended: 'For a special occasion based on your saved upscale spots',
        estimatedPriceRange: '$$$$',
        tags: ['fine dining', 'special occasion'],
      },
    ],
    lodging: [
      {
        id: 'mock-lodging-1',
        name: 'Boutique Heritage Hotel',
        category: 'lodging',
        description: 'Charming hotel in a restored historic building with modern amenities.',
        whyRecommended: 'Matches your preference for unique accommodations',
        estimatedPriceRange: '$$$',
        tags: ['boutique', 'historic'],
      },
      {
        id: 'mock-lodging-2',
        name: 'Central Luxury Suites',
        category: 'lodging',
        description: 'Modern apartments in the heart of the city with stunning views.',
        whyRecommended: 'Great location near your saved attractions',
        estimatedPriceRange: '$$',
        tags: ['central', 'modern'],
      },
    ],
    attractions: [
      {
        id: 'mock-attractions-1',
        name: 'Historic Old Town Walking Tour',
        category: 'attractions',
        description: 'Guided tour through centuries-old streets and hidden courtyards.',
        whyRecommended: 'You\'ve saved several cultural sites in this area',
        tags: ['cultural', 'walking tour'],
      },
      {
        id: 'mock-attractions-2',
        name: 'Local Art Museum',
        category: 'attractions',
        description: 'Contemporary art space featuring local and international artists.',
        whyRecommended: 'Based on your interest in cultural experiences',
        tags: ['art', 'culture'],
      },
      {
        id: 'mock-attractions-3',
        name: 'Sunset Viewpoint',
        category: 'attractions',
        description: 'Popular spot for panoramic city views, especially at golden hour.',
        whyRecommended: 'A must-see landmark for any visitor',
        tags: ['scenic', 'photography'],
      },
    ],
    shopping: [
      {
        id: 'mock-shopping-1',
        name: 'Artisan Market District',
        category: 'shopping',
        description: 'Neighborhood known for handcrafted goods and local designers.',
        whyRecommended: 'Great for unique souvenirs and local crafts',
        estimatedPriceRange: '$$',
        tags: ['artisan', 'local'],
      },
      {
        id: 'mock-shopping-2',
        name: 'Vintage Collective',
        category: 'shopping',
        description: 'Curated vintage clothing and antiques from local collectors.',
        whyRecommended: 'For unique finds you won\'t see elsewhere',
        estimatedPriceRange: '$$',
        tags: ['vintage', 'unique'],
      },
    ],
    nightlife: [
      {
        id: 'mock-nightlife-1',
        name: 'Rooftop Cocktail Lounge',
        category: 'nightlife',
        description: 'Sophisticated bar with craft cocktails and city views.',
        whyRecommended: 'Perfect for evening drinks based on your saved restaurants',
        estimatedPriceRange: '$$$',
        tags: ['rooftop', 'cocktails'],
      },
      {
        id: 'mock-nightlife-2',
        name: 'Live Music Venue',
        category: 'nightlife',
        description: 'Intimate space hosting local and touring musicians nightly.',
        whyRecommended: 'For experiencing the local music scene',
        estimatedPriceRange: '$$',
        tags: ['live music', 'local scene'],
      },
    ],
    outdoors: [
      {
        id: 'mock-outdoors-1',
        name: 'City Park & Gardens',
        category: 'outdoors',
        description: 'Beautiful green space perfect for morning walks or picnics.',
        whyRecommended: 'A peaceful escape from the city bustle',
        tags: ['nature', 'relaxing'],
      },
      {
        id: 'mock-outdoors-2',
        name: 'River Walk Trail',
        category: 'outdoors',
        description: 'Scenic walking path along the waterfront with cafes along the way.',
        whyRecommended: 'Great for combining exercise with sightseeing',
        tags: ['walking', 'scenic'],
      },
    ],
    general: [
      {
        id: 'mock-general-1',
        name: 'Neighborhood Food Tour',
        category: 'general',
        description: 'Small group tour sampling local specialties with a knowledgeable guide.',
        whyRecommended: 'Combines your interests in food and local culture',
        estimatedPriceRange: '$$',
        tags: ['food tour', 'local guide'],
      },
    ],
  },
  // City-specific suggestions for more realistic results
  paris: {
    food: [
      {
        id: 'paris-food-1',
        name: 'Le Petit Cler',
        category: 'food',
        description: 'Beloved neighborhood bistro on rue Cler known for classic French comfort food.',
        whyRecommended: 'A local favorite matching your saved French restaurants',
        estimatedPriceRange: '$$',
        tags: ['bistro', 'classic french'],
      },
      {
        id: 'paris-food-2',
        name: 'Du Pain et des Idées',
        category: 'food',
        description: 'Historic bakery famous for escargot pastries and sourdough bread.',
        whyRecommended: 'Essential Parisian bakery experience',
        estimatedPriceRange: '$',
        tags: ['bakery', 'pastries'],
      },
    ],
    attractions: [
      {
        id: 'paris-attractions-1',
        name: 'Musée de l\'Orangerie',
        category: 'attractions',
        description: 'Home to Monet\'s stunning Water Lilies murals in natural light.',
        whyRecommended: 'Complements your interest in art and culture',
        tags: ['museum', 'impressionism'],
      },
    ],
    nightlife: [
      {
        id: 'paris-nightlife-1',
        name: 'Little Red Door',
        category: 'nightlife',
        description: 'Speakeasy-style cocktail bar in the Marais with creative drinks.',
        whyRecommended: 'For an intimate evening after dinner',
        estimatedPriceRange: '$$$',
        tags: ['speakeasy', 'cocktails'],
      },
    ],
    shopping: [],
    lodging: [],
    outdoors: [],
    general: [],
  },
  tokyo: {
    food: [
      {
        id: 'tokyo-food-1',
        name: 'Afuri Ramen',
        category: 'food',
        description: 'Famous for yuzu shio ramen with a lighter, citrus-infused broth.',
        whyRecommended: 'Highly rated ramen spot based on your Japanese food preferences',
        estimatedPriceRange: '$',
        tags: ['ramen', 'casual'],
      },
      {
        id: 'tokyo-food-2',
        name: 'Tsukiji Outer Market',
        category: 'food',
        description: 'Vibrant food market with fresh sushi, tamagoyaki, and street food.',
        whyRecommended: 'For authentic Japanese market experience',
        estimatedPriceRange: '$',
        tags: ['market', 'seafood'],
      },
    ],
    attractions: [
      {
        id: 'tokyo-attractions-1',
        name: 'teamLab Borderless',
        category: 'attractions',
        description: 'Immersive digital art museum with no boundaries between exhibits.',
        whyRecommended: 'Unique art experience matching your cultural interests',
        tags: ['art', 'immersive'],
      },
    ],
    nightlife: [
      {
        id: 'tokyo-nightlife-1',
        name: 'Golden Gai',
        category: 'nightlife',
        description: 'Network of tiny bars in Shinjuku, each with unique character.',
        whyRecommended: 'Authentic Tokyo nightlife experience',
        estimatedPriceRange: '$$',
        tags: ['bars', 'local'],
      },
    ],
    shopping: [],
    lodging: [],
    outdoors: [],
    general: [],
  },
};

/**
 * Generates a unique ID for suggestions
 */
function generateId(): string {
  return `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Personalizes the "why recommended" text based on saved places
 */
function personalizeRecommendation(
  suggestion: AISuggestion,
  savedPlaces: { name: string; category: string }[]
): AISuggestion {
  const sameCategory = savedPlaces.filter(p =>
    p.category.toLowerCase() === suggestion.category.toLowerCase()
  );

  let whyRecommended = suggestion.whyRecommended;

  if (sameCategory.length > 0) {
    const placeNames = sameCategory.slice(0, 2).map(p => p.name);
    whyRecommended = `Similar to ${placeNames.join(' and ')} in your saved places`;
  }

  return {
    ...suggestion,
    id: generateId(),
    whyRecommended,
  };
}

/**
 * Mock LLM Provider implementation
 */
export class MockLLMProvider implements LLMProvider {
  name = 'mock';

  async generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    const cityKey = request.cityName.toLowerCase().replace(/\s+/g, '');
    const cityData = MOCK_SUGGESTIONS[cityKey] || MOCK_SUGGESTIONS.default;

    // Collect suggestions from all categories
    const allSuggestions: AISuggestion[] = [];

    const categories: PlaceCategory[] = [
      'food', 'attractions', 'nightlife', 'shopping', 'outdoors', 'lodging', 'general'
    ];

    for (const category of categories) {
      // Skip excluded categories
      if (request.excludeCategories?.includes(category)) continue;

      // Get city-specific or default suggestions
      const categorySuggestions = cityData[category]?.length > 0
        ? cityData[category]
        : MOCK_SUGGESTIONS.default[category];

      // Personalize and add suggestions
      const personalized = categorySuggestions.map(s =>
        personalizeRecommendation(s, request.savedPlaces)
      );

      allSuggestions.push(...personalized);
    }

    // Shuffle and limit results
    const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, request.maxSuggestions || 5);

    return {
      suggestions: limited,
      cityName: request.cityName,
      countryName: request.countryName,
      generatedAt: new Date().toISOString(),
      basedOnPlaces: request.savedPlaces.map(p => p.name),
    };
  }
}

// Export singleton instance
export const mockProvider = new MockLLMProvider();
