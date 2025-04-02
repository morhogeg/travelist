
import { useCallback } from "react";
import { 
  getUserPlaces, 
  getRecommendations 
} from "@/utils/recommendation-parser";
import { getSmartImage } from "@/utils/recommendation-helpers";
import { Place } from "@/components/recommendations/types";

export const useRecommendationProcessor = () => {
  // Process and format places with their recommendations
  const processPlacesWithRecommendations = useCallback(() => {
    try {
      const places = getUserPlaces();
      const recommendations = getRecommendations();
      
      console.log("Saved places:", places);
      console.log("Recommendations:", recommendations);
      
      // Extract all unique categories from user recommendations
      const allCategories = Array.from(new Set(
        recommendations.flatMap(rec => 
          rec.places.map(p => {
            // Ensure category is properly capitalized
            const category = String(p.category);
            return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
          })
        )
      )) as string[];
      
      // Format places with categories and recommendations
      const placesWithData = places.map(place => {
        // Find all recommendations for this place
        const placeRecommendations = recommendations.filter(
          rec => {
            const recCityId = rec.cityId || rec.id;
            return recCityId === place.id || rec.city === place.name;
          }
        );
        
        // Get unique categories for this place
        const categories = Array.from(new Set(
          placeRecommendations.flatMap(rec => 
            rec.places.map(p => {
              // Ensure category is properly capitalized
              const category = String(p.category);
              return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
            })
          )
        ));
        
        // Get actual recommendations for each place
        const placeRecs = placeRecommendations.flatMap(rec => 
          rec.places.map(p => ({
            id: p.id || `${rec.id}-${p.name}`,
            name: p.name,
            category: p.category,
            image: p.image || getSmartImage(p.name, p.category),
            visited: p.visited || false,
            website: p.website
          }))
        );
        
        return { 
          ...place, 
          categories,
          recommendations: placeRecs
        } as Place;
      });
      
      // Sort places by country and then by name
      const sortedPlaces = placesWithData.sort((a, b) => {
        // First group by country
        const countryA = a.country || '';
        const countryB = b.country || '';
        
        if (countryA !== countryB) {
          return countryA.localeCompare(countryB);
        }
        
        // Then sort by name within each country
        return a.name.localeCompare(b.name);
      });
      
      return {
        places: sortedPlaces,
        categories: allCategories
      };
    } catch (error) {
      console.error("Error processing places:", error);
      return {
        places: [],
        categories: []
      };
    }
  }, []);

  return { processPlacesWithRecommendations };
};
