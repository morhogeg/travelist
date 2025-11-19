import React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, Minus } from "lucide-react";
import { VisitPriority } from "@/utils/recommendation/types";
import { lightHaptic } from "@/utils/ios/haptics";

interface PrioritySectionProps {
  values: VisitPriority[];
  onChange: (values: VisitPriority[]) => void;
}

const priorityOptions: { value: VisitPriority; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "high", label: "High", icon: <Flame className="h-4 w-4" />, color: "text-red-500" },
  { value: "medium", label: "Medium", icon: <TrendingUp className="h-4 w-4" />, color: "text-orange-500" },
  { value: "low", label: "Low", icon: <Minus className="h-4 w-4" />, color: "text-gray-500" },
];

const PrioritySection: React.FC<PrioritySectionProps> = ({ values, onChange }) => {
  const handleToggle = (priority: VisitPriority) => {
    lightHaptic();
    const newValues = values.includes(priority)
      ? values.filter((p) => p !== priority)
      : [...values, priority];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priority</h3>
      <div className="grid grid-cols-3 gap-2">
        {priorityOptions.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(option.value)}
              className={`
                flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl
                border ios26-transition-smooth
                ${
                  isSelected
                    ? "border-[#667eea] bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10"
                    : "border-white/20 liquid-glass-clear hover:border-[#667eea]/30"
                }
              `}
            >
              <div className={isSelected ? "text-[#667eea]" : option.color}>
                {option.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-[#667eea]" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PrioritySection;
