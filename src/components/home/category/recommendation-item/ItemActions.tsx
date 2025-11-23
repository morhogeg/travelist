import React from "react";
import { Navigation, Check, Circle } from "lucide-react";
import { RecommendationItemProps } from "./types";
import { generateMapLink } from "@/utils/link-helpers";

type ItemActionsProps = {
  item: RecommendationItemProps["item"];
  onDelete: RecommendationItemProps["onDelete"];
  onToggleVisited: RecommendationItemProps["onToggleVisited"];
  onEditClick?: RecommendationItemProps["onEditClick"];
};

const ItemActions: React.FC<ItemActionsProps> = ({ 
  item, 
  onDelete, 
  onToggleVisited,
  onEditClick
}) => {
  const handleDelete = () => {
    const idToUse = item.recId || item.id;
    if (!idToUse) {
      console.error("Missing ID for deletion", item);
      return;
    }
    onDelete(idToUse, item.name);
  };

  const handleToggleVisited = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToUse = item.recId || item.id;
    if (!idToUse) {
      console.error("Missing ID for toggling visited", item);
      return;
    }
    onToggleVisited(idToUse, item.name, !!item.visited);
  };


  const mapUrl = generateMapLink(item.name, item.location);

  return (
    <div className="flex items-center gap-3">
      {/* Visited Toggle Button */}
      <button
        className={`transition-colors p-1.5 rounded-full hover:bg-muted/60 ${
          item.visited ? 'text-success' : 'text-muted-foreground'
        }`}
        onClick={handleToggleVisited}
        aria-label={item.visited ? "Mark as not visited" : "Mark as visited"}
      >
        {item.visited ? (
          <Check className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      {/* Google Maps Button */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-muted/60"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open in Google Maps"
      >
        <Navigation className="h-4 w-4" />
      </a>
    </div>
  );
};

export default ItemActions;