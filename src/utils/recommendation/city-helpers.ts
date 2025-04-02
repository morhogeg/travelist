
import { getRecommendations } from "../recommendation-parser";
import { Recommendation } from "./types";
import { getSmartImage } from "./image-helpers";
import { getUserPlaces } from "./user-places";

// Add a function to get recommendations for a specific city by ID
export const getRecommendationsForCity = (cityId: string): Recommendation[] => {
  if (!cityId) {
    console.error("Missing cityId in getRecommendationsForCity");
    return [];
  }
  
  const recommendations = getRecommendations();
  
  console.log("Getting recommendations for city ID:", cityId);
  
  // Find recommendations directly matching this city ID
  const cityRecs = recommendations.filter(rec => {
    return rec.id === cityId || rec.cityId === cityId;
  });
  
  if (cityRecs.length > 0) {
    // Found direct matches by ID
    return cityRecs.flatMap(cityRec => 
      cityRec.places.map(place => ({
        id: place.id || `place-${Date.now()}-${Math.random()}`,
        name: place.name,
        location: cityRec.city,
        image: place.image || getSmartImage(place.name, place.category),
        category: place.category,
        description: place.description,
        recId: cityRec.id,
        dateAdded: cityRec.dateAdded,
        visited: place.visited || false,
        website: place.website
      }))
    );
  }
  
  // If not found by ID, try to find the city name from the places collection
  const allPlaces = getUserPlaces();
  const cityPlace = allPlaces.find(place => place.id === cityId);
  
  if (cityPlace) {
    // Now look for recommendations matching this city name
    const cityNameRecs = recommendations.filter(rec => 
      rec.city.toLowerCase() === cityPlace.name.toLowerCase()
    );
    
    if (cityNameRecs.length > 0) {
      return cityNameRecs.flatMap(cityRec => 
        cityRec.places.map(place => ({
          id: place.id || `place-${Date.now()}-${Math.random()}`,
          name: place.name,
          location: cityRec.city,
          image: place.image || getSmartImage(place.name, place.category),
          category: place.category,
          description: place.description,
          recId: cityRec.id,
          dateAdded: cityRec.dateAdded,
          visited: place.visited || false,
          website: place.website
        }))
      );
    }
  }
  
  // As a last resort, try to find recommendations with matching city name without a known city
  // First get the city name from the recommendations collection
  const cityNameFromRecs = recommendations.find(rec => rec.id === cityId)?.city;
  
  if (cityNameFromRecs) {
    // Look for recommendations with this city name
    const matchingCityRecs = recommendations.filter(rec => 
      rec.city.toLowerCase() === cityNameFromRecs.toLowerCase()
    );
    
    if (matchingCityRecs.length > 0) {
      return matchingCityRecs.flatMap(cityRec => 
        cityRec.places.map(place => ({
          id: place.id || `place-${Date.now()}-${Math.random()}`,
          name: place.name,
          location: cityRec.city,
          image: place.image || getSmartImage(place.name, place.category),
          category: place.category,
          description: place.description,
          recId: cityRec.id,
          dateAdded: cityRec.dateAdded,
          visited: place.visited || false,
          website: place.website
        }))
      );
    }
  }
  
  console.error("City not found with ID:", cityId);
  return [];
};
