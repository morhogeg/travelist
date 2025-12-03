
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Globe, MapPin, Navigation, Trash2, Edit, FolderPlus, Folder } from "lucide-react";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { Badge } from "@/components/ui/badge";
import { RecommendationDetail } from "@/components/recommendations/RecommendationDetail";
import { useNavigate, useLocation } from "react-router-dom";
import { getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
import CollectionPickerDrawer from "@/components/collections/CollectionPickerDrawer";
import { getCollectionsByPlaceId } from "@/utils/collections/collectionStore";
import { useToast } from "@/components/ui/use-toast";
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

interface RecommendationDetailsDialogProps {
  recommendation: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisited: (recId: string, name: string, visited: boolean) => void;
  hideEditDelete?: boolean;
  routeNotes?: string;
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
}) => {
  const [isVisited, setIsVisited] = useState<boolean>(!!recommendation?.visited);
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [firstCollectionName, setFirstCollectionName] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check collection membership when dialog opens or recommendation changes
  useEffect(() => {
    if (isOpen && recommendation) {
      const placeId = recommendation.recId || recommendation.id;
      const collections = getCollectionsByPlaceId(placeId);
      setCollectionsCount(collections.length);
      setFirstCollectionName(collections.length > 0 ? collections[0].name : null);
    }
  }, [isOpen, recommendation]);

  const refreshCollectionState = () => {
    if (recommendation) {
      const placeId = recommendation.recId || recommendation.id;
      const collections = getCollectionsByPlaceId(placeId);
      setCollectionsCount(collections.length);
      setFirstCollectionName(collections.length > 0 ? collections[0].name : null);
    }
  };

  useEffect(() => {
    setIsVisited(!!recommendation?.visited);
  }, [recommendation]);

  if (!recommendation) return null;

  const fullAddress =
    recommendation?.context?.address ||
    recommendation?.location ||
    [recommendation?.name, recommendation?.city, recommendation?.country]
      .filter(Boolean)
      .join(", ") ||
    recommendation?.rawText ||
    '';

  const mapUrl = generateMapLink(recommendation.name, fullAddress || recommendation.location);
  const websiteUrl = recommendation.website ? formatUrl(recommendation.website) : null;
  const categoryColor = getCategoryColor(recommendation.category || 'general');
  const categoryIcon = getCategoryIcon(recommendation.category || 'general');
  const placeId = recommendation.recId || recommendation.id;
  const currentPath = location.pathname;

  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleAddToRoute = () => {
    setShowRoutePicker(true);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        className="max-h-[85vh] p-0"
        style={{
          borderLeft: `4px solid ${categoryColor}`,
          boxShadow: 'none'
        }}
      >
        {/* Compact Header */}
        <div className="relative px-6 pt-2 pb-5 bg-background border-b">
          <div className="flex items-start gap-4">
            {/* Category Icon - Larger */}
            <div
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl"
              style={{ color: categoryColor }}
            >
              {categoryIcon}
            </div>

            {/* Title and Location */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold leading-tight mb-2">{recommendation.name}</h2>

              {/* Location Info Inline */}
              {/* Remove address line under title; only date remains */}

              {/* Added on Date - Moved to Header */}
              {recommendation.dateAdded && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Added {new Date(recommendation.dateAdded).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
            {/* Route-Specific Notes */}
            {routeNotes && (
              <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  📝 {routeNotes}
                </p>
              </div>
            )}

            {/* Attribution and Context Details */}
            <RecommendationDetail
              source={recommendation.source}
              context={recommendation.context}
              onClose={onClose}
              currentPath={currentPath}
            />

            {fullAddress && (
              <button
                onClick={(e) => handleExternalClick(e, mapUrl)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border/70 bg-muted/30 dark:border-white/10 dark:bg-white/5 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <Navigation className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground/90 dark:text-white line-clamp-2">
                  {fullAddress}
                </span>
              </button>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                variant="outline"
                size="default"
                className={`flex-1 min-w-[140px] ios26-transition-smooth ${
                  'bg-background text-foreground border-border dark:bg-white/5 dark:text-white dark:border-white/15'
                } flex-1 min-w-[140px] ios26-transition-smooth`}
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  setShowCollectionPicker(true);
                }}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                <span>Add to Collection</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth"
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  handleAddToRoute();
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                <span>Add to Route</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                className={`flex-1 min-w-[140px] ios26-transition-smooth ${
                  isVisited
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                    : 'bg-background text-foreground border-border dark:bg-white/5 dark:text-white dark:border-white/15'
                }`}
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  const next = !isVisited;
                  setIsVisited(next);
                  onToggleVisited(recommendation.recId, recommendation.name, next);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>{isVisited ? 'Visited' : 'Mark Visited'}</span>
              </Button>
            </div>
          </div>

        {/* Footer */}
        {!hideEditDelete ? (
          <div
            className="p-4 border-t liquid-glass-clear flex items-center gap-3"
            style={{ boxShadow: 'none' }}
          >
            <Button
              variant="outline"
              size="default"
              className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>

            <Button
              variant="outline"
              size="default"
              className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>

            <Button
              variant="outline"
              size="default"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        ) : (
          <div
            className="p-4 border-t liquid-glass-clear"
            style={{ boxShadow: 'none' }}
          >
            <Button
              variant="outline"
              size="default"
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </DrawerContent>

      {/* Collection Picker Drawer */}
      <CollectionPickerDrawer
        isOpen={showCollectionPicker}
        onClose={() => setShowCollectionPicker(false)}
        placeId={placeId}
        placeName={recommendation.name}
        onSuccess={refreshCollectionState}
      />

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

      <RoutePickerDrawer
        isOpen={showRoutePicker}
        onClose={() => setShowRoutePicker(false)}
        placeId={placeId}
        placeName={recommendation.name}
        initialCity={recommendation.city}
        initialCountry={recommendation.country}
        initialCityId={recommendation.cityId}
        onAdded={(routeName) => {
          toast({
            title: "Added to route",
            description: `${recommendation.name} added to ${routeName}`,
          });
          setShowRoutePicker(false);
        }}
      />
    </Drawer>
  );
};

export default RecommendationDetailsDialog;
