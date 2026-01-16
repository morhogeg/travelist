
import React, { useState, useRef, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormValues } from "./types";
import { countryList } from "@/utils/countries";
import { X } from "lucide-react";

interface CountrySelectProps {
  form: UseFormReturn<FormValues>;
  initialCountry?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ form, initialCountry = "" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter countries based on search term
  const filteredCountries = countryList.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If there's an initialCountry and the form doesn't have a country value yet, set it
  useEffect(() => {
    if (initialCountry && !form.getValues("country")) {
      form.setValue("country", initialCountry);
      setSearchTerm(initialCountry);
    }
  }, [initialCountry, form]);

  // Sync form value changes to searchTerm
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'country' && value.country) {
        setSearchTerm(value.country);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    setHighlightedIndex(-1);

    // Only set form value if it's an exact match
    const exactMatch = countryList.find(c => c.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      form.setValue("country", exactMatch);
    } else {
      form.setValue("country", value);
    }
  };

  const handleSelectCountry = (country: string) => {
    setSearchTerm(country);
    form.setValue("country", country);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          handleSelectCountry(filteredCountries[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  const clearInput = () => {
    setSearchTerm("");
    form.setValue("country", "");
    inputRef.current?.focus();
  };

  return (
    <FormField
      control={form.control}
      name="country"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Country</FormLabel>
          <FormControl>
            <div ref={containerRef} className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className="pr-8"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Dropdown */}
              {showDropdown && filteredCountries.length > 0 && (
                <div className="absolute z-50 w-full mt-1 max-h-[200px] overflow-y-auto bg-background border border-border rounded-md shadow-lg">
                  {filteredCountries.slice(0, 10).map((country, index) => (
                    <button
                      key={country}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${index === highlightedIndex ? "bg-accent" : ""
                        }`}
                    >
                      {country}
                    </button>
                  ))}
                  {filteredCountries.length > 10 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      {filteredCountries.length - 10} more...
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CountrySelect;
