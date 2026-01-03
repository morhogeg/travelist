import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountryGroup from "./CountryGroup";
import type { GroupedRecommendation } from "@/utils/recommendation/types";
import SkeletonCard from "@/components/ui/SkeletonCard";

interface CountryGroupListProps {
  groupedRecommendations: GroupedRecommendation[];
  onEditClick?: (item: any) => void;
  onViewDetails?: (item: any) => void;
  onToggleVisited?: (recId: string, name: string, visited: boolean) => void;
  onDeleteRecommendation?: (recId: string, name: string) => void;
  onCityClick?: (cityId: string) => void;
  onRefresh?: () => void;
  viewMode?: "grid" | "list";
  toggleViewMode?: () => void;
  showCounts?: boolean;
  loading?: boolean;
}

const CountryGroupList: React.FC<CountryGroupListProps> = ({
  groupedRecommendations,
  onEditClick,
  onViewDetails,
  onToggleVisited,
  onDeleteRecommendation,
  onCityClick,
  onRefresh,
  viewMode = "grid",
  showCounts = true,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="mt-4 px-4">
        <SkeletonCard count={4} />
      </div>
    );
  }

  if (!groupedRecommendations || groupedRecommendations.length === 0) return null;

  const countriesMap: Record<string, GroupedRecommendation[]> = {};

  for (const group of groupedRecommendations) {
    const country = group.items[0]?.country || "Other";
    if (!countriesMap[country]) countriesMap[country] = [];

    group.items = [...group.items].sort((a, b) => {
      if (a.visited !== b.visited) return a.visited ? 1 : -1; // unvisited first
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

    countriesMap[country].push(group);
  }

  const sortedCountries = Object.keys(countriesMap).sort((a, b) => a.localeCompare(b));

  // Sort cities alphabetically within each country
  sortedCountries.forEach(country => {
    countriesMap[country].sort((a, b) => a.cityName.localeCompare(b.cityName));
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 space-y-6"
      >
        {sortedCountries.map((country, index) => (
          <CountryGroup
            key={country}
            country={country}
            groups={countriesMap[country]}
            onEditClick={onEditClick}
            onViewDetails={onViewDetails}
            onToggleVisited={onToggleVisited}
            onDeleteRecommendation={onDeleteRecommendation}
            onCityClick={onCityClick}
            onRefresh={onRefresh}
            viewMode={viewMode}
            showCounts={showCounts}
            isLastCountry={index === sortedCountries.length - 1}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default CountryGroupList;
