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
          className={`liquid-glass-clear rounded-2xl border border-white/30 dark:border-white/12 shadow-md ios26-transition-smooth cursor-pointer relative ${
            item.visited ? 'ring-2 ring-success/30' : ''
          }`}
          onClick={() => onViewDetails?.(item)}
        >
          <div className="px-2 py-1 sm:px-2 sm:py-1.5">
            <div className="flex items-center gap-2">
              {/* Left side: Content */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                {/* Category icon */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: borderColor }}>
                  {getCategoryIcon(item.category)}
                </div>
                <h3 className="text-sm font-semibold leading-tight flex-1 truncate">{item.name}</h3>
              </div>

              {/* Right side: Actions inline */}
              <div className="flex items-center gap-1">
                <ItemActions
                  item={item}
                  onDelete={onDelete}
                  onToggleVisited={onToggleVisited}
                  onEditClick={onEditClick}
                />
              </div>
            </div>

            {(item.description || item.context?.specificTip) && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 line-clamp-2 flex items-start gap-1">
                <Lightbulb className="h-3 w-3 flex-shrink-0 mt-0.5" />
                {item.description || item.context?.specificTip}
              </p>
            )}
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
