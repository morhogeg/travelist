
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Navigation, Trash2, Edit, Plus, Lightbulb, UserCircle, FolderPlus, MapPin } from "lucide-react";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
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

interface RecommendationDetailsDialogProps {
  recommendation: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  hideEditDelete?: boolean;
  routeNotes?: string;
  onAddToTrip?: () => void;
}

const RecommendationDetailsDialog: React.FC<RecommendationDetailsDialogProps> = ({
  recommendation,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleVisited,
  hideEditDelete = false,
  routeNotes,
  onAddToTrip,
}) => {
  const [isVisited, setIsVisited] = useState<boolean>(!!recommendation?.visited);
  const [showAddToDrawer, setShowAddToDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setIsVisited(!!recommendation?.visited);
  }, [recommendation]);

  if (!recommendation) return null;

  // Build full address
  const rawAddress =
    recommendation?.context?.address ||
    recommendation?.location ||
    [recommendation?.city, recommendation?.country].filter(Boolean).join(", ") ||
    '';

  const placeName = recommendation?.name?.trim() || '';
  let displayAddress = rawAddress;
  if (placeName && rawAddress.toLowerCase().startsWith(placeName.toLowerCase())) {
    displayAddress = rawAddress.slice(placeName.length).replace(/^[,\s]+/, '').trim();
  }
  displayAddress = displayAddress.replace(/,\s*(United States|USA|U\.S\.A\.)$/i, '').trim();

  const mapUrl = generateMapLink(recommendation.name, rawAddress || recommendation.location);
  const categoryColor = getCategoryColor(recommendation.category || 'general');
  const categoryIcon = getCategoryIcon(recommendation.category || 'general');
  const placeId = recommendation.recId || recommendation.id;

  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="p-0 bg-white dark:bg-neutral-900">

          <div className="flex flex-col h-full max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl" style={{ color: categoryColor }}>
                  {categoryIcon}
                </span>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {recommendation.name}
                </h2>
              </div>

              {displayAddress && (
                <button
                  onClick={(e) => handleExternalClick(e, mapUrl)}
                  className="flex items-center justify-center gap-1.5 mx-auto text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{displayAddress}</span>
                </button>
              )}
            </div>

            <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full" />

            {/* Content */}
            <div className="px-6 py-6 space-y-6 overflow-y-auto">
              {routeNotes && (
                <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    📝 {routeNotes}
                  </p>
                </div>
              )}

              {/* Attribution/Tip */}
              <div className="flex flex-col items-center gap-3 text-center">
                {(recommendation.context?.specificTip || recommendation.description) && (
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-sm font-medium px-4">
                    <Lightbulb className="h-4 w-4 shrink-0" />
                    <span>{recommendation.context?.specificTip || recommendation.description}</span>
                  </div>
                )}
                {recommendation.source?.name && (
                  <div className="flex items-center gap-1.5 text-[#667eea] text-sm">
                    <UserCircle className="h-4 w-4" />
                    <span>
                      Recommended by{" "}
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: recommendation.source?.name }))}
                        className="font-semibold hover:underline"
                      >
                        {recommendation.source.name}
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pb-4">
                {/* Primary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {!onAddToTrip && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      onClick={() => setShowAddToDrawer(true)}
                    >
                      <FolderPlus className="h-5 w-5 mr-2" />
                      <span>Add</span>
                      <MapPin className="h-5 w-5 ml-2" />
                    </Button>
                  )}

                  {onAddToTrip && (
                    <Button
                      className="h-12 rounded-xl text-white font-medium col-span-2"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      onClick={() => {
                        onAddToTrip();
                        onClose();
                      }}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Day
                    </Button>
                  )}

                  {!onAddToTrip && (
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      onClick={() => {
                        const next = !isVisited;
                        setIsVisited(next);
                        onToggleVisited(recommendation.recId, recommendation.name, next);
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      {isVisited ? 'Visited' : 'Mark Visited'}
                    </Button>
                  )}
                </div>

                {/* Secondary Actions */}
                {!hideEditDelete && (
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="ghost"
                      className="h-12 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      onClick={onEdit}
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Edit
                    </Button>

                    <Button
                      variant="ghost"
                      className="h-12 rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-5 w-5 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {recommendation?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the recommendation from your list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setShowDeleteDialog(false);
                onDelete?.();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add To Drawer */}
      <AddToDrawer
        isOpen={showAddToDrawer}
        onClose={() => setShowAddToDrawer(false)}
        placeId={placeId}
        placeName={recommendation.name}
        initialCity={recommendation.city}
        initialCountry={recommendation.country}
        initialCityId={recommendation.cityId}
      />
    </>
  );
};

export default RecommendationDetailsDialog;
