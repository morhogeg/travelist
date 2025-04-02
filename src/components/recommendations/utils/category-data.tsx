
import React from "react";
import { 
  Utensils, 
  Bed, 
  Eye, 
  MapPin, 
  ShoppingBag, 
  Music, 
  Palmtree 
} from "lucide-react";

export const categories = [
  { id: "food", label: "Food", icon: <Utensils className="h-4 w-4" />, color: "#FEC6A1" },
  { id: "lodging", label: "Lodging", icon: <Bed className="h-4 w-4" />, color: "#E5DEFF" },
  { id: "attractions", label: "Attractions", icon: <Eye className="h-4 w-4" />, color: "#FFDEE2" },
  { id: "shopping", label: "Shopping", icon: <ShoppingBag className="h-4 w-4" />, color: "#D3E4FD" },
  { id: "nightlife", label: "Nightlife", icon: <Music className="h-4 w-4" />, color: "#accbee" },
  { id: "outdoors", label: "Outdoors", icon: <Palmtree className="h-4 w-4" />, color: "#F2FCE2" },
  { id: "general", label: "General", icon: <MapPin className="h-4 w-4" />, color: "#eef1f5" }
];

export const getCategoryIcon = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId.toLowerCase());
  return category?.icon || <MapPin className="h-4 w-4" />;
};

export const getCategoryLabel = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId.toLowerCase());
  return category?.label || "General";
};

export const getCategoryColor = (categoryId: string) => {
  const category = categories.find(cat => cat.id === categoryId.toLowerCase());
  return category?.color || "#eef1f5";
};
