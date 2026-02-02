/**
 * AI Services - Main exports
 */

// Types
export * from './types';

// Cache
export {
  getCachedSuggestions,
  cacheSuggestions,
  clearSuggestionsCache,
  clearCitySuggestions,
} from './suggestion-cache';

// Gemini Client
export { callGemini, buildCategoryAwarePrompt } from './gemini-client';
export type { GeminiMessage, GeminiOptions, GeminiResponse } from './gemini-client';

// Providers
export { mockProvider, MockLLMProvider } from './providers/mock-provider';
export { geminiSuggestionsProvider, GeminiSuggestionsProvider, deepSeekSuggestionsProvider, DeepSeekSuggestionsProvider } from './providers/deepseek-suggestions-provider';
export { tripPlannerProvider, TripPlannerProvider } from './providers/trip-planner-provider';
export { parseWithGemini, parseWithDeepSeek, parseSharedText } from './providers/openrouter-parser';
export type { ParsedPlace, ParseResult } from './providers/openrouter-parser';

// Re-export default config
export { DEFAULT_AI_CONFIG } from './types';
