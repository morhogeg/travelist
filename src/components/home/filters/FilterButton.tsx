import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { mediumHaptic } from "@/utils/ios/haptics";

interface FilterButtonProps {
  activeCount: number;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ activeCount, onClick }) => {
  const handleClick = () => {
    mediumHaptic();
    onClick();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className="relative flex items-center justify-center min-h-11 min-w-11 px-3 rounded-xl liquid-glass-clear ios26-transition-spring hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 flex-shrink-0"
      aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ""}`}
    >
      <SlidersHorizontal className="h-5 w-5 text-[#667eea] opacity-70" />

      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
            }}
          >
            {activeCount}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default FilterButton;
