
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Globe, MapPin, Navigation, Trash2, Edit, FolderPlus, Folder, Lightbulb, UserCircle, Library, Plus } from "lucide-react";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
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
  const [collectionNames, setCollectionNames] = useState<string[]>([]);
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
      setCollectionNames(collections.map(c => c.name));
    }
  }, [isOpen, recommendation]);

  const refreshCollectionState = () => {
    if (recommendation) {
      const placeId = recommendation.recId || recommendation.id;
      const collections = getCollectionsByPlaceId(placeId);
      setCollectionsCount(collections.length);
      setFirstCollectionName(collections.length > 0 ? collections[0].name : null);
      setCollectionNames(collections.map(c => c.name));
    }
  };

  useEffect(() => {
    setIsVisited(!!recommendation?.visited);
  }, [recommendation]);

  if (!recommendation) return null;

  // Build full address - prefer stored address, fallback to location field, then construct from components
  const rawAddress =
    recommendation?.context?.address ||
    recommendation?.location ||
    [recommendation?.city, recommendation?.country].filter(Boolean).join(", ") ||
    '';

  // Remove the place name from the address if it starts with it (avoid "Cantina Rooftop, 605 W..." when name is "Cantina Rooftop")
  const placeName = recommendation?.name?.trim() || '';
  let displayAddress = rawAddress;
  if (placeName && rawAddress.toLowerCase().startsWith(placeName.toLowerCase())) {
    displayAddress = rawAddress.slice(placeName.length).replace(/^[,\s]+/, '').trim();
  }
  // Remove country suffix (e.g., ", United States" or ", USA")
  displayAddress = displayAddress.replace(/,\s*(United States|USA|U\.S\.A\.)$/i, '').trim();

  const mapUrl = generateMapLink(recommendation.name, rawAddress || recommendation.location);
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
          borderLeft: `2px solid ${categoryColor}55`,
          boxShadow: 'none'
        }}
      >
        {/* Clean Header */}
        <div className="px-6 pt-3 pb-3">
          {/* Name with category icon */}
          <div className="flex items-center justify-center gap-2">
            <span
              className="text-xl"
              style={{ color: categoryColor }}
            >
              {categoryIcon}
            </span>
            <h2 className="text-2xl font-bold leading-tight">
              {recommendation.name}
            </h2>
          </div>

          {/* Address - subtle, tappable text */}
          {displayAddress && (
            <button
              onClick={(e) => handleExternalClick(e, mapUrl)}
              className="flex items-center justify-center gap-1.5 mx-auto mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Navigation className="h-3 w-3" />
              <span className="truncate max-w-[280px]">{displayAddress}</span>
            </button>
          )}
        </div>

        <div className="border-t" />

        {/* Content */}
        <div className="px-6 pt-2 pb-2 space-y-3">
          {/* Route-Specific Notes */}
          {routeNotes && (
            <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                📝 {routeNotes}
              </p>
            </div>
          )}

          {/* Compact attribution/tip row */}
          <div className="flex flex-wrap items-center gap-3">
            {recommendation.context?.specificTip && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                <Lightbulb className="h-4 w-4" />
                <span className="">{recommendation.context.specificTip}</span>
              </div>
            )}
            {recommendation.source?.name && (
              <div className="flex items-center gap-1 text-[#667eea] text-sm">
                <UserCircle className="h-4 w-4" />
                <span>
                  Recommended by{" "}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: recommendation.source?.name }))}
                    className="font-semibold text-[#667eea] hover:opacity-80"
                  >
                    {recommendation.source.name}
                  </button>
                </span>
              </div>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {collectionsCount === 0 ? (
              <Button
                variant="ghost"
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth border border-border/60 dark:border-white/15"
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  setShowCollectionPicker(true);
                }}
              >
                <div className="flex w-full items-center justify-center gap-2">
                  <FolderPlus className="h-4 w-4" />
                  <span>Add to Collection</span>
                </div>
              </Button>
            ) : (
              <Button
                variant="default"
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth text-white"
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  setShowCollectionPicker(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)"
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    {collectionsCount === 1 ? <Folder className="h-4 w-4" /> : <Library className="h-4 w-4" />}
                    <span className="truncate">
                      {collectionsCount === 1
                        ? `In: ${firstCollectionName}`
                        : `In ${collectionsCount} Collections`}
                    </span>
                  </div>
                  <Plus className="h-4 w-4 flex-shrink-0" />
                </div>
              </Button>
            )}

            <Button
              variant="ghost"
              size="default"
              className="flex-1 min-w-[140px] ios26-transition-smooth border border-border/60 dark:border-white/15"
              onClick={(e) => {
                (e.target as HTMLButtonElement).blur();
                handleAddToRoute();
              }}
            >
              <MapPin className="h-4 w-4 mr-2" />
              <span>Add to Route</span>
            </Button>

            <Button
              variant="ghost"
              size="default"
              className="flex-1 min-w-[140px] ios26-transition-smooth border border-border/60 dark:border-white/15"
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
          <div className="p-4 pt-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="default"
                className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth border border-border/60 dark:border-white/15"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>

              <Button
                variant="ghost"
                size="default"
                className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth border border-border/60 dark:border-white/15"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>

              <Button
                variant="ghost"
                size="default"
                className="flex-1 border border-border/60 dark:border-white/15"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 pt-2">
            <Button
              variant="ghost"
              size="default"
              className="w-full border border-border/60 dark:border-white/15"
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
        onAdded={() => {
          setShowRoutePicker(false);
        }}
      />
    </Drawer>
  );
};

export default RecommendationDetailsDialog;
