import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";
import { VisitStatusFilter } from "@/types/filters";
import { lightHaptic } from "@/utils/ios/haptics";

interface VisitStatusSectionProps {
  value: VisitStatusFilter;
  onChange: (value: VisitStatusFilter) => void;
}

const options: { value: VisitStatusFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Places", icon: <Sparkles className="h-4 w-4" /> },
  { value: "not-visited", label: "Not Visited", icon: <Circle className="h-4 w-4" /> },
  { value: "visited", label: "Visited", icon: <CheckCircle2 className="h-4 w-4" /> },
];

const VisitStatusSection: React.FC<VisitStatusSectionProps> = ({ value, onChange }) => {
  const handleSelect = (newValue: VisitStatusFilter) => {
    lightHaptic();
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Visit Status</h3>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(option.value)}
              className={`
                relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl
                border ios26-transition-smooth
                ${
                  isSelected
                    ? "border-[#667eea] bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10"
                    : "border-white/20 liquid-glass-clear hover:border-[#667eea]/30"
                }
              `}
            >
              <div className={isSelected ? "text-[#667eea]" : "text-gray-600 dark:text-gray-400"}>
                {option.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-[#667eea]" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </span>
              {isSelected && (
                <motion.div
                  layoutId="visit-status-indicator"
                  className="absolute inset-0 border-2 border-[#667eea] rounded-xl pointer-events-none"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VisitStatusSection;
