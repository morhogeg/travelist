import React from "react";
import { motion } from "framer-motion";
import { UnifiedSavedItem } from "./CollectionsTab";
import SwipeableCard from "@/components/home/category/recommendation-item/SwipeableCard";
import CategorySegmentBar from "./CategorySegmentBar";
import { Sparkles, Calendar } from "lucide-react";
import { getCategoryColor } from "@/components/recommendations/utils/category-data";

interface CollectionCardProps {
  item: UnifiedSavedItem;
  onDelete: () => void;
  onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  item,
  onDelete,
  onClick,
}) => {
  const isAITrip = item.isAITrip;

  // Calculate breakdown and totals based on item type
  const totalPlaces = isAITrip
    ? item.days.reduce((sum, day) => sum + day.places.length, 0)
    : item.totalPlaces;

  const hasPlaces = totalPlaces > 0;

  // For AI Trips, we might want to synthesize a category breakdown if it's not provided
  // But for now, let's just show the type and count
  const categoryBreakdown = isAITrip ? [] : (item as any).categoryBreakdown;

  return (
    <SwipeableCard onDeleteTrigger={onDelete}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="mx-4 my-2 p-4 cursor-pointer liquid-glass-clear rounded-2xl border border-white/20 dark:border-white/10 shadow-sm ios26-transition-smooth"
      >
        {/* Header Row */}
        <div className="min-h-[44px]">
          <div className="flex items-center gap-2 mb-0.5">
            {isAITrip && <Sparkles className="h-4 w-4 text-[#667eea]" />}
            <h3 className="font-bold text-[16px] truncate">
              {item.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            {isAITrip ? (
              <>
                <Calendar className="h-3 w-3" />
                <span>{item.generationParams.durationDays} days • {totalPlaces} stops</span>
              </>
            ) : (
              <span>{totalPlaces} place{totalPlaces !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        {/* Category Segment Bar - only show if places exist */}
        {hasPlaces && categoryBreakdown.length > 0 && (
          <div className="mt-3">
            <CategorySegmentBar categories={categoryBreakdown} />
          </div>
        )}
      </motion.div>
    </SwipeableCard>
  );
};

export default CollectionCard;
