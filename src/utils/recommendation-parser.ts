// FILE: src/utils/recommendation/recommendation-parser.ts

import { parseRecommendation } from "./recommendation/parser";
import * as manager from "./recommendation/recommendation-manager";
import * as userPlaces from "./recommendation/user-places";

import type {
  ParsedRecommendation,
  RecommendationPlace,
  Recommendation,
  Place,
  GroupedRecommendation,
} from "./recommendation/types";

// Explicitly export each binding to avoid Vite import issues
export const {
  getRecommendations,
  storeRecommendation,
  deleteRecommendation,
  deleteCityAndRecommendations,
  markRecommendationVisited,
} = manager;

// Helper to get all unique source names from existing recommendations
export const getExistingSourceNames = (): string[] => {
  const recommendations = manager.getRecommendations();
  const names = new Set<string>();

  recommendations.forEach(rec => {
    rec.places?.forEach(place => {
      if (place.source?.name && place.source.type === 'friend') {
        names.add(place.source.name);
      }
    });
  });

  return Array.from(names).sort();
};

export const {
  getUserPlaces,
  addToUserPlaces,
  deletePlaceById,
} = userPlaces;

export { parseRecommendation };

export type {
  ParsedRecommendation,
  RecommendationPlace,
  Recommendation,
  Place,
  GroupedRecommendation,
};
