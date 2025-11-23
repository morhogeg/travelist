
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
      className={`flex items-center gap-2 min-h-11 py-2.5 px-4 rounded-xl text-sm font-semibold ios26-transition-spring relative shadow-none ${
        isActive
          ? "text-white"
          : "liquid-glass-clear bg-neutral-100/40 dark:bg-neutral-800/40 text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
      }`}
      style={isActive ? {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: 'none'
      } : {
        border: 'none',
        boxShadow: 'none'
      }}
    >
      <span className={isActive ? "opacity-100" : "opacity-70"}>
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
};

export default CategoryPill;
