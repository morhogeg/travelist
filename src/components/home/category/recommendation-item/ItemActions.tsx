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
    <div className="flex flex-col gap-1.5">
      {/* Visited Toggle Button */}
      <button
        className={`transition-all p-1 rounded-full ${
          item.visited
            ? 'bg-success/20 text-success hover:bg-success/30'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        }`}
        onClick={handleToggleVisited}
        aria-label={item.visited ? "Mark as not visited" : "Mark as visited"}
      >
        {item.visited ? (
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
        ) : (
          <Circle className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Google Maps Button */}
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-muted/60"
        onClick={(e) => e.stopPropagation()}
        aria-label="Open in Google Maps"
      >
        <Navigation className="h-3.5 w-3.5" />
      </a>
    </div>
  );
};

export default ItemActions;