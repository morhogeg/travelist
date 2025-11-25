/**
 * useAISuggestions Hook
 *
 * Fetches AI-powered place suggestions for a city based on user's saved places.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AISuggestion,
  AISuggestionRequest,
  SavedPlaceContext,
  DEFAULT_AI_CONFIG,
  getCachedSuggestions,
  cacheSuggestions,
  mockProvider,
} from '@/services/ai';
import { getRecommendations } from '@/utils/recommendation-parser';

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

  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [basedOnPlaces, setBasedOnPlaces] = useState<string[]>([]);
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
  const fetchSuggestions = useCallback(async (places: SavedPlaceContext[]) => {
    if (!enabled || places.length < minPlaces) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = getCachedSuggestions(cityName, countryName, places);
      if (cached) {
        setSuggestions(cached.suggestions);
        setBasedOnPlaces(cached.basedOnPlaces);
        setIsLoading(false);
        return;
      }

      // Fetch from provider
      const request: AISuggestionRequest = {
        cityName,
        countryName,
        savedPlaces: places,
        maxSuggestions: DEFAULT_AI_CONFIG.maxSuggestions,
      };

      const result = await mockProvider.generateSuggestions(request);

      // Cache the result
      cacheSuggestions(cityName, countryName, places, result);

      setSuggestions(result.suggestions);
      setBasedOnPlaces(result.basedOnPlaces);
    } catch (e) {
      console.error('Failed to fetch AI suggestions:', e);
      setError('Unable to load suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [cityName, countryName, enabled, minPlaces]);

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

  // Manual refresh function
  const refresh = useCallback(async () => {
    const places = loadSavedPlaces();
    await fetchSuggestions(places);
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
