import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw } from "lucide-react";
import { FilterState, resetFilters, hasActiveFilters } from "@/types/filters";
import { mediumHaptic, lightHaptic } from "@/utils/ios/haptics";
import { Button } from "@/components/ui/button";
import VisitStatusSection from "./sections/VisitStatusSection";
import SourceSection from "./sections/SourceSection";
import PriceRangeSection from "./sections/PriceRangeSection";
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

  const handleClose = () => {
    lightHaptic();
    setLocalFilters(filters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
            onClick={handleClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] max-h-[85vh] flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="liquid-glass-tinted rounded-t-3xl border-t border-white/20 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-[#667eea]">Filters</h2>
                  {hasFilters && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 liquid-glass-clear border border-white/20 ios26-transition-smooth hover:border-[#667eea]/50"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </motion.button>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className="h-8 w-8 rounded-full flex items-center justify-center liquid-glass-clear border border-white/20 ios26-transition-smooth hover:border-[#667eea]/50"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>

              {/* Filter Sections - Scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

                <PriceRangeSection
                  values={localFilters.priceRanges}
                  onChange={(values) => setLocalFilters({ ...localFilters, priceRanges: values })}
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
              <div className="px-6 py-4 border-t border-white/10">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApply}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold ios26-transition-spring"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSheet;
