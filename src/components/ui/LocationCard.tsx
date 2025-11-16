import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Heart, Share2, Navigation, Trash2, Image, CheckCircle } from "lucide-react";
import { generateMapLink } from "@/utils/link-helpers";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { Button } from "@/components/ui/button";

interface LocationCardProps {
  id: string;
  name: string;
  location: string;
  image: string;
  category: string;
  isSaved?: boolean;
  visited?: boolean;
  delay?: number;
  onClick?: (id: string) => void;
  onImageUpdate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const LocationCard = ({
  id,
  name,
  location,
  image,
  category,
  isSaved = false,
  visited = false,
  delay = 0,
  onClick,
  onImageUpdate,
  onDelete
}: LocationCardProps) => {
  const [showControls, setShowControls] = useState(false);

  const handleClick = () => {
    if (!id) {
      console.error("LocationCard: Missing ID for click handler");
      return;
    }

    console.log("LocationCard clicked with ID:", id);
    if (onClick) {
      onClick(id);
    } else {
      console.error("LocationCard: Missing onClick handler");
    }
  };

  const handleImageUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageUpdate && id) {
      onImageUpdate(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && id) {
      onDelete(id);
    }
  };

  const displayCategory = category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  const mapUrl = generateMapLink(name, location);

  return (
    <motion.div
      id={`rec-${id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      whileHover={{ y: -5 }}
      className={`glass-card dark:glass-card-dark card-hover overflow-hidden cursor-pointer relative scale-[0.85] ${visited ? 'ring-1 ring-green-500' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl">
        <img
          src={image}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${visited ? 'opacity-90' : ''}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = getCategoryPlaceholder(category);
          }}
        />
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
        <span className="absolute top-3 left-3 bg-white/90 text-xs font-medium px-2 py-1 rounded-full">
          {displayCategory}
        </span>

        {visited && (
          <span className="absolute top-3 right-3 bg-success/20 backdrop-blur-sm border border-success/30 text-success text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Visited
          </span>
        )}

        {showControls && (onImageUpdate || onDelete) && (
          <div className="absolute top-3 right-3 flex space-x-2 animate-fade-in z-10">
            {onImageUpdate && (
              <Button 
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-black/50 text-white"
                onClick={handleImageUpdate}
              >
                <Image className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-destructive/80 text-white"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className={`font-semibold text-lg tracking-tight ${visited ? 'text-muted-foreground' : ''}`}>{name}</h3>
        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{location}</span>
        </div>
        <div className="flex mt-4 gap-2">
          <button 
            className="flex-1 bg-primary text-primary-foreground rounded-full py-1.5 text-sm font-medium transition-colors hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Details
          </button>
          <a 
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon"
            onClick={(e) => e.stopPropagation()}
          >
            <Navigation className="h-5 w-5" />
          </a>
          <button 
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              // Add share logic here
            }}
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LocationCard;