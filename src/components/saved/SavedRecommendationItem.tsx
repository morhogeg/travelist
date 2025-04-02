
import React from "react";
import { Navigation, ExternalLink } from "lucide-react";
import { generateMapLink } from "@/utils/link-helpers";
import { formatWebsiteUrl } from "@/utils/countries";

interface RecommendationItemProps {
  name: string;
  cityName: string;
  website?: string;
  visited?: boolean;
}

const SavedRecommendationItem: React.FC<RecommendationItemProps> = ({ 
  name, 
  cityName, 
  website,
  visited
}) => {
  // Format website URL if provided
  const websiteUrl = website ? formatWebsiteUrl(website) : null;
  
  return (
    <li className={`flex items-start gap-1 ${visited ? 'text-muted-foreground/70' : 'text-muted-foreground'} py-0.5 ${visited ? 'line-through decoration-1 decoration-green-500/50' : ''}`}>
      <span className="mt-0.5">•</span>
      <div className="flex items-center gap-1 flex-wrap">
        <a 
          href={generateMapLink(name, cityName)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary truncate flex-1"
          title={`Navigate to ${name}`}
        >
          <span className="truncate">{name}</span>
        </a>
        <div className="flex items-center gap-1">
          <a 
            href={generateMapLink(name, cityName)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary"
            title={`Navigate to ${name}`}
          >
            <Navigation className="h-3 w-3" />
          </a>
          {websiteUrl && (
            <a 
              href={websiteUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
              title="Visit website"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
};

export default SavedRecommendationItem;
