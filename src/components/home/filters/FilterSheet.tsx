import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { FilterState, resetFilters, hasActiveFilters } from "@/types/filters";
import { mediumHaptic, lightHaptic } from "@/utils/ios/haptics";
import VisitStatusSection from "./sections/VisitStatusSection";
import SourceSection from "./sections/SourceSection";
import OccasionSection from "./sections/OccasionSection";
import LocationSection from "./sections/LocationSection";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCountries: string[];
  availableCities: string[];
  availableOccasions: string[];
  availableSourceNames: string[];
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCountries,
  availableCities,
  availableOccasions,
  availableSourceNames,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const hasFilters = hasActiveFilters(localFilters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    mediumHaptic();
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    mediumHaptic();
    setLocalFilters(resetFilters());
  };

  const handleDrawerChange = (open: boolean) => {
    if (!open) {
      lightHaptic();
      setLocalFilters(filters);
      onClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleDrawerChange}>
      <DrawerContent className="p-0 flex flex-col transition-all duration-300 ease-in-out" style={{ height: 'auto', minHeight: '60vh', maxHeight: '96vh' }}>
        <div className="flex flex-col h-full max-h-[96vh]">
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 pt-2 pb-3 border-b border-white/5 shrink-0">
            <h2 className="text-lg font-bold text-[#667eea] dark:text-white leading-none">Filters</h2>
            {hasFilters && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="absolute right-6 text-sm font-semibold text-[#667eea] ios26-transition-smooth hover:opacity-70"
              >
                Reset
              </motion.button>
            )}
          </div>

          {/* Filter Sections - Scrollable */}
          <div
            className="flex-1 overflow-y-auto px-6 pt-4 pb-6 space-y-7 overscroll-contain no-tap-highlight"
            style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
          >
            <VisitStatusSection
              value={localFilters.visitStatus}
              onChange={(value) => setLocalFilters({ ...localFilters, visitStatus: value })}
            />

            <SourceSection
              values={localFilters.sources}
              onChange={(values) => setLocalFilters({ ...localFilters, sources: values })}
              sourceNames={localFilters.sourceNames}
              onSourceNamesChange={(values) => setLocalFilters({ ...localFilters, sourceNames: values })}
              availableSourceNames={availableSourceNames}
            />

            {availableOccasions.length > 0 && (
              <OccasionSection
                values={localFilters.occasions}
                availableOccasions={availableOccasions}
                onChange={(values) => setLocalFilters({ ...localFilters, occasions: values })}
              />
            )}

            <LocationSection
              countries={localFilters.countries}
              cities={localFilters.cities}
              availableCountries={availableCountries}
              availableCities={availableCities}
              onCountriesChange={(values) => setLocalFilters({ ...localFilters, countries: values })}
              onCitiesChange={(values) => setLocalFilters({ ...localFilters, cities: values })}
            />
          </div>

          {/* Footer with Apply Button */}
          <div className="px-8 py-4 pb-8 border-t border-white/5 shrink-0 bg-background/80 backdrop-blur-md flex flex-col gap-2">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleApply}
              className="w-full py-3 rounded-full text-white font-bold text-sm ios26-transition-spring shadow-lg"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
              }}
            >
              Apply Filters
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-2.5 rounded-full text-muted-foreground font-semibold text-sm ios26-transition-spring hover:bg-white/5"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FilterSheet;
