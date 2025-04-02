
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  searchTerm: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const SearchInput = ({ searchTerm, onChange, onClear }: SearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search destinations, restaurants, landmarks..."
        className="w-full bg-secondary pl-12 pr-10 py-6 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        value={searchTerm}
        onChange={onChange}
      />
      
      {searchTerm.length > 0 && (
        <button 
          onClick={onClear}
          className="absolute right-4 top-3 p-0.5 rounded-full hover:bg-secondary-foreground/10 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
