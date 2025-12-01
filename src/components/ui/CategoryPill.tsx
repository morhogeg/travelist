
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
      className={`flex items-center gap-1.5 min-h-11 py-2.5 px-3 rounded-full text-[13px] font-semibold ios26-transition-spring relative shadow-none outline-none select-none ${
        isActive
          ? "text-white"
          : "border border-border text-foreground dark:text-white hover:bg-muted/20 dark:hover:bg-muted/30 bg-muted/10 dark:bg-transparent"
      }`}
      style={isActive ? {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: 'none',
        WebkitTapHighlightColor: 'transparent'
      } : {
        border: 'none',
        boxShadow: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <span className={isActive ? "opacity-100" : "opacity-80"}>
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
};

export default CategoryPill;
