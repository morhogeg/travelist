import React from "react";
import { Edit, Navigation } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RecommendationItemProps } from "./types";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(item);
    }
  };

  const handleCheckedChange = (checked: boolean | string) => {
    const idToUse = item.recId || item.id;
    if (!idToUse) {
      console.error("Missing ID for visited toggle", item);
      return;
    }
    onToggleVisited(idToUse, item.name, !!item.visited);
  };

  const mapUrl = generateMapLink(item.name, item.location);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-2 relative">
        <Checkbox 
          id={`visited-${item.id || item.recId}`}
          checked={!!item.visited}
          className={item.visited ? "bg-green-500 border-green-500 text-white" : ""}
          onCheckedChange={handleCheckedChange}
          onClick={(e) => e.stopPropagation()}
        />

        {item.visited && (
          <span className="absolute -top-3 -right-3 text-xs font-medium text-green-500 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full flex items-center shadow-sm">
            <span className="h-3 w-3 mr-0.5">✓</span> Visited
          </span>
        )}
      </div>

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

      {onEditClick && (
        <button 
          className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full hover:bg-muted/60"
          onClick={handleEdit}
          aria-label="Edit recommendation"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}

      <DeleteConfirmDialog 
        itemName={item.name} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default ItemActions;