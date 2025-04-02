
import React from "react";
import { 
  Utensils, Coffee, Bed, Beer, Landmark, Map, 
  ShoppingBag, Palmtree, Camera, Plane, Music,
  Ticket, Library, Heart, Star, Compass
} from "lucide-react";

interface CategoryIconProps {
  category: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "h-4 w-4" }) => {
  const normalizedCategory = category.toLowerCase();
  
  // Return the appropriate icon based on category
  if (normalizedCategory.includes("food") || normalizedCategory.includes("restaurant")) {
    return <Utensils className={className} />;
  } else if (normalizedCategory.includes("cafe") || normalizedCategory.includes("coffee")) {
    return <Coffee className={className} />;
  } else if (normalizedCategory.includes("hotel") || normalizedCategory.includes("stay") || normalizedCategory.includes("lodging")) {
    return <Bed className={className} />;
  } else if (normalizedCategory.includes("bar") || normalizedCategory.includes("pub")) {
    return <Beer className={className} />;
  } else if (normalizedCategory.includes("attraction") || normalizedCategory.includes("landmark") || normalizedCategory.includes("monument")) {
    return <Landmark className={className} />;
  } else if (normalizedCategory.includes("tour") || normalizedCategory.includes("trip")) {
    return <Map className={className} />;
  } else if (normalizedCategory.includes("shop") || normalizedCategory.includes("shopping") || normalizedCategory.includes("store")) {
    return <ShoppingBag className={className} />;
  } else if (normalizedCategory.includes("beach") || normalizedCategory.includes("nature")) {
    return <Palmtree className={className} />;
  } else if (normalizedCategory.includes("photo") || normalizedCategory.includes("photography")) {
    return <Camera className={className} />;
  } else if (normalizedCategory.includes("travel") || normalizedCategory.includes("flight")) {
    return <Plane className={className} />;
  } else if (normalizedCategory.includes("music") || normalizedCategory.includes("concert")) {
    return <Music className={className} />;
  } else if (normalizedCategory.includes("event") || normalizedCategory.includes("ticket")) {
    return <Ticket className={className} />;
  } else if (normalizedCategory.includes("museum") || normalizedCategory.includes("library")) {
    return <Library className={className} />;
  } else if (normalizedCategory.includes("favorite") || normalizedCategory.includes("must")) {
    return <Heart className={className} />;
  } else if (normalizedCategory.includes("top") || normalizedCategory.includes("best")) {
    return <Star className={className} />;
  } else {
    // Default icon for unmatched categories
    return <Compass className={className} />;
  }
};

export default CategoryIcon;
