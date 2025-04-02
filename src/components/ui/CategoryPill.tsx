
import React from "react";
import { motion } from "framer-motion";

interface CategoryPillProps {
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const CategoryPill = ({
  label,
  icon,
  isActive = false,
  onClick,
}: CategoryPillProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-primary hover:shadow-sm"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
};

export default CategoryPill;
