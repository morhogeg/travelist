
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Image, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ImageUploader from "@/components/ui/ImageUploader";
import SavedPlaceHeader from "./SavedPlaceHeader";
import SavedPlaceCategories from "./SavedPlaceCategories";
import SavedRecommendationsList from "./SavedRecommendationsList";
import DeletePlaceDialog from "./DeletePlaceDialog";

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

interface SavedPlaceCardProps {
  place: Place;
  onDelete: (placeId: string, placeName: string) => void;
  onViewCity: (cityId: string) => void;
  showCategories?: boolean;
  onUpdateImage?: (placeId: string, imageUrl: string) => void;
}

const SavedPlaceCard: React.FC<SavedPlaceCardProps> = ({ 
  place, 
  onDelete, 
  onViewCity,
  showCategories = true,
  onUpdateImage
}) => {
  const [showImageUploader, setShowImageUploader] = useState(false);

  const handleViewCity = () => {
    console.log("SavedPlaceCard: View City clicked with ID:", place.id);
    onViewCity(place.id);
  };

  const handleDelete = () => {
    onDelete(place.id, place.name);
  };

  const handleImageUpdate = (imageUrl: string) => {
    if (onUpdateImage) {
      onUpdateImage(place.id, imageUrl);
      setShowImageUploader(false);
    }
  };

  // Count visited recommendations
  const visitedCount = place.recommendations.filter(rec => rec.visited).length;
  const hasVisited = visitedCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`h-full flex flex-col relative overflow-hidden group ${hasVisited ? 'ring-1 ring-green-500/50' : ''}`}>
        {/* Control buttons - only visible on hover */}
        <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onUpdateImage && (
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setShowImageUploader(!showImageUploader)}
            >
              <Image className="h-4 w-4" />
            </Button>
          )}
          <DeletePlaceDialog 
            placeName={place.name}
            onDelete={handleDelete}
          />
        </div>
        
        <div className="relative">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <SavedPlaceHeader 
            name={place.name} 
            country={place.country} 
            onClick={handleViewCity} 
          />
          
          {/* Visited badge */}
          {hasVisited && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
                {visitedCount} visited
              </span>
            </div>
          )}
          
          {/* Image uploader */}
          {showImageUploader && (
            <div className="absolute bottom-2 left-2 right-2 z-10 bg-black/70 p-2 rounded-md animate-fade-in">
              <ImageUploader
                currentImage={place.image}
                onImageChange={handleImageUpdate}
                buttonText="Update"
                buttonVariant="outline"
                className="w-full"
              />
            </div>
          )}
        </div>
        
        <CardContent className="py-4 flex-grow">
          {showCategories && (
            <SavedPlaceCategories categories={place.categories} />
          )}
          
          <div className={showCategories ? "mt-3" : "mt-0"}>
            <SavedRecommendationsList 
              recommendations={place.recommendations} 
              cityName={place.name} 
            />
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleViewCity}
          >
            View Recommendations
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default SavedPlaceCard;
