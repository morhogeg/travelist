import React from "react";
import { motion } from "framer-motion";

interface EmptyCategoryStateProps {
  category: string | string[];
}

const EmptyCategoryState: React.FC<EmptyCategoryStateProps> = ({ category }) => {
  const displayCategory =
    typeof category === "string"
      ? category
      : category.length > 0
      ? category[0]
      : "Selected";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <p className="text-lg text-muted-foreground">
        No {displayCategory} recommendations yet
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        Add some {displayCategory.toLowerCase()} recommendations to see them here
      </p>
    </motion.div>
  );
};

export default EmptyCategoryState;