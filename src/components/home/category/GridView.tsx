import React from "react";
import RecommendationItem from "./recommendation-item/RecommendationItem";
import { GridViewProps } from "./types";

const GridView: React.FC<GridViewProps> = ({ 
  items, 
  onDeleteRecommendation, 
  onToggleVisited, 
  onCityClick, 
  onEditClick,
  getCategoryPlaceholder 
}) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
      {items.map((item, idx) => (
        <RecommendationItem
          key={item.id}
          item={item}
          index={idx}
          onDelete={onDeleteRecommendation}
          onToggleVisited={onToggleVisited}
          onCityClick={onCityClick}
          onEditClick={() => onEditClick && onEditClick(item)}
          getCategoryPlaceholder={getCategoryPlaceholder}
        />
      ))}
    </div>
  );
};

export default GridView;