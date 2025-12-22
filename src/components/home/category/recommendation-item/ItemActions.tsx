import React from "react";
import { Check, Circle } from "lucide-react";
import { RecommendationItemProps } from "./types";
import { ExportToMapsButton } from "@/components/maps/ExportToMapsButton";

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




  return (
    <div className="flex items-center gap-1.5">
      <button
        className={`transition-all p-1 rounded-full ${item.visited
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

      {/* Export to Maps Button */}
      <ExportToMapsButton
        places={[{
          name: item.name,
          address: item.location || item.name,
          city: item.city,
          country: item.country
        }]}
        variant="ghost"
        size="icon"
        showText={false}
        className="h-6 w-6 text-muted-foreground hover:text-primary hover:bg-muted/60"
        iconClassName="h-3.5 w-3.5"
      />
    </div>
  );
};

export default ItemActions;
