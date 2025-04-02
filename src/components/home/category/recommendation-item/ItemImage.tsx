
import React from "react";
import { Check } from "lucide-react";
import { getSmartImage } from "@/utils/recommendation/image-helpers";
import { RecommendationItemProps } from "./types";

type ItemImageProps = {
  item: RecommendationItemProps["item"];
  getCategoryPlaceholder: RecommendationItemProps["getCategoryPlaceholder"];
};

const ItemImage: React.FC<ItemImageProps> = ({ item, getCategoryPlaceholder }) => {
  // Enhanced image selection logic
  const getOptimalImage = () => {
    // First priority: use the provided image if it exists and is valid
    if (item.image && !item.image.includes("undefined") && !item.image.includes("null")) {
      return item.image;
    }
    
    // Second priority: use smart image selection based on name and category
    return getSmartImage(item.name, item.category);
  };

  const displayImage = getOptimalImage();

  return (
    <div className="relative aspect-[4/3] overflow-hidden">
      <img 
        src={displayImage} 
        alt={item.name}
        className={`w-full h-full object-cover hover:scale-105 transition-transform duration-500 ${item.visited ? 'opacity-90' : ''}`}
        onError={(e) => {
          // Fallback to category placeholder if the image fails to load
          const target = e.target as HTMLImageElement;
          target.src = getCategoryPlaceholder(item.category);
        }}
      />
      <span className="absolute top-3 right-3 bg-white/80 dark:bg-black/60 text-xs font-medium px-2.5 py-1.5 rounded-full">
        {item.category}
      </span>
      
      {item.visited && (
        <span className="absolute top-3 left-3 bg-green-500/80 text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <Check className="h-3 w-3" /> Visited
        </span>
      )}
      
      {/* Darker overlay for visited items */}
      {item.visited && (
        <div className="absolute inset-0 bg-black/10"></div>
      )}
    </div>
  );
};

export default ItemImage;
