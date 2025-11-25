import React from "react";
import { motion } from "framer-motion";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle, Sparkles } from "lucide-react";
import { categories, getCategoryColor } from "@/components/recommendations/utils/category-data";

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

  // Get the category emoji
  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      food: "🍕",
      lodging: "🏨",
      attractions: "🎭",
      shopping: "🛍️",
      nightlife: "🌙",
      outdoors: "🌲",
      general: "📍"
    };
    return emojiMap[category?.toLowerCase()] || "📍";
  };

  // Get border color for category
  const borderColor = getCategoryColor(item.category || 'general');

  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className={`liquid-glass-clear rounded-2xl overflow-hidden ios26-transition-smooth cursor-pointer relative ${
        item.visited ? 'ring-2 ring-success/30' : ''
      }`}
      style={{
        border: 'none',
        borderLeft: `4px solid ${borderColor}`,
        boxShadow: 'none'
      }}
      onClick={() => onViewDetails?.(item)}
    >
      <div className="px-3 py-2 flex gap-2">
        {/* Left side: Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header with name and category icon */}
          <div className="flex items-center gap-2">
            {/* Category icon */}
            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: borderColor }}>
              {getCategoryIcon(item.category)}
            </div>
            <h3 className="text-base font-semibold leading-tight flex-1 truncate">{item.name}</h3>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
          )}

          {/* Tip - shown first as it's actionable info */}
          {item.context?.specificTip && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 italic line-clamp-1">
              💡 {item.context.specificTip}
            </p>
          )}

          {/* Attribution Info - shown after tip */}
          {item.source?.type === 'ai' ? (
            <p className="text-[11px] font-medium flex items-center gap-1 text-[#667eea]">
              <Sparkles className="h-3 w-3" />
              AI Suggested
            </p>
          ) : item.source?.name && (
            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <UserCircle className="h-3 w-3" />
              Recommended by{' '}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: item.source.name }));
                }}
                className="hover:text-foreground transition-colors font-semibold truncate"
              >
                {item.source.name}
              </button>
            </p>
          )}
        </div>

        {/* Right side: Actions (vertically stacked) */}
        <div className="flex flex-col justify-between items-center py-1">
          <ItemActions
            item={item}
            onDelete={onDelete}
            onToggleVisited={onToggleVisited}
            onEditClick={onEditClick}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationItem;