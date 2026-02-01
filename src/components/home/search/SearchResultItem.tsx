import React from "react";
import { MapPin } from "lucide-react";
import { SearchResult } from "./types";
import { generateMapLink } from "@/utils/link-helpers";
import { getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";

interface SearchResultItemProps {
  result: SearchResult;
  onClick: (result: SearchResult) => void;
}

const SearchResultItem = ({ result, onClick }: SearchResultItemProps) => {
  const categoryIcon = result.category ? getCategoryIcon(result.category) : null;
  const categoryColor = result.category ? getCategoryColor(result.category) : "#667eea";

  return (
    <div
      key={`${result.type}-${result.id}`}
      className="px-3 py-2.5 hover:bg-secondary/60 cursor-pointer border-b border-border/50 last:border-0 flex items-center gap-3"
      onClick={() => onClick(result)}
    >
      {/* Category Icon */}
      {categoryIcon && (
        <div className="shrink-0" style={{ color: categoryColor }}>
          {categoryIcon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{result.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {result.type === 'place' && result.country}
          {result.type === 'recommendation' && `in ${result.city}`}
        </div>
      </div>

      {/* Navigation Icon */}
      <a
        href={generateMapLink(result.name, result.type === 'place' ? result.name : `${result.name}, ${result.city}`)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-full hover:bg-[#667eea]/20 transition-colors shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label="View on Google Maps"
      >
        <MapPin className="h-3.5 w-3.5 text-[#667eea]" />
      </a>
    </div>
  );
};

export default SearchResultItem;