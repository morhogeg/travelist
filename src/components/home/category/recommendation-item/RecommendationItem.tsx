import React, { useState } from "react";
import { motion } from "framer-motion";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle, Sparkles, Lightbulb } from "lucide-react";
import { categories, getCategoryColor } from "@/components/recommendations/utils/category-data";
import SwipeableCard from "./SwipeableCard";
import CollectionPickerDrawer from "@/components/collections/CollectionPickerDrawer";
import RoutePickerDrawer from "@/components/routes/RoutePickerDrawer";
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
  getCategoryPlaceholder,
  isRow = false,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);

  React.useEffect(() => {
    if (showCollectionPicker || showRoutePicker || showDeleteDialog) {
      window.dispatchEvent(new CustomEvent("fab:hide"));
    } else {
      window.dispatchEvent(new CustomEvent("fab:show"));
    }
  }, [showCollectionPicker, showRoutePicker, showDeleteDialog]);

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
        onAddRouteTrigger={() => setShowRoutePicker(true)}
      >
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 * index }}
          className={`ios26-transition-smooth cursor-pointer relative ${
            isRow
              ? "bg-transparent rounded-none border-0 shadow-none"
              : "liquid-glass-clear rounded-2xl border border-white/30 dark:border-white/12 shadow-md"
          } ${item.visited ? 'ring-2 ring-success/30' : ''}`}
          onClick={() => onViewDetails?.(item)}
        >
          <div className={`${isRow ? "px-1.5 py-2" : "px-2 py-1 sm:px-2 sm:py-1.5"}`}>
            <div className="flex items-center gap-2">
              {/* Left side: Content */}
              <div
                  className={`flex-1 min-w-0 flex items-center gap-2 ${isRow ? "pl-7" : "pl-5"}`}
                >
                {/* Category icon */}
                <div
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{ color: borderColor, filter: "saturate(1.4) brightness(0.9)" }}
                >
                  {getCategoryIcon(item.category)}
                </div>
                <h3 className="text-[15px] font-semibold leading-snug flex-1 truncate">{item.name}</h3>
              </div>

              {/* Right side: Actions inline */}
              <div className="flex items-center gap-1 justify-end w-[76px]">
                <ItemActions
                  item={item}
                  onDelete={onDelete}
                  onToggleVisited={onToggleVisited}
                  onEditClick={onEditClick}
                />
              </div>
            </div>

            {(item.description || item.context?.specificTip) && (
              <p
                className={`mt-1 text-xs text-amber-600 dark:text-amber-400 line-clamp-2 flex items-start gap-1 opacity-90 ${
                  isRow ? "pl-7" : "pl-5"
                }`}
              >
                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
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
        onClose={() => {
          setShowCollectionPicker(false);
          window.dispatchEvent(new CustomEvent("fab:show"));
        }}
        placeId={item.recId || item.id}
        placeName={item.name}
        onOpenAutoFocus={() => window.dispatchEvent(new CustomEvent("fab:hide"))}
      />

      <RoutePickerDrawer
        isOpen={showRoutePicker}
        onClose={() => {
          setShowRoutePicker(false);
          window.dispatchEvent(new CustomEvent("fab:show"));
        }}
        placeId={item.recId || item.id}
        placeName={item.name}
        initialCity={item.city}
        initialCountry={item.country}
        initialCityId={item.cityId}
        onOpenAutoFocus={() => window.dispatchEvent(new CustomEvent("fab:hide"))}
        onAdded={() => setShowRoutePicker(false)}
      />
    </>
  );
};

export default RecommendationItem;
