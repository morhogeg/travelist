import React, { useEffect } from "react";
import { motion } from "framer-motion";
import CountryGroup from "./category/CountryGroup";
import EmptyCategoryState from "./category/EmptyCategoryState";
import ViewModeToggle from "./category/ViewModeToggle";
import CategoriesScrollbar from "./CategoriesScrollbar";

interface CategoryResultsProps {
  category: string | string[];
  groupedRecommendations: any[];
  onToggleVisited: (id: string, name: string, visited: boolean) => void;
  onDeleteRecommendation: (id: string, name: string) => void;
  onEditClick: (recommendation: any) => void;
  onCityClick: (cityId: string) => void;
  viewMode: "grid" | "list";
  toggleViewMode: () => void;
  onCategorySelect?: (category: string | string[]) => void;
}

const CategoryResults: React.FC<CategoryResultsProps> = ({
  category,
  groupedRecommendations,
  onToggleVisited,
  onDeleteRecommendation,
  onEditClick,
  onCityClick,
  viewMode,
  toggleViewMode,
  onCategorySelect,
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

  if (groupedRecommendations.length === 0) {
    if (category === "all") return null;
    return <EmptyCategoryState category={category} />;
  }

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
      className="px-6 pt-2 pb-4"
    >
      <div className="flex items-center justify-between mb-2 mt-4">
        <div />
        <ViewModeToggle viewMode={viewMode} onToggleViewMode={toggleViewMode} />
      </div>

      <div className="mt-2">
        {Object.entries(groupedByCountry).map(([country, groups]) => (
          <CountryGroup
            key={country}
            country={country}
            groups={groups} // ✅ FIXED: pass as "groups"
            onToggleVisited={onToggleVisited}
            onDeleteRecommendation={onDeleteRecommendation}
            onCityClick={onCityClick}
            onEditClick={onEditClick}
            viewMode={viewMode}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default CategoryResults;