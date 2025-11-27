import React, { useState } from "react";
import { motion } from "framer-motion";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle, Sparkles, Lightbulb } from "lucide-react";
import { categories, getCategoryColor } from "@/components/recommendations/utils/category-data";
import SwipeableCard from "./SwipeableCard";
import CollectionPickerDrawer from "@/components/collections/CollectionPickerDrawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);

  // Get category info
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === category?.toLowerCase());
    return cat?.icon || "📍";
  };

  // Get border color for category
  const borderColor = getCategoryColor(item.category || 'general');

  const handleDeleteConfirm = () => {
    const idToUse = item.recId || item.id;
    if (idToUse) {
      onDelete(idToUse, item.name);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <SwipeableCard
        onDeleteTrigger={() => setShowDeleteDialog(true)}
        onAddTrigger={() => setShowCollectionPicker(true)}
      >
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

              {/* Tip/Description - shown in amber */}
              {item.description && (
                <p className="text-xs text-amber-600 dark:text-amber-400 line-clamp-2 flex items-start gap-1">
                  <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  {item.description}
                </p>
              )}

              {/* Context tip - fallback for structured input */}
              {!item.description && item.context?.specificTip && (
                <p className="text-xs text-amber-600 dark:text-amber-400 line-clamp-2 flex items-start gap-1">
                  <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  {item.context.specificTip}
                </p>
              )}

              {/* Attribution Info - shown after tip */}
              {item.source?.type === 'ai' ? (
                <div className="flex items-center">
                  <Sparkles className="h-3.5 w-3.5 text-[#667eea]" />
                </div>
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
      </SwipeableCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {item.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the recommendation from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Collection Picker Drawer */}
      <CollectionPickerDrawer
        isOpen={showCollectionPicker}
        onClose={() => setShowCollectionPicker(false)}
        placeId={item.recId || item.id}
        placeName={item.name}
      />
    </>
  );
};

export default RecommendationItem;