
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  parseRecommendation 
} from "@/utils/recommendation/parser";
import { 
  storeRecommendation, 
  addToUserPlaces 
} from "@/utils/recommendation-parser";
import {
  StructuredFormValues,
  FreeTextFormValues
} from "@/utils/recommendation/types";

export const useRecommendationSubmit = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFreeTextSubmit = async (values: FreeTextFormValues): Promise<boolean> => {
    setIsAnalyzing(true);
    try {
      // Process free text recommendation
      const result = parseRecommendation(values.city, values.recommendations);
      
      if (result.places.length > 1) {
        const uniquePlaceNames = new Set<string>();
        result.places = result.places.filter(place => {
          const baseName = place.name.toLowerCase().replace(/^(the|a|an) /, '');
          if (uniquePlaceNames.has(baseName)) {
            return false;
          }
          uniquePlaceNames.add(baseName);
          return true;
        });
      }
      
      storeRecommendation(result);
      
      // Add city to user places
      addToUserPlaces(values.city);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('recommendationAdded'));
      window.dispatchEvent(new CustomEvent('userPlacesChanged'));
      window.dispatchEvent(new CustomEvent('placeDeleted'));
      
      toast({
        title: "Recommendation added!",
        description: `Added ${result.places.length} ${result.places.length === 1 ? 'place' : 'places'} to ${result.city}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error analyzing recommendation:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't analyze your recommendation. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleStructuredSubmit = async (values: StructuredFormValues): Promise<boolean> => {
    setIsAnalyzing(true);
    try {
      console.log("Handling structured submit with values:", values);
      
      // Create a single recommendation place from the form values
      const place = {
        name: values.name,
        category: values.category,
        description: values.description || undefined,
        website: values.website || undefined,
        id: crypto.randomUUID()
      };
      
      // Process structured recommendation with a single place
      const result = parseRecommendation(values.city, [place]);
      
      // Add country if provided
      if (values.country && values.country !== "none") {
        result.country = values.country;
      }
      
      console.log("Parsed recommendation:", result);
      storeRecommendation(result);
      
      // Add city to user places with country
      addToUserPlaces(values.city, values.country !== "none" ? values.country : undefined);
      
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('recommendationAdded'));
      window.dispatchEvent(new CustomEvent('userPlacesChanged'));
      window.dispatchEvent(new CustomEvent('placeDeleted'));
      
      toast({
        title: "Recommendation added!",
        description: `Added "${values.name}" to ${values.city}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding structured recommendation:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't add your recommendation. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    handleFreeTextSubmit,
    handleStructuredSubmit
  };
};
