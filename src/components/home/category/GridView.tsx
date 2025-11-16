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
  // Use horizontal carousel if more than one item, otherwise show single card
  const isCarousel = items.length > 1;

  if (isCarousel) {
    return (
      <div className="relative -mx-6 px-6">
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
                getCategoryPlaceholder={getCategoryPlaceholder}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
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