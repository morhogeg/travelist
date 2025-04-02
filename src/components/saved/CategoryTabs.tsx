
import React from "react";
import CategoryPill from "@/components/ui/CategoryPill";
import { getCategoryIcon } from "@/components/recommendations/utils/category-data";
import CategoriesScrollContainer from "@/components/home/categories/CategoriesScrollContainer";

interface CategoryTabsProps {
  selectedCategory: string;
  allCategories: string[];
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  selectedCategory, 
  allCategories, 
  onCategoryChange,
  children 
}) => {
  // Add the "All" category always at the beginning
  const displayCategories = ["all", ...allCategories];

  return (
    <div className="w-full">
      <CategoriesScrollContainer>
        <div className="flex gap-3 pb-2">
          {displayCategories.map((category) => (
            <CategoryPill
              key={category}
              label={category === "all" ? "All" : category}
              icon={category === "all" ? null : getCategoryIcon(category)}
              isActive={selectedCategory === category}
              onClick={() => onCategoryChange(category)}
            />
          ))}
        </div>
      </CategoriesScrollContainer>

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

export default CategoryTabs;
