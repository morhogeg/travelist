import React, { useEffect } from "react";
import { motion } from "framer-motion";
import CountryGroup from "./category/CountryGroup";
import EmptyCategoryState from "./category/EmptyCategoryState";
import CategoriesScrollbar from "./CategoriesScrollbar";

interface CategoryResultsProps {
  category: string | string[];
  groupedRecommendations: any[];
  onToggleVisited: (id: string, name: string, visited: boolean) => void;
  onDeleteRecommendation: (id: string, name: string) => void;
  onEditClick: (recommendation: any) => void;
  onViewDetails?: (recommendation: any) => void;
  onCityClick: (cityId: string) => void;
  viewMode?: "grid" | "list";
  toggleViewMode?: () => void;
  onCategorySelect?: (category: string | string[]) => void;
  hideCityHeader?: boolean;
  hideCountryHeader?: boolean;
  showToggle?: boolean;
  noSidePadding?: boolean;
  hideCountry?: boolean;
}

const CategoryResults: React.FC<CategoryResultsProps> = ({
  category,
  groupedRecommendations,
  onToggleVisited,
  onDeleteRecommendation,
  onEditClick,
  onViewDetails,
  onCityClick,
  viewMode = "list",
  toggleViewMode,
  onCategorySelect,
  hideCityHeader = false,
  hideCountryHeader = false,
  showToggle = true,
  noSidePadding = false,
  hideCountry = false,
}) => {
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      if (onCategorySelect) {
        onCategorySelect(customEvent.detail);
      }
    };
    window.addEventListener("categorySelected", handler);
    return () => window.removeEventListener("categorySelected", handler);
  }, [onCategorySelect]);

  const groupedByCountry: Record<string, any[]> = {};
  groupedRecommendations.forEach((rec) => {
    const country = rec.items[0]?.country || "Unknown";
    if (!groupedByCountry[country]) {
      groupedByCountry[country] = [];
    }
    groupedByCountry[country].push(rec);
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${noSidePadding ? "" : "px-4"} pt-2 pb-4`} // ✅ Dynamic padding
    >
      {showToggle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <CategoriesScrollbar />
        </div>
      )}

      <div className="mt-2">
        {groupedRecommendations.length === 0 ? (
          <EmptyCategoryState category={category} />
        ) : (
          Object.entries(groupedByCountry).map(([country, groups]) => (
            <CountryGroup
              key={country}
              country={country}
              groups={groups}
              onToggleVisited={onToggleVisited}
              onDeleteRecommendation={onDeleteRecommendation}
              onCityClick={onCityClick}
              onEditClick={onEditClick}
              onViewDetails={onViewDetails}
              viewMode={viewMode}
              hideCityHeader={hideCityHeader}
              hideCountryHeader={hideCountryHeader}
              hideCountry={hideCountry}
            />
          ))
        )}
      </div>
    </motion.section>
  );
};

export default CategoryResults;