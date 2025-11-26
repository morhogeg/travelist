import React from "react";
import { motion } from "framer-motion";
import { EnrichedCollection } from "@/utils/collections/collectionHelpers";
import SwipeableCard from "@/components/home/category/recommendation-item/SwipeableCard";
import CategorySegmentBar from "./CategorySegmentBar";

interface CollectionCardProps {
  collection: EnrichedCollection;
  onDelete: () => void;
  onClick: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onDelete,
  onClick,
}) => {
  const hasPlaces = collection.totalPlaces > 0;

  return (
    <SwipeableCard onDeleteTrigger={onDelete}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="liquid-glass-clear rounded-2xl p-4 cursor-pointer ios26-transition-smooth"
      >
        {/* Header Row */}
        <div className="min-h-[44px]">
          <h3 className="font-semibold text-base truncate mb-0.5">
            {collection.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {collection.totalPlaces} place{collection.totalPlaces !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Category Segment Bar - only show if places exist */}
        {hasPlaces && collection.categoryBreakdown.length > 0 && (
          <div className="mt-3">
            <CategorySegmentBar categories={collection.categoryBreakdown} />
          </div>
        )}
      </motion.div>
    </SwipeableCard>
  );
};

export default CollectionCard;
