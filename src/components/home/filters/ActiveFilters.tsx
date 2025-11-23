import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FilterState } from "@/types/filters";
import { lightHaptic } from "@/utils/ios/haptics";

interface ActiveFiltersProps {
  filters: FilterState;
  onRemoveFilter: (filterKey: keyof FilterState, value?: string) => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemoveFilter }) => {
  const chips: { key: keyof FilterState; label: string; value?: string }[] = [];

  // Visit status
  if (filters.visitStatus !== "all") {
    chips.push({
      key: "visitStatus",
      label: filters.visitStatus === "visited" ? "Visited" : "Not Visited",
    });
  }

  // Sources (only show if not filtering by specific friend names)
  if (filters.sourceNames.length === 0) {
    filters.sources.forEach((source) => {
      chips.push({
        key: "sources",
        label: source.charAt(0).toUpperCase() + source.slice(1),
        value: source,
      });
    });
  }

  // Source Names (specific friends) - these override generic source chips
  filters.sourceNames.forEach((name) => {
    chips.push({
      key: "sourceNames",
      label: name,
      value: name,
    });
  });

  // Priorities
  filters.priorities.forEach((priority) => {
    chips.push({
      key: "priorities",
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: priority,
    });
  });

  // Occasions
  filters.occasions.forEach((occasion) => {
    chips.push({
      key: "occasions",
      label: occasion,
      value: occasion,
    });
  });

  // Countries
  filters.countries.forEach((country) => {
    chips.push({
      key: "countries",
      label: country,
      value: country,
    });
  });

  // Cities
  filters.cities.forEach((city) => {
    chips.push({
      key: "cities",
      label: city,
      value: city,
    });
  });

  if (chips.length === 0) return null;

  const handleRemove = (key: keyof FilterState, value?: string) => {
    lightHaptic();
    onRemoveFilter(key, value);
  };

  return (
    <div className="px-4 pb-3">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {chips.map((chip, index) => (
            <motion.div
              key={`${chip.key}-${chip.value || "single"}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
              }}
            >
              <span>{chip.label}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemove(chip.key, chip.value)}
                className="h-4 w-4 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 ios26-transition-smooth"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-3 w-3" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActiveFilters;
