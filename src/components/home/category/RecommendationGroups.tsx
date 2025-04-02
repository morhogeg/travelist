import React from "react";
import CountryGroupList from "./CountryGroupList";
import { GroupedRecommendation } from "@/utils/recommendation/types";

interface RecommendationGroupsProps {
  groupedRecommendations: GroupedRecommendation[];
  onDeleteRecommendation: (recId: string, name: string) => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  onCityClick: (cityId: string) => void;
  onEditClick: (recommendation: any) => void;
  viewMode: "grid" | "list";
}

const RecommendationGroups: React.FC<RecommendationGroupsProps> = ({
  groupedRecommendations,
  onDeleteRecommendation,
  onToggleVisited,
  onCityClick,
  onEditClick,
  viewMode,
}) => {
  return (
    <CountryGroupList
      groupedRecommendations={groupedRecommendations}
      onDeleteRecommendation={onDeleteRecommendation}
      onToggleVisited={onToggleVisited}
      onCityClick={onCityClick}
      onEditClick={onEditClick}
      viewMode={viewMode}
    />
  );
};

export default RecommendationGroups;