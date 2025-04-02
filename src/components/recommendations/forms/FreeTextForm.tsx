// FILE: src/components/recommendations/forms/FreeTextForm.tsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getUserPlaces } from "@/utils/recommendation-parser";

const freeTextFormSchema = z.object({
  city: z.string().min(2, "City must be at least 2 characters"),
  recommendations: z.string().min(10, "Recommendations must be at least 10 characters"),
});

type FreeTextFormValues = z.infer<typeof freeTextFormSchema>;

interface FreeTextFormProps {
  onSubmit: (values: FreeTextFormValues) => void;
  isAnalyzing?: boolean;
}

export const FreeTextForm: React.FC<FreeTextFormProps> = ({ 
  onSubmit,
  isAnalyzing = false
}) => {
  const form = useForm<FreeTextFormValues>({
    resolver: zodResolver(freeTextFormSchema),
    defaultValues: {
      city: "",
      recommendations: "",
    },
  });

  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [cityInputValue, setCityInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const places = getUserPlaces();
    const unique = Array.from(new Set(
      places.map(place => place.name?.trim()).filter(Boolean)
    )) as string[];
    setSavedCities(unique.sort());
  }, []);

  const filteredCities = savedCities.filter(city =>
    city.toLowerCase().startsWith(cityInputValue.toLowerCase())
  );

  const handleCitySelect = (name: string) => {
    form.setValue("city", name);
    setCityInputValue(name);
    setShowSuggestions(false);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInputValue(value);
    form.setValue("city", value);
    setShowSuggestions(value.length > 0);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6 px-4 py-2"
      >
        <FormField
          control={form.control}
          name="city"
          render={() => (
            <FormItem className="relative">
              <FormLabel>City or Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. Paris" 
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

        <FormField
          control={form.control}
          name="recommendations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Recommendations</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your recommendations for this place..." 
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full dark:bg-muted dark:text-white dark:hover:bg-muted/80"
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Add Recommendation"}
        </Button>
      </form>
    </Form>
  );
};
