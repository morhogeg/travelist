
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
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold ios26-transition-spring relative ${
        isActive
          ? "text-white shadow-lg"
          : "liquid-glass-clear text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
      }`}
      style={isActive ? {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
      } : undefined}
    >
      <span className={isActive ? "opacity-100" : "opacity-70"}>
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
};

export default CategoryPill;
