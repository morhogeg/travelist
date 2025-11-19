import React from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { PriceRangeFilter } from "@/types/filters";
import { lightHaptic } from "@/utils/ios/haptics";

interface PriceRangeSectionProps {
  values: PriceRangeFilter[];
  onChange: (values: PriceRangeFilter[]) => void;
}

const priceOptions: PriceRangeFilter[] = ["$", "$$", "$$$", "$$$$"];

const PriceRangeSection: React.FC<PriceRangeSectionProps> = ({ values, onChange }) => {
  const handleToggle = (price: PriceRangeFilter) => {
    lightHaptic();
    const newValues = values.includes(price)
      ? values.filter((p) => p !== price)
      : [...values, price];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price Range</h3>
      <div className="grid grid-cols-4 gap-2">
        {priceOptions.map((price) => {
          const isSelected = values.includes(price);
          return (
            <motion.button
              key={price}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(price)}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl
                border ios26-transition-smooth
                ${
                  isSelected
                    ? "border-[#667eea] bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10"
                    : "border-white/20 liquid-glass-clear hover:border-[#667eea]/30"
                }
              `}
            >
              <span
                className={`text-base font-bold ${
                  isSelected ? "text-[#667eea]" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {price}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceRangeSection;
