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
  // Use horizontal carousel if more than one item, otherwise show single card
  const isCarousel = items.length > 1;

  if (isCarousel) {
    return (
      <div className="relative -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
             style={{
               scrollbarWidth: 'none',
               msOverflowStyle: 'none',
               WebkitOverflowScrolling: 'touch'
             }}>
          {items.map((item, idx) => (
            <div key={item.id} className="flex-shrink-0 w-[240px] snap-start">
              <RecommendationItem
                item={item}
                index={idx}
                onDelete={onDeleteRecommendation}
                onToggleVisited={onToggleVisited}
                onCityClick={onCityClick}
                onEditClick={() => onEditClick && onEditClick(item)}
                onViewDetails={() => onViewDetails && onViewDetails(item)}
                getCategoryPlaceholder={getCategoryPlaceholder}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {items.map((item, idx) => (
        <div key={item.id} className="w-[240px]">
          <RecommendationItem
            item={item}
            index={idx}
            onDelete={onDeleteRecommendation}
            onToggleVisited={onToggleVisited}
            onCityClick={onCityClick}
            onEditClick={() => onEditClick && onEditClick(item)}
            onViewDetails={() => onViewDetails && onViewDetails(item)}
            getCategoryPlaceholder={getCategoryPlaceholder}
          />
        </div>
      ))}
    </div>
  );
};

export default GridView;