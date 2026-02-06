import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ItemActions from "./ItemActions";
import { RecommendationItemProps } from "./types";
import { UserCircle, Sparkles, Lightbulb } from "lucide-react";
import { categories, getCategoryColor } from "@/components/recommendations/utils/category-data";
import SwipeableCard from "./SwipeableCard";
import AddToDrawer from "@/components/common/AddToDrawer";
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
  const [showAddToDrawer, setShowAddToDrawer] = useState(false);
  const [isTipExpanded, setIsTipExpanded] = useState(false);

  React.useEffect(() => {
    if (showAddToDrawer || showDeleteDialog) {
      window.dispatchEvent(new CustomEvent("fab:hide"));
    } else {
      window.dispatchEvent(new CustomEvent("fab:show"));
    }
  }, [showAddToDrawer, showDeleteDialog]);

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
      onDelete?.(idToUse, item.name);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <SwipeableCard
        onDeleteTrigger={() => {
          setShowDeleteDialog(true);
        }}
        onAddTrigger={() => {
          setShowAddToDrawer(true);
        }}
      >
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 * index }}
          className={`ios26-transition-smooth cursor-pointer relative ${isRow
            ? "bg-transparent rounded-none border-0 shadow-none"
            : "liquid-glass-clear rounded-2xl border border-white/30 dark:border-white/12 shadow-md"
            } ${item.visited ? 'ring-2 ring-success/30' : ''}`}
          onClick={() => {
            onViewDetails?.(item);
          }}
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
                <h3 className="text-[15px] font-semibold leading-snug flex-1 truncate flex items-center gap-2">
                  <span>{item.name}</span>
                  {(item.description || item.context?.specificTip) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTipExpanded(!isTipExpanded);
                      }}
                      className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full transition-all duration-300 ${isTipExpanded
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 scale-110'
                        : 'text-amber-500/40 hover:text-amber-500/80 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
                        }`}
                    >
                      <Lightbulb size={15} strokeWidth={isTipExpanded ? 3 : 2.5} />
                    </button>
                  )}
                </h3>
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

            <AnimatePresence>
              {isTipExpanded && (item.description || item.context?.specificTip) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 0.9 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`mt-1 overflow-hidden ${isRow ? "pl-7" : "pl-5"}`}
                >
                  <p className="text-xs text-amber-600 dark:text-amber-400 leading-tight pr-6 pb-1">
                    {item.description || item.context?.specificTip}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* Add To Drawer (Unified Collections & Routes) */}
      <AddToDrawer
        isOpen={showAddToDrawer}
        onClose={() => {
          setShowAddToDrawer(false);
          window.dispatchEvent(new CustomEvent("fab:show"));
        }}
        placeId={item.recId || item.id}
        placeName={item.name}
        initialCity={item.city}
        initialCountry={item.country}
        initialCityId={item.cityId}
        onSuccess={() => {
          // Optional: refresh data if needed
        }}
      />
    </>
  );
};

export default RecommendationItem;
