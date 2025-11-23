import React from "react";
import { motion } from "framer-motion";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle } from "lucide-react";
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
      <div className="px-3 py-2.5 space-y-1.5">
        {/* Header with name and category icon */}
        <div className="flex items-center gap-2">
          {/* Category icon */}
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center" style={{ color: borderColor }}>
            {getCategoryIcon(item.category)}
          </div>
          <h3 className="text-base font-bold leading-tight flex-1">{item.name}</h3>
        </div>

        {/* Subtle gradient divider */}
        <div
          className="h-px w-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${borderColor}40 0%, ${borderColor}10 50%, transparent 100%)`
          }}
        />

        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        {/* Attribution Info */}
        {item.source?.name && (
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <UserCircle className="h-3 w-3" />
            Recommended by{' '}
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: item.source.name }));
              }}
              className="hover:text-foreground transition-colors font-semibold"
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