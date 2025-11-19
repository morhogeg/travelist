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
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-clear border border-white/20 ios26-transition-smooth hover:border-[#667eea]/50 flex-shrink-0 whitespace-nowrap"
      aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ""}`}
    >
      <SlidersHorizontal className="h-4 w-4 text-[#667eea]" />
      <span className="text-sm font-medium text-[#667eea]">Filters</span>

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
