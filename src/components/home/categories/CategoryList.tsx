import React from "react";
import { motion } from "framer-motion";
import CategoryPill from "@/components/ui/CategoryPill";
import { CategoryItem } from "./category-utils";

interface CategoryListProps {
  categories: CategoryItem[];
  activeCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  activeCategories,
  onCategoryToggle
}) => {
  return (
    <>
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          label={category.label}
          icon={category.icon}
          isActive={activeCategories.includes(category.id)}
          onClick={() => onCategoryToggle(category.id)}
        />
      ))}
    </>
  );
};

export default CategoryList;
