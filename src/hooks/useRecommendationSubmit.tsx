import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  parseRecommendation 
} from "@/utils/recommendation/parser";
import { 
  storeRecommendation, 
  addToUserPlaces,
  getRecommendations
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
  
  const handleStructuredSubmit = async (values: StructuredFormValues, existingRecId?: string): Promise<boolean> => {
    setIsAnalyzing(true);
    try {
      console.log("🔍 STRUCTURED SUBMIT - Full values:", values);
      console.log("🔍 Source data:", values.source);
      console.log("🔍 Context data:", values.context);
      console.log("Editing existing recommendation ID:", existingRecId);
      
      // Check if we're editing an existing recommendation
      if (existingRecId) {
        // Get all recommendations
        const recommendations = getRecommendations();
        let found = false;
        
        // Loop through all recommendations to find the place to update
        for (const rec of recommendations) {
          // Try to find the place in this recommendation
          for (let i = 0; i < rec.places.length; i++) {
            const place = rec.places[i];
            if (place.id === existingRecId || place.recId === existingRecId) {
              console.log("Found place to update:", place);
              
              // Update the existing recommendation
              rec.places[i] = {
                ...place,
                name: values.name,
                category: values.category,
                description: values.description || "",
                website: values.website || "",
                // Keep the existing ID and visited status
                id: place.id,
                recId: place.recId || existingRecId,
                visited: place.visited || false,
                source: values.source,
                context: values.context,
              };
              
              // Update categories if needed
              if (!rec.categories.includes(values.category)) {
                rec.categories.push(values.category);
              }
              
              // Update country if provided
              if (values.country && values.country !== "none") {
                rec.country = values.country;
              }
              
              // Save the updated recommendations
              localStorage.setItem("recommendations", JSON.stringify(recommendations));
              window.dispatchEvent(new CustomEvent("recommendationAdded"));
              found = true;
              break;
            }
          }
          
          if (found) break;
        }
        
        if (found) {
          toast({
            title: "Recommendation updated!",
            description: `Updated "${values.name}" in ${values.city}`,
          });
          return true;
        }
        
        // If we didn't find the recommendation to edit, show an error
        toast({
          title: "Error updating recommendation",
          description: "Could not find the recommendation to update",
          variant: "destructive",
        });
        return false;
      }
      
      // Create a single recommendation place from the form values
      const place = {
        name: values.name,
        category: values.category,
        description: values.description || undefined,
        website: values.website || undefined,
        source: values.source,
        context: values.context,
        id: crypto.randomUUID()
      };

      console.log("🔍 Created place object:", place);
      console.log("🔍 Place source:", place.source);
      console.log("🔍 Place context:", place.context);

      // Process structured recommendation with a single place
      const result = parseRecommendation(values.city, [place]);

      console.log("🔍 parseRecommendation result:", result);
      console.log("🔍 Result places[0]:", result.places[0]);
      
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
