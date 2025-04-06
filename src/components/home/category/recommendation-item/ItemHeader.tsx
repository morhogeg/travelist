import React from "react";
import { MapPin, Calendar, Globe } from "lucide-react";
import { generateMapLink } from "@/utils/link-helpers";
import { RecommendationItemProps } from "./types";

type ItemHeaderProps = {
  item: RecommendationItemProps["item"];
  visited: boolean;
};

const ItemHeader: React.FC<ItemHeaderProps> = ({ item, visited }) => {
  const mapUrl = generateMapLink(item.name, item.location);

  return (
    <div>
      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{item.location}</span>

        {item.country && (
          <span className="flex items-center ml-2">
            <Globe className="h-3.5 w-3.5 mr-1" />
            {item.country}
          </span>
        )}
      </div>

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
