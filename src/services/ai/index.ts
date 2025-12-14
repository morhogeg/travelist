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

// Providers
export { mockProvider, MockLLMProvider } from './providers/mock-provider';
export { deepSeekSuggestionsProvider, DeepSeekSuggestionsProvider } from './providers/deepseek-suggestions-provider';
export { parseWithDeepSeek, parseSharedText } from './providers/openrouter-parser';
export type { ParsedPlace, ParseResult } from './providers/openrouter-parser';

// Re-export default config
export { DEFAULT_AI_CONFIG } from './types';
