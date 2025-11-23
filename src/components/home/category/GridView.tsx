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
    <div className="space-y-3">
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
        />
      ))}
    </div>
  );
};

export default GridView;