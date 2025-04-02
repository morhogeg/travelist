
// This file serves as the main entry point for recommendation utility functions
// It re-exports functions from the more focused utility files
import { getFilteredRecommendations } from "./recommendation/filter-helpers";
import { getRecommendationsForCity } from "./recommendation/city-helpers";
import { getSmartImage } from "./recommendation/image-helpers";
import { getCategoryPlaceholder } from "@/utils/image/getCategoryPlaceholder";
import { Recommendation, GroupedRecommendation } from "./recommendation/types";

// Re-export functions and types
export { 
  getFilteredRecommendations,
  getRecommendationsForCity,
  getCategoryPlaceholder,
  getSmartImage
};

// Re-export types
export type { Recommendation, GroupedRecommendation };
