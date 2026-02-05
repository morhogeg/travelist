
import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Navigation, Trash2, Edit, Plus, Lightbulb, ExternalLink, Sparkles, Loader2, FolderPlus, UserCircle, MapPin } from "lucide-react";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
import AddToDrawer from "@/components/common/AddToDrawer";
import { generatePlaceDescription } from "@/services/ai/generatePlaceDescription";
import { updateRecommendationMeta } from "@/utils/recommendation/recommendation-manager";
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
  onAddToTrip,
}) => {
  const [isVisited, setIsVisited] = useState<boolean>(!!recommendation?.visited);
  const [showAddToDrawer, setShowAddToDrawer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisited(!!recommendation?.visited);
    setLocalDescription(null); // Reset local description when recommendation changes
    setAiError(null); // Reset error state
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
    if (!url) {
      console.warn('[External Link] No URL provided');
      return;
    }
    // Add protocol if missing so browser can open it
    let finalUrl = url.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = `https://${finalUrl}`;
    }
    console.log('[External Link] Opening:', finalUrl);
    // Create and click anchor for iOS Safari compatibility
    const a = document.createElement('a');
    a.href = finalUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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


            </div>

            <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full" />

            {/* Content */}
            <div className="px-6 py-3 space-y-3 overflow-y-auto">

              {/* Attribution/Tip */}
              <div className="flex flex-col items-center gap-2 text-center">
                {/* Show existing description, AI-generated description, or generate button */}
                {(recommendation.context?.specificTip || recommendation.description || localDescription) ? (
                  <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-medium px-4">
                    <Lightbulb className="h-4 w-4 shrink-0" />
                    <span>{localDescription || recommendation.context?.specificTip || recommendation.description}</span>
                    {/* Dismiss button - only show for AI-generated descriptions */}
                    {localDescription && (
                      <button
                        onClick={() => {
                          setLocalDescription(null);
                          // Clear from storage
                          if (recommendation.recId) {
                            updateRecommendationMeta(recommendation.recId, { description: '' });
                          }
                        }}
                        className="p-0.5 rounded-full hover:bg-amber-500/20 text-amber-500"
                        aria-label="Remove AI description"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        setIsGeneratingDescription(true);
                        setAiError(null);
                        try {
                          console.log('[AI Description] Requesting for:', recommendation.name, recommendation.city, recommendation.country);
                          const result = await generatePlaceDescription(
                            recommendation.name,
                            recommendation.city || '',
                            recommendation.country || '',
                            recommendation.category
                          );
                          console.log('[AI Description] Result:', result);
                          setIsGeneratingDescription(false);
                          if (result.description) {
                            setLocalDescription(result.description);
                            // Persist to storage and trigger home refresh
                            if (recommendation.recId) {
                              updateRecommendationMeta(recommendation.recId, {
                                description: result.description
                              });
                              // Dispatch event to refresh home view
                              window.dispatchEvent(new CustomEvent('recommendationUpdated'));
                            }
                          } else {
                            // Show error to user
                            setAiError(result.error || 'Could not generate description. Please try again.');
                          }
                        } catch (err) {
                          console.error('[AI Description] Exception:', err);
                          setIsGeneratingDescription(false);
                          setAiError('Network error. Please try again.');
                        }
                      }}
                      disabled={isGeneratingDescription}
                      className="flex items-center gap-1.5 text-[#667eea] text-sm hover:underline disabled:opacity-50"
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Get info from Travelist AI</span>
                        </>
                      )}
                    </button>
                    {aiError && (
                      <p className="text-red-500 text-xs mt-1">{aiError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons and Links Section */}
              <div className="space-y-1.5">
                {/* Links - Source & Website */}
                {(recommendation.source?.url || recommendation.website) && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    {recommendation.source?.url && (
                      <button
                        onClick={(e) => handleExternalClick(e, recommendation.source.url)}
                        className="flex items-center gap-1.5 text-[#667eea] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Recommendation Source</span>
                      </button>
                    )}

                    {recommendation.website && (
                      <button
                        onClick={(e) => handleExternalClick(e, recommendation.website!)}
                        className="flex items-center gap-1.5 text-[#667eea] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Website</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Primary Actions - Add & Edit */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {!onAddToTrip && (
                    <>
                      <Button
                        variant="ghost"
                        className="h-9 rounded-xl text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => setShowAddToDrawer(true)}
                      >
                        <FolderPlus className="h-4 w-4 mr-1.5" />
                        <span>Add</span>
                      </Button>

                      {!hideEditDelete && (
                        <Button
                          variant="ghost"
                          className="h-9 rounded-xl text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          onClick={onEdit}
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Edit
                        </Button>
                      )}
                    </>
                  )}

                  {onAddToTrip && (
                    <Button
                      className="h-9 rounded-xl text-white font-medium col-span-2"
                      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                      onClick={() => {
                        onAddToTrip();
                        onClose();
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add to Day
                    </Button>
                  )}
                </div>

                {/* Metadata - Recommended by */}


                {/* Destructive Action - Delete */}
                {!hideEditDelete && (
                  <Button
                    variant="ghost"
                    className="w-full h-9 rounded-xl text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
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
