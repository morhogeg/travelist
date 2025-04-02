import React, { useState } from "react";
import { Compass } from "lucide-react";
import { getCategoryIcon } from "@/components/recommendations/utils/category-data";
import CategoryList from "./CategoryList";
import CategoriesScrollContainer from "./CategoriesScrollContainer";
import { useUserCategories, dispatchCategorySelectedEvent } from "./category-utils";
import type { CategoryItem } from "./category-utils";

const CategoriesScrollbar: React.FC = () => {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const userCategories = useUserCategories();

  const allCategories: CategoryItem[] = [
    { id: "all", label: "All", icon: <Compass className="h-4 w-4" /> },
    ...userCategories.map(cat => ({
      ...cat,
      icon: getCategoryIcon(cat.id)
    }))
  ];

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === "all") {
      setActiveCategories([]);
      dispatchCategorySelectedEvent("all");
      return;
    }

    setActiveCategories(prev => {
      const updated = prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId];

      dispatchCategorySelectedEvent(updated.length === 0 ? "all" : updated);
      return updated;
    });
  };

  const resolvedActive = activeCategories.length === 0 ? ["all"] : activeCategories;

  return (
    <CategoriesScrollContainer>
      <CategoryList 
        categories={allCategories}
        activeCategories={resolvedActive}
        onCategoryToggle={handleCategoryToggle}
      />
    </CategoriesScrollContainer>
  );
};

export default CategoriesScrollbar;
