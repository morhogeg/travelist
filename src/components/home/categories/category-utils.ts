import { useEffect, useState } from "react";
import { getRecommendations } from "@/utils/recommendation-parser";

export interface CategoryItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export const useUserCategories = () => {
  const [userCategories, setUserCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const loadUserCategories = () => {
      const recommendations = getRecommendations();
      const categories = Array.from(new Set(
        recommendations.flatMap(rec => rec.places.map(place => place.category))
      ));

      const formattedCategories = categories
        .filter(category => category !== undefined && category !== null)
        .map(category => {
          const categoryStr = String(category);
          return {
            id: categoryStr.toLowerCase(),
            label: categoryStr.charAt(0).toUpperCase() + categoryStr.slice(1)
          };
        });

      const uniqueFormattedCategories: CategoryItem[] = [];
      const uniqueIds = new Set<string>();
      formattedCategories.forEach(cat => {
        if (!uniqueIds.has(cat.id)) {
          uniqueIds.add(cat.id);
          uniqueFormattedCategories.push(cat);
        }
      });

      setUserCategories(uniqueFormattedCategories);
    };

    loadUserCategories();

    const handleRecommendationChange = () => {
      loadUserCategories();
    };

    window.addEventListener('recommendationAdded', handleRecommendationChange);
    window.addEventListener('recommendationDeleted', handleRecommendationChange);
    window.addEventListener('placeDeleted', handleRecommendationChange);

    return () => {
      window.removeEventListener('recommendationAdded', handleRecommendationChange);
      window.removeEventListener('recommendationDeleted', handleRecommendationChange);
      window.removeEventListener('placeDeleted', handleRecommendationChange);
    };
  }, []);

  return userCategories;
};

export const dispatchCategorySelectedEvent = (categoryId: string) => {
  const event = new CustomEvent<string>('categorySelected', { detail: categoryId });
  window.dispatchEvent(event);
};
