import { v4 as uuidv4 } from 'uuid';
import { ParsedRecommendation, RecommendationPlace } from '../types';
import { extractLineBasedPlaces, extractStructuredPlaces } from './extraction';
import { applyCategoryIntelligence } from './categorization';
import { capitalizeFirstLetter } from './helpers';

export function parseRecommendation(
  cityName: string,
  text: string | RecommendationPlace[],
  cityId?: string
): ParsedRecommendation {
  let places: RecommendationPlace[] = [];

  if (Array.isArray(text)) {
    places = text.map(place => {
      const id = place.id || uuidv4();
      return {
        ...place,
        id,
        recId: place.recId || id,
        category: capitalizeFirstLetter(place.category),
      };
    });
  } else {
    const cleanText = text.trim();
    places = extractStructuredPlaces(cleanText);
    if (places.length === 0) {
      places = extractLineBasedPlaces(cleanText);
    }
    places = applyCategoryIntelligence(places);
    places = places.map(place => {
      const id = place.id || uuidv4();
      return {
        ...place,
        id,
        recId: place.recId || id,
        category: capitalizeFirstLetter(place.category),
      };
    });
  }

  const categories = Array.from(new Set(places.map(place => place.category)));

  return {
    id: uuidv4(),
    city: cityName,
    cityId,
    categories,
    places,
    rawText: Array.isArray(text) ? JSON.stringify(text) : text,
    dateAdded: new Date().toISOString()
  };
}

export { capitalizeFirstLetter } from './helpers';
export { extractStructuredPlaces, extractLineBasedPlaces } from './extraction';
export { applyCategoryIntelligence } from './categorization';