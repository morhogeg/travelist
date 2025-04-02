import React from "react";
import { Navigation } from "lucide-react";
import { SearchResult } from "./types";
import { generateMapLink } from "@/utils/link-helpers";

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

const toTitleCase = (str: string): string =>
  str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  return (
    <div 
      key={`${result.type}-${result.id}`}
      className="px-4 py-3 hover:bg-secondary cursor-pointer border-b last:border-0 flex items-center justify-between"
      onClick={() => onClick(result)}
    >
      <div className="flex-1">
        <div className="font-medium">{result.name}</div>
        {result.type === 'place' && result.country && (
          <div className="text-sm text-muted-foreground">
            {result.country}
          </div>
        )}
        {result.type === 'recommendation' && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="bg-secondary px-1.5 py-0.5 rounded-full text-xs">
              {toTitleCase(result.category)}
            </span>
            <span>in {result.city}</span>
          </div>
        )}
      </div>
      <a 
        href={generateMapLink(result.name, result.type === 'place' ? result.name : `${result.name}, ${result.city}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-secondary hover:bg-primary/20 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
        }}
        aria-label="View on Google Maps"
      >
        <Navigation className="h-4 w-4" />
      </a>
    </div>
  );
};

export default SearchResultItem;