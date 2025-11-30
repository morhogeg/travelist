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
export { grokSuggestionsProvider, GrokSuggestionsProvider } from './providers/grok-suggestions-provider';
export { parseWithGrok, parseSharedText } from './providers/openrouter-parser';
export type { ParsedPlace, ParseResult } from './providers/openrouter-parser';

// Re-export default config
export { DEFAULT_AI_CONFIG } from './types';
