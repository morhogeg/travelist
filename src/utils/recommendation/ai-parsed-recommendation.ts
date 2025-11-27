/**
 * Process AI-parsed recommendations and save them
 */

import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { storeRecommendation } from "@/utils/recommendation-parser";
import { getSmartImage } from "@/utils/image/getSmartImage";
import type { ParsedPlace } from "@/services/ai/providers/openrouter-parser";

export interface AIParsedFormValues {
  city: string;
  country: string;
  recommendations: string;
  parsedPlaces: ParsedPlace[];
}

export const processAIParsedRecommendation = async (
  values: AIParsedFormValues,
  toast: ReturnType<typeof useToast>["toast"]
): Promise<{ ids: string[] } | null> => {
  try {
    if (!values.city || !values.country || values.parsedPlaces.length === 0) {
      toast({
        title: "Missing information",
        description: "Please provide city, country, and at least one place",
        variant: "destructive",
      });
      return null;
    }

    const cityId = uuidv4();
    const savedIds: string[] = [];
    const places = [];
    const categories = new Set<string>();

    // Process each parsed place
    for (const parsed of values.parsedPlaces) {
      const placeId = uuidv4();
      const recId = uuidv4();

      // Get image for the place
      const image = await getSmartImage(
        `${parsed.name} ${values.city}`,
        parsed.category
      );

      const newPlace: any = {
        id: placeId,
        recId,
        name: parsed.name,
        category: parsed.category.charAt(0).toUpperCase() + parsed.category.slice(1), // Capitalize
        description: parsed.description || "",
        website: "",
        image,
        visited: false,
        dateAdded: new Date().toISOString(),
      };

      // Add source if detected by AI
      if (parsed.source) {
        newPlace.source = parsed.source;
        console.log('[AI Parser] Source detected:', parsed.source);
      }

      places.push(newPlace);
      categories.add(newPlace.category);
      savedIds.push(placeId);
    }

    // Create the recommendation record
    const newRec = {
      id: cityId,
      cityId,
      city: values.city,
      country: values.country,
      categories: Array.from(categories),
      places,
      rawText: values.recommendations,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRec);
    window.dispatchEvent(new CustomEvent("recommendationAdded"));

    toast({
      title: `${places.length} place${places.length > 1 ? 's' : ''} added!`,
      description: `Successfully saved to ${values.city}, ${values.country}`,
    });

    return { ids: savedIds };
  } catch (error) {
    console.error("Error saving AI-parsed recommendations:", error);
    toast({
      title: "Error",
      description: "Could not save your recommendations.",
      variant: "destructive",
    });
    return null;
  }
};
