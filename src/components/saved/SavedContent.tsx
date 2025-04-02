
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { deletePlaceById } from "@/utils/recommendation-parser";
import { CategoryTabs, SavedPlacesGrid, EmptySavedState, SavedPlacesLoader } from "@/components/saved";
import type { Place } from "@/hooks/useSavedPlaces";

interface SavedContentProps {
  savedPlaces: Place[];
  loading: boolean;
  allCategories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onReloadPlaces: () => void;
  onUpdatePlaceImage?: (placeId: string, imageUrl: string) => void;
  openRecDrawer?: () => void;
}

const SavedContent: React.FC<SavedContentProps> = ({
  savedPlaces,
  loading,
  allCategories,
  selectedCategory,
  onCategoryChange,
  onReloadPlaces,
  onUpdatePlaceImage,
  openRecDrawer
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeletePlace = (placeId: string, placeName: string) => {
    try {
      deletePlaceById(placeId);
      toast({
        title: "Place removed",
        description: `"${placeName}" has been removed from your saved places.`,
      });
      onReloadPlaces();
    } catch (error) {
      toast({
        title: "Error removing place",
        description: "There was an error removing this place. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewCity = (cityId: string) => {
    if (!cityId) {
      console.error("No city ID provided for navigation");
      return;
    }
    console.log("Navigating to city with ID:", cityId);
    navigate(`/place/${cityId}`);
  };
  
  const resetCategoryFilter = () => {
    onCategoryChange("all");
  };

  // Filter places based on selected category
  const filteredPlaces = selectedCategory === "all" 
    ? savedPlaces 
    : savedPlaces.filter(place => 
        place.recommendations.some(rec => 
          rec.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      );

  if (loading) {
    return <SavedPlacesLoader />;
  }

  if (savedPlaces.length === 0) {
    return <EmptySavedState openRecDrawer={openRecDrawer} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CategoryTabs
        selectedCategory={selectedCategory}
        allCategories={allCategories}
        onCategoryChange={onCategoryChange}
      >
        <SavedPlacesGrid
          places={filteredPlaces}
          onDeletePlace={handleDeletePlace}
          onViewCity={handleViewCity}
          selectedCategory={selectedCategory}
          onResetCategory={resetCategoryFilter}
          onUpdatePlaceImage={onUpdatePlaceImage}
        />
      </CategoryTabs>
    </div>
  );
};

export default SavedContent;
