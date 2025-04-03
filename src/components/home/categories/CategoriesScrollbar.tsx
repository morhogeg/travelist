import React, { useState } from "react";
import { Compass } from "lucide-react";
import { getCategoryIcon } from "@/components/recommendations/utils/category-data";
import CategoryList from "./CategoryList";
import CategoriesScrollContainer from "./CategoriesScrollContainer";
import { useUserCategories, dispatchCategorySelectedEvent } from "./category-utils";
import type { CategoryItem } from "./category-utils";
import ViewModeToggle from "../category/ViewModeToggle"; // ✅ import toggle
import type { ViewModeToggleProps } from "../category/ViewModeToggle";

interface CategoriesScrollbarProps {
  viewMode: "grid" | "list";
  onToggleViewMode: () => void;
}

const CategoriesScrollbar: React.FC<CategoriesScrollbarProps> = ({
  viewMode,
  onToggleViewMode
}) => {
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
    <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
      <CategoriesScrollContainer>
        <CategoryList 
          categories={allCategories}
          activeCategories={resolvedActive}
          onCategoryToggle={handleCategoryToggle}
        />
      </CategoriesScrollContainer>
      <ViewModeToggle viewMode={viewMode} onToggleViewMode={onToggleViewMode} />
    </div>
  );
};

export default CategoriesScrollbar;