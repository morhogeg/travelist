import React from "react";
import { motion } from "framer-motion";
import ItemHeader from "./ItemHeader";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle } from "lucide-react";
import { categories } from "@/components/recommendations/utils/category-data";

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  item,
  index,
  onDelete,
  onToggleVisited,
  onCityClick,
  onEditClick,
  onViewDetails,
  getCategoryPlaceholder
}) => {
  // Get category info
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === category?.toLowerCase());
    return cat?.icon || "📍";
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      lodging: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      attractions: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      nightlife: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    };
    return colorMap[category?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  // Check if item has attribution data
  const hasAttribution = !!(
    item.source?.name ||
    item.context?.specificTip ||
    item.context?.occasionTags?.length ||
    item.context?.personalNote ||
    item.context?.visitPriority
  );

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className={`liquid-glass-clear rounded-2xl overflow-hidden shadow-lg hover:shadow-xl ios26-transition-smooth cursor-pointer ${
        item.visited ? 'ring-2 ring-success/30' : ''
      }`}
      onClick={() => onViewDetails?.(item)}
    >
      <div className="px-2.5 py-1.5 space-y-0.5">
        {/* Header with category and attribution badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight flex-1">{item.name}</h3>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Attribution badge */}
            {hasAttribution && (
              <div className="bg-purple-500/90 text-white p-1 rounded-full">
                <UserCircle className="h-3 w-3" />
              </div>
            )}

            {/* Category badge */}
            {item.category && (
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryColor(item.category)}`}>
                {getCategoryIcon(item.category)}
              </span>
            )}
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        {/* Attribution Info */}
        {item.source?.name && (
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
            <UserCircle className="h-3 w-3" />
            Recommended by{' '}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: item.source.name }));
              }}
              className="hover:text-purple-800 dark:hover:text-purple-300 transition-colors font-semibold"
            >
              {item.source.name}
            </button>
          </p>
        )}

        {item.context?.specificTip && (
          <p className="text-xs text-amber-700 dark:text-amber-400 italic">
            💡 {item.context.specificTip}
          </p>
        )}

        <ItemHeader item={item} visited={!!item.visited} />

        <ItemActions
          item={item}
          onDelete={onDelete}
          onToggleVisited={onToggleVisited}
          onEditClick={onEditClick}
        />
      </div>
    </motion.div>
  );
};

export default RecommendationItem;