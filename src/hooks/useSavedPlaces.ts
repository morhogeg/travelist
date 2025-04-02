
import { useState, useEffect } from "react";
import { useRecommendationProcessor } from "./useRecommendationProcessor";
import { usePlaceOperations } from "./usePlaceOperations";
import { Place, Recommendation } from "@/components/recommendations/types";

export const useSavedPlaces = () => {
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  const { processPlacesWithRecommendations } = useRecommendationProcessor();
  const { updatePlaceImage } = usePlaceOperations();
  
  // Load saved places
  const loadSavedPlaces = () => {
    try {
      setLoading(true);
      const { places, categories } = processPlacesWithRecommendations();
      
      setSavedPlaces(places);
      setAllCategories(categories);
      
    } catch (error) {
      console.error("Error loading places:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSavedPlaces();
    
    // Listen for changes to user places
    const handleUserPlacesChanged = () => {
      loadSavedPlaces();
    };
    
    window.addEventListener('userPlacesChanged', handleUserPlacesChanged);
    window.addEventListener('recommendationAdded', handleUserPlacesChanged);
    window.addEventListener('recommendationDeleted', handleUserPlacesChanged);
    window.addEventListener('placeDeleted', handleUserPlacesChanged);
    window.addEventListener('recommendationVisited', handleUserPlacesChanged);
    
    return () => {
      window.removeEventListener('userPlacesChanged', handleUserPlacesChanged);
      window.removeEventListener('recommendationAdded', handleUserPlacesChanged);
      window.removeEventListener('recommendationDeleted', handleUserPlacesChanged);
      window.removeEventListener('placeDeleted', handleUserPlacesChanged);
      window.removeEventListener('recommendationVisited', handleUserPlacesChanged);
    };
  }, []);

  return {
    savedPlaces,
    loading,
    allCategories,
    loadSavedPlaces,
    updatePlaceImage
  };
};

export type { Recommendation, Place };
