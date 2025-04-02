import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getUserPlaces } from "@/utils/recommendation-parser";
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
    const places = getUserPlaces();
    if (places && places.length > 0) {
      const uniqueCities = Array.from(new Set(
        places.map(place => place.name?.trim()).filter(Boolean)
      )) as string[];
      setSavedCities(uniqueCities.sort());
    }
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

  const filteredCities = savedCities.filter(city =>
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
            <Input 
              placeholder="Enter city name" 
              {...field} 
              value={cityInputValue}
              onChange={handleCityChange}
              onFocus={() => setShowSuggestions(cityInputValue.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
