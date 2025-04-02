import React from "react";
import { motion } from "framer-motion";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletePlaceDialog from "@/components/saved/DeletePlaceDialog";

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    image: string;
    country?: string;
  };
  index: number;
  onPlaceClick: (placeId: string) => void;
  onAddToCity: (cityName: string) => void;
  onDeletePlace: (placeId: string) => void;
  onEditImage?: (placeId: string) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  index,
  onPlaceClick,
  onAddToCity,
  onDeletePlace,
  onEditImage
}) => {
  const handleDelete = () => {
    onDeletePlace(place.id);
  };

  return (
    <motion.div
      key={place.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="relative cursor-pointer group rounded-2xl overflow-hidden shadow-md scale-[0.85]"
    >
      <div 
        className="relative aspect-[16/9]"
        onClick={() => onPlaceClick(place.id)}
      >
        <img 
          src={place.image} 
          alt={place.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-xl font-semibold text-white">{place.name}</h3>
          {place.country && (
            <span className="text-sm text-white/80">{place.country}</span>
          )}
        </div>
      </div>
      
      <div className="absolute top-2 right-2 flex gap-2">
        <DeletePlaceDialog
          placeName={place.name}
          onDelete={handleDelete}
        />
        
        {onEditImage && (
          <button 
            className="bg-black/60 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEditImage(place.id);
            }}
          >
            <Pencil className="h-4 w-4 text-white" />
          </button>
        )}
        
        <button 
          className="bg-black/60 p-1.5 rounded-full group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCity(place.name);
          }}
        >
          <Plus className="h-4 w-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
};

export default PlaceCard;