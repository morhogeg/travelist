
import { useState, useCallback } from "react";
import { getUserPlaces } from "@/utils/recommendation-parser";
import { Place } from "@/components/recommendations/types";
import { updatePlaceImage as updateImageInStorage } from "@/utils/recommendation/user-places";

export const usePlaceOperations = () => {
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  
  // Update place image
  const updatePlaceImage = useCallback((placeId: string, imageUrl: string) => {
    try {
      // Update in local state
      setSavedPlaces(prev => 
        prev.map(place => 
          place.id === placeId 
            ? { ...place, image: imageUrl } 
            : place
        )
      );
      
      // Update in localStorage using the utility function
      updateImageInStorage(placeId, imageUrl);
      
      // Trigger reload event
      window.dispatchEvent(new CustomEvent('userPlacesChanged'));
      
      console.log(`Image for place ${placeId} updated successfully`);
      
    } catch (error) {
      console.error("Error updating place image:", error);
    }
  }, []);

  return {
    savedPlaces,
    setSavedPlaces,
    updatePlaceImage
  };
};
