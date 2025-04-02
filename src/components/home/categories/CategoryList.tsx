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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex gap-3 pb-2"
    >
      {categories.map((category) => (
        <CategoryPill
          key={category.id}
          label={category.label}
          icon={category.icon}
          isActive={activeCategories.includes(category.id)}
          onClick={() => onCategoryToggle(category.id)}
        />
      ))}
    </motion.div>
  );
};

export default CategoryList;
