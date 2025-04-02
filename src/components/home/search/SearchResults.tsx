
import React from "react";
import { SearchResult } from "./types";
import SearchResultItem from "./SearchResultItem";

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  showResults: boolean;
  onResultClick: (result: SearchResult) => void;
}

const SearchResults = ({ results, searchTerm, showResults, onResultClick }: SearchResultsProps) => {
  if (!showResults) return null;
  
  if (results.length === 0 && searchTerm.trim() !== "") {
    return (
      <div className="absolute z-10 mt-2 w-full bg-background border rounded-lg shadow-lg p-4 text-center">
        <p className="text-muted-foreground">No places or recommendations found matching "{searchTerm}"</p>
      </div>
    );
  }
  
  if (results.length === 0) return null;
  
  return (
    <div className="absolute z-10 mt-2 w-full bg-background border rounded-lg shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto">
      {results.map(result => (
        <SearchResultItem 
          key={`${result.type}-${result.id}`}
          result={result} 
          onClick={onResultClick} 
        />
      ))}
    </div>
  );
};

export default SearchResults;
