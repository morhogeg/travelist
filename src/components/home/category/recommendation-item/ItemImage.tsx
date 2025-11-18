
import React from "react";
import { Check } from "lucide-react";
import { getSmartImage } from "@/utils/recommendation/image-helpers";
import { RecommendationItemProps } from "./types";
import { categories } from "@/components/recommendations/utils/category-data";

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

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === category?.toLowerCase());
    return cat?.icon || "📍";
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      lodging: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      attractions: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      nightlife: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    };
    return colorMap[category?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const displayImage = getOptimalImage();

  return (
    <div className="relative aspect-[3/2] overflow-hidden">
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
      {item.category && (
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-md text-sm font-medium ${getCategoryColor(item.category)}`}>
          {getCategoryIcon(item.category)}
        </span>
      )}

      {item.visited && (
        <span className="absolute top-2 left-2 bg-success/20 backdrop-blur-sm border border-success/30 text-success dark:text-success text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1">
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
