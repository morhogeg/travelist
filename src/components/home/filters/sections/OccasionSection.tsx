import React from "react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { lightHaptic } from "@/utils/ios/haptics";

interface OccasionSectionProps {
  values: string[];
  availableOccasions: string[];
  onChange: (values: string[]) => void;
}

const OccasionSection: React.FC<OccasionSectionProps> = ({ values, availableOccasions, onChange }) => {
  const handleToggle = (occasion: string) => {
    lightHaptic();
    const newValues = values.includes(occasion)
      ? values.filter((o) => o !== occasion)
      : [...values, occasion];
    onChange(newValues);
  };

  if (availableOccasions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-[#667eea]" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Occasions</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableOccasions.map((occasion) => {
          const isSelected = values.includes(occasion);
          return (
            <motion.button
              key={occasion}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(occasion)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                border ios26-transition-smooth
                ${
                  isSelected
                    ? "border-[#667eea] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                    : "border-white/20 liquid-glass-clear text-gray-700 dark:text-gray-300 hover:border-[#667eea]/30"
                }
              `}
            >
              {occasion}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default OccasionSection;
