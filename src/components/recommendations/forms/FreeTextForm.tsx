// FILE: src/components/recommendations/forms/FreeTextForm.tsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { parseWithGrok, ParsedPlace } from "@/services/ai/providers/openrouter-parser";
import { ParsePreviewSheet } from "../ParsePreviewSheet";
import { useToast } from "@/hooks/use-toast";

const freeTextFormSchema = z.object({
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  recommendations: z.string().min(3, "Enter at least one recommendation"),
});

type FreeTextFormValues = z.infer<typeof freeTextFormSchema>;

interface FreeTextFormProps {
  onSubmit: (values: FreeTextFormValues & { parsedPlaces: ParsedPlace[] }) => void;
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
      country: "",
      recommendations: "",
    },
  });

  const { toast } = useToast();
  const [savedCities, setSavedCities] = useState<string[]>([]);
  const [cityInputValue, setCityInputValue] = useState("");
  const [countryInputValue, setCountryInputValue] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // AI parsing state
  const [isParsing, setIsParsing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedPlaces, setParsedPlaces] = useState<ParsedPlace[]>([]);
  const [formValues, setFormValues] = useState<FreeTextFormValues | null>(null);

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

  // Auto-fill country when city matches existing recommendation
  const autoFillCountry = (cityName: string) => {
    const recommendations = getRecommendations();
    const existingCity = recommendations.find(
      r => r.city.toLowerCase().trim() === cityName.toLowerCase().trim()
    );
    if (existingCity?.country && !countryInputValue) {
      setCountryInputValue(existingCity.country);
      form.setValue("country", existingCity.country);
    }
  };

  const handleCitySelect = (name: string) => {
    form.setValue("city", name);
    setCityInputValue(name);
    setShowCitySuggestions(false);
    autoFillCountry(name);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInputValue(value);
    form.setValue("city", value);
    setShowCitySuggestions(value.length > 0);
    // Auto-fill country on blur or after typing
    if (value.length > 2) {
      autoFillCountry(value);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCountryInputValue(value);
    form.setValue("country", value);
  };

  // Handle form submission - parse with AI
  const handleFormSubmit = async (values: FreeTextFormValues) => {
    setFormValues(values);
    setIsParsing(true);

    try {
      const result = await parseWithGrok(
        values.recommendations,
        values.city,
        values.country
      );

      if (result.error) {
        toast({
          title: "Parsing failed",
          description: result.error,
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }

      if (result.places.length === 0) {
        toast({
          title: "No places found",
          description: "Could not extract any places from your text. Try a different format.",
          variant: "destructive",
        });
        setIsParsing(false);
        return;
      }

      setParsedPlaces(result.places);
      setShowPreview(true);
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "Error",
        description: "Failed to parse recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Update a parsed place
  const handleUpdatePlace = (index: number, updates: Partial<ParsedPlace>) => {
    setParsedPlaces(prev =>
      prev.map((place, i) => i === index ? { ...place, ...updates } : place)
    );
  };

  // Remove a parsed place
  const handleRemovePlace = (index: number) => {
    setParsedPlaces(prev => prev.filter((_, i) => i !== index));
  };

  // Confirm and save all places
  const handleConfirmSave = () => {
    if (formValues && parsedPlaces.length > 0) {
      onSubmit({
        ...formValues,
        parsedPlaces,
      });
      setShowPreview(false);
      setParsedPlaces([]);
      setFormValues(null);
      form.reset();
      setCityInputValue("");
      setCountryInputValue("");
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className="space-y-4 px-4 py-2"
        >
          {/* City and Country in a row */}
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="city"
              render={() => (
                <FormItem className="relative flex-1">
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Paris"
                      value={cityInputValue}
                      onChange={handleCityChange}
                      onFocus={() => setShowCitySuggestions(cityInputValue.length > 0)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    />
                  </FormControl>
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-40 overflow-auto">
                      {filteredCities.slice(0, 5).map((city) => (
                        <div
                          key={city}
                          className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
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
              name="country"
              render={() => (
                <FormItem className="flex-1">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. France"
                      value={countryInputValue}
                      onChange={handleCountryChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Recommendations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Sarah said the pizza at Luigi's is amazing"
                    className="min-h-[120px] text-[16px]"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Travelist extracts places, categories, tips & sources automatically
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full text-white"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
            disabled={isParsing || isAnalyzing}
          >
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create with Travelist
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Preview Sheet */}
      <ParsePreviewSheet
        isOpen={showPreview}
        onClose={handleClosePreview}
        parsedPlaces={parsedPlaces}
        onUpdatePlace={handleUpdatePlace}
        onRemovePlace={handleRemovePlace}
        onConfirm={handleConfirmSave}
        isLoading={isAnalyzing}
        city={formValues?.city || ""}
        country={formValues?.country || ""}
      />
    </>
  );
};
