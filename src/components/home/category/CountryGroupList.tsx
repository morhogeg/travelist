import React from "react";
import CountryGroup from "./CountryGroup";
import type { GroupedRecommendation } from "@/utils/recommendation/types";

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
}) => {
  if (!groupedRecommendations || groupedRecommendations.length === 0) return null;

  const countriesMap: Record<string, GroupedRecommendation[]> = {};

  for (const group of groupedRecommendations) {
    const country = group.items[0]?.country || "Other";
    if (!countriesMap[country]) countriesMap[country] = [];

    group.items = [...group.items].sort((a, b) => {
      if (a.visited !== b.visited) return a.visited ? 1 : -1;
      return new Date(b.dateAdded || "").getTime() - new Date(a.dateAdded || "").getTime();
    });

    countriesMap[country].push(group);
  }

  const sortedCountries = Object.keys(countriesMap).sort((a, b) => a.localeCompare(b));

  return (
    <div className="mt-2 space-y-8">
      {sortedCountries.map((country) => (
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
        />
      ))}
    </div>
  );
};

export default CountryGroupList;
