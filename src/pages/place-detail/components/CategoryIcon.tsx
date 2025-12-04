
import React from "react";
import {
  Utensils, Coffee, Bed, Eye, Map,
  ShoppingBag, Palmtree, Plane, Music,
  Ticket, Library, Heart, Star, MapPin
} from "lucide-react";

interface CategoryIconProps {
  category: string;
  className?: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "h-4 w-4", ...rest }) => {
  const normalizedCategory = category.toLowerCase();
  
  // Return the appropriate icon based on category
  if (normalizedCategory.includes("food") || normalizedCategory.includes("restaurant")) {
    return <Utensils className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("cafe") || normalizedCategory.includes("coffee")) {
    return <Coffee className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("hotel") || normalizedCategory.includes("stay") || normalizedCategory.includes("lodging")) {
    return <Bed className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("bar") || normalizedCategory.includes("pub") || normalizedCategory.includes("nightlife")) {
    return <Music className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("attraction") || normalizedCategory.includes("landmark") || normalizedCategory.includes("monument")) {
    return <Eye className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("tour") || normalizedCategory.includes("trip")) {
    return <Map className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("shop") || normalizedCategory.includes("shopping") || normalizedCategory.includes("store")) {
    return <ShoppingBag className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("beach") || normalizedCategory.includes("nature") || normalizedCategory.includes("outdoors")) {
    return <Palmtree className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("travel") || normalizedCategory.includes("flight")) {
    return <Plane className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("music") || normalizedCategory.includes("concert")) {
    return <Music className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("event") || normalizedCategory.includes("ticket")) {
    return <Ticket className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("museum") || normalizedCategory.includes("library")) {
    return <Library className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("favorite") || normalizedCategory.includes("must")) {
    return <Heart className={className} strokeWidth={2.3} {...rest} />;
  } else if (normalizedCategory.includes("top") || normalizedCategory.includes("best")) {
    return <Star className={className} strokeWidth={2.3} {...rest} />;
  } else {
    // Default icon for unmatched categories
    return <MapPin className={className} strokeWidth={2.3} {...rest} />;
  }
};

export default CategoryIcon;
