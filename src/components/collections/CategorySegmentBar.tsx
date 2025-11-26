import React from "react";
import { motion } from "framer-motion";
import { CategoryBreakdown } from "@/utils/collections/collectionHelpers";

interface CategorySegmentBarProps {
  categories: CategoryBreakdown[];
}

const CategorySegmentBar: React.FC<CategorySegmentBarProps> = ({ categories }) => {
  if (categories.length === 0) return null;

  return (
    <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex overflow-hidden">
      {categories.map((cat, index) => (
        <motion.div
          key={cat.category}
          initial={{ width: 0 }}
          animate={{ width: `${cat.percentage}%` }}
          transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
          className="h-full first:rounded-l-full last:rounded-r-full"
          style={{ backgroundColor: cat.color }}
        />
      ))}
    </div>
  );
};

export default CategorySegmentBar;
