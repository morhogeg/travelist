/**
 * useAISuggestions Hook
 *
 * Fetches AI-powered place suggestions for a city based on user's saved places.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AISuggestion,
  AISuggestionRequest,
  SavedPlaceContext,
  DEFAULT_AI_CONFIG,
  getCachedSuggestions,
  cacheSuggestions,
  grokSuggestionsProvider,
  mockProvider,
} from '@/services/ai';
import { getRecommendations } from '@/utils/recommendation-parser';

// Global in-memory cache to persist suggestions across component remounts
const suggestionsMemoryCache = new Map<string, {
  suggestions: AISuggestion[];
  basedOnPlaces: string[];
  placesHash: string;
}>();

function getPlacesHash(places: SavedPlaceContext[]): string {
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name));
  return sorted.map(p => `${p.name}:${p.category}:${p.visited ?? false}`).join('|');
}

interface UseAISuggestionsOptions {
  enabled?: boolean;
  minPlaces?: number;
}

interface UseAISuggestionsReturn {
  suggestions: AISuggestion[];
  isLoading: boolean;
  error: string | null;
  basedOnPlaces: string[];
  hasEnoughPlaces: boolean;
  savedPlacesCount: number;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch AI suggestions for a specific city
 */
export function useAISuggestions(
  cityName: string,
  countryName: string,
  options: UseAISuggestionsOptions = {}
): UseAISuggestionsReturn {
  const {
    enabled = true,
    minPlaces = DEFAULT_AI_CONFIG.minPlacesForSuggestions,
  } = options;

  const cacheKey = `${cityName.toLowerCase()}_${countryName.toLowerCase()}`;
  const hasFetchedRef = useRef(false);

  // Initialize from memory cache if available
  const memoryCached = suggestionsMemoryCache.get(cacheKey);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(memoryCached?.suggestions || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [basedOnPlaces, setBasedOnPlaces] = useState<string[]>(memoryCached?.basedOnPlaces || []);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceContext[]>([]);

  // Get saved places for this city
  const loadSavedPlaces = useCallback(() => {
    const recommendations = getRecommendations();

    // Filter places for this city
    const cityPlaces: SavedPlaceContext[] = [];

    recommendations.forEach(rec => {
      if (rec.city.toLowerCase() === cityName.toLowerCase()) {
        rec.places.forEach(place => {
          cityPlaces.push({
            name: place.name,
            category: place.category,
            description: place.description,
            visited: place.visited,
          });
        });
      }
    });

    setSavedPlaces(cityPlaces);
    return cityPlaces;
  }, [cityName]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (places: SavedPlaceContext[], skipCache = false) => {
    if (!enabled || places.length < minPlaces) {
      return;
    }

    const currentPlacesHash = getPlacesHash(places);

    // Check memory cache first (unless skipping cache or places changed)
    if (!skipCache) {
      const memoryCached = suggestionsMemoryCache.get(cacheKey);
      if (memoryCached && memoryCached.placesHash === currentPlacesHash && memoryCached.suggestions.length > 0) {
        // Already have valid cached suggestions, no need to fetch
        setSuggestions(memoryCached.suggestions);
        setBasedOnPlaces(memoryCached.basedOnPlaces);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check localStorage cache (unless skipping)
      if (!skipCache) {
        const cached = getCachedSuggestions(cityName, countryName, places);
        if (cached) {
          setSuggestions(cached.suggestions);
          setBasedOnPlaces(cached.basedOnPlaces);
          // Update memory cache
          suggestionsMemoryCache.set(cacheKey, {
            suggestions: cached.suggestions,
            basedOnPlaces: cached.basedOnPlaces,
            placesHash: currentPlacesHash,
          });
          setIsLoading(false);
          return;
        }
      }

      // Fetch from provider
      const request: AISuggestionRequest = {
        cityName,
        countryName,
        savedPlaces: places,
        maxSuggestions: DEFAULT_AI_CONFIG.maxSuggestions,
      };

      // Try Grok first, fallback to mock if API fails
      let result;
      try {
        result = await grokSuggestionsProvider.generateSuggestions(request);
      } catch (grokError) {
        console.warn('[AI Suggestions] Grok provider failed, falling back to mock:', grokError);
        result = await mockProvider.generateSuggestions(request);
      }

      // Cache the result (both localStorage and memory)
      cacheSuggestions(cityName, countryName, places, result);
      suggestionsMemoryCache.set(cacheKey, {
        suggestions: result.suggestions,
        basedOnPlaces: result.basedOnPlaces,
        placesHash: currentPlacesHash,
      });

      setSuggestions(result.suggestions);
      setBasedOnPlaces(result.basedOnPlaces);
    } catch (e) {
      console.error('Failed to fetch AI suggestions:', e);
      setError('Unable to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [cityName, countryName, cacheKey, enabled, minPlaces]);

  // Initial load
  useEffect(() => {
    const places = loadSavedPlaces();
    fetchSuggestions(places);
  }, [loadSavedPlaces, fetchSuggestions]);

  // Listen for recommendation changes
  useEffect(() => {
    const handleUpdate = () => {
      const places = loadSavedPlaces();
      fetchSuggestions(places);
    };

    window.addEventListener('recommendationAdded', handleUpdate);
    window.addEventListener('recommendationDeleted', handleUpdate);
    window.addEventListener('recommendationUpdated', handleUpdate);

    return () => {
      window.removeEventListener('recommendationAdded', handleUpdate);
      window.removeEventListener('recommendationDeleted', handleUpdate);
      window.removeEventListener('recommendationUpdated', handleUpdate);
    };
  }, [loadSavedPlaces, fetchSuggestions]);

  // Manual refresh function (skips cache)
  const refresh = useCallback(async () => {
    const places = loadSavedPlaces();
    await fetchSuggestions(places, true); // Skip cache on manual refresh
  }, [loadSavedPlaces, fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    basedOnPlaces,
    hasEnoughPlaces: savedPlaces.length >= minPlaces,
    savedPlacesCount: savedPlaces.length,
    refresh,
  };
}

export default useAISuggestions;
