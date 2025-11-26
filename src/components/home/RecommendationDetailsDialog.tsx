
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
  const [showCollectionPicker, setShowCollectionPicker] = useState(false);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [firstCollectionName, setFirstCollectionName] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  if (!recommendation) return null;

  const mapUrl = generateMapLink(recommendation.name, recommendation.location);
  const websiteUrl = recommendation.website ? formatUrl(recommendation.website) : null;
  const categoryColor = getCategoryColor(recommendation.category || 'general');
  const categoryIcon = getCategoryIcon(recommendation.category || 'general');
  const placeId = recommendation.recId || recommendation.id;
  const currentPath = location.pathname;

  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
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
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mb-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{recommendation.location}</span>
                </div>
              </div>

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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                size="default"
                variant="outline"
                className="flex-1 min-w-[140px] ios26-transition-smooth"
                onClick={(e) => handleExternalClick(e, mapUrl)}
              >
                <Navigation className="h-4 w-4 mr-2" />
                <span>Navigate</span>
              </Button>

              {websiteUrl && (
                <Button
                  size="default"
                  variant="outline"
                  className="flex-1 min-w-[140px] ios26-transition-smooth"
                  onClick={(e) => handleExternalClick(e, websiteUrl)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Website</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  backgroundColor: recommendation.visited ? '#16a34a' : 'white',
                  color: recommendation.visited ? 'white' : 'inherit',
                  borderColor: recommendation.visited ? '#16a34a' : undefined,
                }}
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  onToggleVisited(recommendation.recId, recommendation.name, !!recommendation.visited);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>{recommendation.visited ? 'Visited' : 'Mark Visited'}</span>
              </Button>

              {/* Add to Collection Button */}
              <Button
                variant="outline"
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  ...(collectionsCount > 0 ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderColor: 'transparent',
                  } : {}),
                }}
                onClick={(e) => {
                  (e.target as HTMLButtonElement).blur();
                  setShowCollectionPicker(true);
                }}
              >
                {collectionsCount > 0 ? (
                  <>
                    <Folder className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[100px]">
                      {collectionsCount === 1 ? firstCollectionName : `${collectionsCount} collections`}
                    </span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    <span>Add to Collection</span>
                  </>
                )}
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
              variant="destructive"
              size="default"
              className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth"
              onClick={onDelete}
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
    </Drawer>
  );
};

export default RecommendationDetailsDialog;
