import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ClearableInput } from "@/components/ui/clearable-input";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface CityInputProps {
  form: UseFormReturn<FormValues>;
  initialCity: string;
}

const CityInput: React.FC<CityInputProps> = ({ form, initialCity }) => {
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cityInputValue, setCityInputValue] = useState(initialCity);

  useEffect(() => {
    // Get cities sorted by most recent activity (last card added)
    const recommendations = getRecommendations();

    // Build a map of city -> most recent dateAdded
    const cityLastActivity: Record<string, string> = {};
    recommendations.forEach(rec => {
      const city = rec.city?.trim();
      if (city) {
        // Get the most recent date from all places in this recommendation
        const dates = rec.places?.map(p => p.dateAdded || rec.dateAdded).filter(Boolean) || [rec.dateAdded];
        const mostRecent = dates.sort().reverse()[0];
        if (!cityLastActivity[city] || mostRecent > cityLastActivity[city]) {
          cityLastActivity[city] = mostRecent;
        }
      }
    });

    // Sort cities by most recent activity (descending)
    const sortedCities = Object.keys(cityLastActivity).sort((a, b) => {
      return (cityLastActivity[b] || '').localeCompare(cityLastActivity[a] || '');
    });

    setSavedCities(sortedCities);
  }, []);

  const handleCitySelect = (cityName: string) => {
    form.setValue('city', cityName);
    setCityInputValue(cityName);
    setShowSuggestions(false);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInputValue(value);
    form.setValue('city', value);
    setShowSuggestions(value.length > 0);
  };

  // Show all cities when input is empty, filter when typing
  const filteredCities = cityInputValue.length === 0
    ? savedCities.slice(0, 8) // Show first 8 when empty
    : savedCities.filter(city =>
        city.toLowerCase().startsWith(cityInputValue.toLowerCase())
      );

  return (
    <FormField
      control={form.control}
      name="city"
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>City or Location</FormLabel>
          <FormControl>
            <ClearableInput
              placeholder="Enter city name"
              {...field}
              value={cityInputValue}
              onChange={handleCityChange}
              onFocus={() => setShowSuggestions(savedCities.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onClear={() => {
                setCityInputValue("");
                form.setValue("city", "");
              }}
            />
          </FormControl>
          {showSuggestions && filteredCities.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredCities.map((city) => (
                <div
                  key={city}
                  className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CityInput;
