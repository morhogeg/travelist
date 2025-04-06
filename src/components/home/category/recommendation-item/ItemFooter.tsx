import React from "react";
import { Navigation, ExternalLink } from "lucide-react";
import { generateMapLink, formatUrl } from "@/utils/link-helpers";
import { RecommendationItemProps } from "./types";

type ItemFooterProps = {
  item: RecommendationItemProps["item"];
  onCityClick: RecommendationItemProps["onCityClick"];
};

const ItemFooter: React.FC<ItemFooterProps> = ({ item }) => {
  const mapUrl = generateMapLink(item.name, item.location);
  const websiteUrl = item.website ? formatUrl(item.website) : null;

  return (
    <div className="mt-4 flex justify-start items-center">
      <div className="flex gap-2">
        <a 
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
          title="Navigate to this place"
          onClick={(e) => e.stopPropagation()}
        >
          <Navigation className="h-4 w-4" />
        </a>

        {websiteUrl && (
          <a 
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            title="Visit website"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ItemFooter;