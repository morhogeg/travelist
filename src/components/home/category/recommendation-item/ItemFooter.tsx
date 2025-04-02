
import React from "react";
import { Navigation, ExternalLink } from "lucide-react";
import { generateMapLink, formatUrl } from "@/utils/link-helpers";
import { RecommendationItemProps } from "./types";

type ItemFooterProps = {
  item: RecommendationItemProps["item"];
  onCityClick: RecommendationItemProps["onCityClick"];
};

const ItemFooter: React.FC<ItemFooterProps> = ({ item, onCityClick }) => {
  const mapUrl = generateMapLink(item.name, item.location);
  const websiteUrl = item.website ? formatUrl(item.website) : null;
  
  const handleViewCity = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Look for cityId first, then fallback to recId (which could be the cityId)
    const cityId = item.cityId || item.recId;
    if (!cityId) {
      console.error("Missing cityId and recId for item:", item);
      return;
    }
    
    console.log("View City clicked with ID:", cityId);
    onCityClick(cityId);
  };

  return (
    <div className="mt-4 flex justify-between items-center">
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
      
      <button 
        className="text-sm text-primary flex items-center gap-1 hover:underline font-medium"
        onClick={handleViewCity}
      >
        View City <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default ItemFooter;
