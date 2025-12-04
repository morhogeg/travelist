import React from "react";
import RecommendationItem from "./recommendation-item/RecommendationItem";
import { GridViewProps } from "./types";

const GridView: React.FC<GridViewProps> = ({
  items,
  onDeleteRecommendation,
  onToggleVisited,
  onCityClick,
  onEditClick,
  onViewDetails,
  getCategoryPlaceholder
}) => {
  return (
    <div className="divide-y divide-border/60 dark:divide-white/10 rounded-2xl overflow-hidden bg-transparent">
      {items.map((item, idx) => (
        <RecommendationItem
          key={item.id}
          item={item}
          index={idx}
          onDelete={onDeleteRecommendation}
          onToggleVisited={onToggleVisited}
          onCityClick={onCityClick}
          onEditClick={() => onEditClick && onEditClick(item)}
          onViewDetails={() => onViewDetails && onViewDetails(item)}
          getCategoryPlaceholder={getCategoryPlaceholder}
          isRow
        />
      ))}
    </div>
  );
};

export default GridView;
