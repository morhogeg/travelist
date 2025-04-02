
import { useState, useEffect } from "react";
import { getUserPlaces, deletePlaceById } from "@/utils/recommendation-parser";
import { deleteRecommendation, getRecommendations, deleteCityAndRecommendations } from "@/utils/recommendation/recommendation-manager";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { updatePlaceImage as updateImageInStorage } from "@/utils/recommendation/user-places";
import { ToastAction } from "@/components/ui/toast";
import React from "react";

interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
}

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDeletedPlace, setLastDeletedPlace] = useState<Place | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadPlaces = () => {
    try {
      const userPlaces = getUserPlaces();
      console.log("Loaded user places:", userPlaces);
      setPlaces(userPlaces);
    } catch (error) {
      console.error("Error loading user places:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();

    // Listen for storage events (if another tab updates localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userPlaces') {
        loadPlaces();
      }
    };

    // Listen for custom delete events
    const handlePlaceDeleted = () => {
      loadPlaces();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('placeDeleted', handlePlaceDeleted);
    window.addEventListener('recommendationAdded', handlePlaceDeleted);
    window.addEventListener('userPlacesChanged', handlePlaceDeleted);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('placeDeleted', handlePlaceDeleted);
      window.removeEventListener('recommendationAdded', handlePlaceDeleted);
      window.removeEventListener('userPlacesChanged', handlePlaceDeleted);
    };
  }, []);

  const handlePlaceClick = (placeId: string) => {
    if (!placeId) {
      console.error("usePlaces: No place ID provided for navigation");
      return;
    }
    console.log("usePlaces: Clicked on place with ID:", placeId);
    navigate(`/place/${placeId}`);
  };

  const undoDelete = () => {
    if (lastDeletedPlace) {
      try {
        // Add the place back to local storage
        const places = getUserPlaces();
        places.push(lastDeletedPlace);
        localStorage.setItem('userPlaces', JSON.stringify(places));
        
        // Update state
        setPlaces(prevPlaces => [...prevPlaces, lastDeletedPlace]);
        setLastDeletedPlace(null);
        
        // Notify user
        toast({
          title: "Delete undone",
          description: `${lastDeletedPlace.name} has been restored`,
        });
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('userPlacesChanged'));
      } catch (error) {
        console.error("Error undoing delete:", error);
        toast({
          title: "Error",
          description: "Failed to restore the deleted place",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeletePlace = (placeId: string) => {
    if (!placeId) {
      console.error("usePlaces: No place ID provided for deletion");
      return;
    }
    
    try {
      // Store the place before deleting it (for potential undo)
      const placeToDelete = places.find(place => place.id === placeId);
      if (placeToDelete) {
        setLastDeletedPlace(placeToDelete);
      }
      
      // Delete place from localStorage
      deletePlaceById(placeId);
      
      // Also delete all recommendations for this place
      deleteCityAndRecommendations(placeId);
      
      // Update state
      setPlaces(places.filter(place => place.id !== placeId));
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('placeDeleted', { detail: { placeId } }));
      
      // Notify user with an undo option
      toast({
        title: "Place deleted",
        description: "The place and its recommendations have been removed",
        action: (
          <ToastAction altText="Undo" onClick={undoDelete}>
            Undo
          </ToastAction>
        )
      });
    } catch (error) {
      console.error("Error deleting place:", error);
      toast({
        title: "Error",
        description: "Failed to delete the place. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCity = (cityName: string) => {
    if (typeof window.showRecDrawer === 'function') {
      window.showRecDrawer(cityName);
    }
  };

  const handleUpdateImage = (placeId: string, imageUrl: string) => {
    updateImageInStorage(placeId, imageUrl);
    setPlaces(prevPlaces => 
      prevPlaces.map(place => 
        place.id === placeId ? { ...place, image: imageUrl } : place
      )
    );
    window.dispatchEvent(new CustomEvent('userPlacesChanged'));
  };

  return {
    places,
    loading,
    handlePlaceClick,
    handleDeletePlace,
    handleAddToCity,
    handleUpdateImage,
    undoDelete,
    lastDeletedPlace
  };
}
