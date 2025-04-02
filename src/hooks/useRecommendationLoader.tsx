import { useState, useEffect } from "react";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import { GroupedRecommendation } from "@/utils/recommendation/types";

export const useRecommendationLoader = (category: string) => {
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [version, setVersion] = useState(0);

  const loadRecommendations = () => {
    console.log("Loading recommendations for category:", category);
    const recommendations = getFilteredRecommendations(category);

    // ✅ Deep clone the data to force React to re-render
    const cloned = JSON.parse(JSON.stringify(recommendations));
    setGroupedRecommendations(cloned);
  };

  useEffect(() => {
    loadRecommendations();
  }, [category, version]);

  useEffect(() => {
    const handleChange = () => {
      setVersion(prev => prev + 1);
    };

    window.addEventListener('recommendationAdded', handleChange);
    window.addEventListener('recommendationDeleted', handleChange);
    window.addEventListener('placeDeleted', handleChange);
    window.addEventListener('recommendationVisited', handleChange);

    return () => {
      window.removeEventListener('recommendationAdded', handleChange);
      window.removeEventListener('recommendationDeleted', handleChange);
      window.removeEventListener('placeDeleted', handleChange);
      window.removeEventListener('recommendationVisited', handleChange);
    };
  }, [category]);

  return {
    groupedRecommendations,
    loadRecommendations
  };
};