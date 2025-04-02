
import { useState } from "react";

export const useCategoryFilter = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };
  
  const resetCategoryFilter = () => {
    setSelectedCategory("all");
  };
  
  return {
    selectedCategory,
    handleCategoryChange,
    resetCategoryFilter
  };
};
