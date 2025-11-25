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

// Re-export default config
export { DEFAULT_AI_CONFIG } from './types';
