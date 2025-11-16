
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
      <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      <Input
        type="text"
        placeholder="Search destinations, restaurants, landmarks..."
        className="w-full liquid-glass-clear border-white/20 dark:border-white/10 pl-12 pr-10 py-6 rounded-2xl text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ios26-transition-smooth"
        value={searchTerm}
        onChange={onChange}
      />

      {searchTerm.length > 0 && (
        <button
          onClick={onClear}
          className="absolute right-4 top-3.5 p-0.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-neutral-500" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
