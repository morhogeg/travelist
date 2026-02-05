import React from "react";
import { CheckCircle2, Circle, Layers } from "lucide-react";
import { VisitStatusFilter } from "@/types/filters";
import { lightHaptic } from "@/utils/ios/haptics";
import SourcePill from "@/components/ui/SourcePill";

interface VisitStatusSectionProps {
  value: VisitStatusFilter;
  onChange: (value: VisitStatusFilter) => void;
}

const options: { value: VisitStatusFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Places", icon: <Layers className="h-4 w-4" /> },
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
      <div className="flex flex-nowrap gap-2 overflow-x-auto no-scrollbar py-0.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <SourcePill
              key={option.value}
              label={option.label}
              icon={option.icon}
              isActive={isSelected}
              onClick={() => handleSelect(option.value)}
              className="px-2.5 text-[11.5px] whitespace-nowrap flex-shrink-0"
            />
          );
        })}
      </div>
    </div>
  );
};

export default VisitStatusSection;
