/**
 * AI Suggestions Service Types
 *
 * Defines types for AI-powered place recommendations based on user's saved places.
 */

import { RecommendationPlace } from '@/utils/recommendation/types';

// Categories used in the app
export type PlaceCategory =
  | 'food'
  | 'lodging'
  | 'attractions'
  | 'shopping'
  | 'nightlife'
  | 'outdoors'
  | 'general';

/**
 * A suggested place from the AI
 */
export interface AISuggestion {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  whyRecommended: string; // Explanation based on user's saved places
  estimatedPriceRange?: '$' | '$$' | '$$$' | '$$$$';
  tags?: string[]; // e.g., ['romantic', 'local favorite', 'hidden gem']
}

/**
 * Result from an AI suggestion request
 */
export interface AISuggestionResult {
  suggestions: AISuggestion[];
  cityName: string;
  countryName: string;
  generatedAt: string;
  basedOnPlaces: string[]; // Names of places used for context
}

/**
 * Request parameters for generating suggestions
 */
export interface AISuggestionRequest {
  cityName: string;
  countryName: string;
  savedPlaces: SavedPlaceContext[];
  maxSuggestions?: number;
  excludeCategories?: PlaceCategory[];
}

/**
 * Simplified place context for AI prompts
 */
export interface SavedPlaceContext {
  name: string;
  category: string;
  description?: string;
  visited?: boolean;
}

/**
 * LLM Provider interface - allows swapping between mock/OpenAI/Claude
 */
export interface LLMProvider {
  name: string;
  generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult>;
}

/**
 * Cache entry for stored suggestions
 */
export interface CachedSuggestions {
  result: AISuggestionResult;
  hash: string; // Hash of saved places to detect changes
  expiresAt: number; // Timestamp
}

/**
 * Cache storage structure
 */
export interface SuggestionCache {
  [cityKey: string]: CachedSuggestions;
}

/**
 * Hook state for AI suggestions
 */
export interface UseAISuggestionsState {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  basedOnPlaces: string[];
  refresh: () => Promise<void>;
}

/**
 * Configuration for AI suggestions feature
 */
export interface AISuggestionsConfig {
  minPlacesForSuggestions: number; // Minimum saved places to trigger AI
  cacheDurationMs: number; // How long to cache suggestions
  maxSuggestions: number; // Maximum suggestions to return
  provider: 'mock' | 'openai' | 'anthropic';
}

// Default configuration
export const DEFAULT_AI_CONFIG: AISuggestionsConfig = {
  minPlacesForSuggestions: 3,
  cacheDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  maxSuggestions: 5,
  provider: 'mock',
};
