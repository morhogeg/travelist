/**
 * Suggestion Cache Service
 *
 * Caches AI suggestions in localStorage to avoid unnecessary API calls.
 * Uses a hash of saved places to invalidate cache when places change.
 */

import {
  AISuggestionResult,
  CachedSuggestions,
  SuggestionCache,
  SavedPlaceContext,
  DEFAULT_AI_CONFIG,
} from './types';

const CACHE_STORAGE_KEY = 'travelist-ai-suggestions-cache';

/**
 * Creates a hash from saved places to detect changes
 */
function createPlacesHash(places: SavedPlaceContext[]): string {
  // Sort places by name for consistent hashing
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name));
  const data = sorted.map(p => `${p.name}:${p.category}:${p.visited ?? false}`).join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Creates a cache key from city and country
 */
function createCacheKey(cityName: string, countryName: string): string {
  return `${cityName.toLowerCase().trim()}_${countryName.toLowerCase().trim()}`;
}

/**
 * Loads the suggestion cache from localStorage
 */
function loadCache(): SuggestionCache {
  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as SuggestionCache;
  } catch {
    return {};
  }
}

/**
 * Saves the suggestion cache to localStorage
 */
function saveCache(cache: SuggestionCache): void {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save AI suggestions cache:', e);
  }
}

/**
 * Gets cached suggestions if they exist and are still valid
 */
export function getCachedSuggestions(
  cityName: string,
  countryName: string,
  savedPlaces: SavedPlaceContext[]
): AISuggestionResult | null {
  const cache = loadCache();
  const key = createCacheKey(cityName, countryName);
  const cached = cache[key];

  if (!cached) {
    return null;
  }

  // Check if cache has expired
  if (Date.now() > cached.expiresAt) {
    // Remove expired entry
    delete cache[key];
    saveCache(cache);
    return null;
  }

  // Check if saved places have changed
  const currentHash = createPlacesHash(savedPlaces);
  if (cached.hash !== currentHash) {
    // Places changed, invalidate cache
    delete cache[key];
    saveCache(cache);
    return null;
  }

  return cached.result;
}

/**
 * Caches suggestions for a city
 */
export function cacheSuggestions(
  cityName: string,
  countryName: string,
  savedPlaces: SavedPlaceContext[],
  result: AISuggestionResult,
  cacheDurationMs: number = DEFAULT_AI_CONFIG.cacheDurationMs
): void {
  const cache = loadCache();
  const key = createCacheKey(cityName, countryName);

  cache[key] = {
    result,
    hash: createPlacesHash(savedPlaces),
    expiresAt: Date.now() + cacheDurationMs,
  };

  // Clean up old entries (keep only last 20 cities)
  const entries = Object.entries(cache);
  if (entries.length > 20) {
    // Sort by expiration and keep newest
    entries.sort((a, b) => b[1].expiresAt - a[1].expiresAt);
    const toKeep = entries.slice(0, 20);
    const newCache: SuggestionCache = {};
    toKeep.forEach(([k, v]) => {
      newCache[k] = v;
    });
    saveCache(newCache);
  } else {
    saveCache(cache);
  }
}

/**
 * Clears all cached suggestions
 */
export function clearSuggestionsCache(): void {
  localStorage.removeItem(CACHE_STORAGE_KEY);
}

/**
 * Clears cached suggestions for a specific city
 */
export function clearCitySuggestions(cityName: string, countryName: string): void {
  const cache = loadCache();
  const key = createCacheKey(cityName, countryName);
  delete cache[key];
  saveCache(cache);
}
