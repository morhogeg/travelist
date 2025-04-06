import React from "react";
import { Calendar } from "lucide-react";
import { RecommendationItemProps } from "./types";

type ItemHeaderProps = {
  item: RecommendationItemProps["item"];
  visited: boolean;
};

const ItemHeader: React.FC<ItemHeaderProps> = ({ item, visited }) => {
  return (
    <div>
      {item.dateAdded && (
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {new Date(item.dateAdded).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default ItemHeader;