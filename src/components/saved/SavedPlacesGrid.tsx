
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import SavedPlaceCard from "./SavedPlaceCard";

interface Recommendation {
  id: string;
  name: string;
  category: string;
  image?: string;
  visited?: boolean;
  website?: string;
}

interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
  categories: string[];
  recommendations: Recommendation[];
}

interface SavedPlacesGridProps {
  places: Place[];
  onDeletePlace: (placeId: string, placeName: string) => void;
  onViewCity: (cityId: string) => void;
  selectedCategory: string;
  onResetCategory: () => void;
  onUpdatePlaceImage?: (placeId: string, imageUrl: string) => void;
}

const SavedPlacesGrid: React.FC<SavedPlacesGridProps> = ({ 
  places, 
  onDeletePlace, 
  onViewCity,
  selectedCategory,
  onResetCategory,
  onUpdatePlaceImage
}) => {
  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No places found with {selectedCategory} recommendations.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onResetCategory}
        >
          Show all places
        </Button>
      </div>
    );
  }

  // Filter places to show appropriate recommendations based on selected category
  const placesWithFilteredRecommendations = places.map(place => {
    if (selectedCategory === "all") {
      return place;
    }
    
    // Filter recommendations by selected category
    const filteredRecommendations = place.recommendations.filter(
      rec => rec.category.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    return {
      ...place,
      recommendations: filteredRecommendations,
      // Only show categories in "all" view
      showCategories: selectedCategory === "all"
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {placesWithFilteredRecommendations.map((place) => (
        <SavedPlaceCard 
          key={place.id} 
          place={place} 
          onDelete={onDeletePlace}
          onViewCity={onViewCity}
          showCategories={selectedCategory === "all"}
          onUpdateImage={onUpdatePlaceImage}
        />
      ))}
    </motion.div>
  );
};

export default SavedPlacesGrid;
