import React, { useEffect, useState } from "react";
import { getCollections, deleteCollection } from "@/utils/collections/collectionStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Plus, Folder } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import CreateCollectionDrawer from "./CreateCollectionDrawer";
import CollectionCard from "./CollectionCard";
import { mediumHaptic } from "@/utils/ios/haptics";
import { useToast } from "@/hooks/use-toast";
import { getRecommendations } from "@/utils/recommendation-parser";
import { getEnrichedAndGroupedCollections, EnrichedCollection, enrichCollection } from "@/utils/collections/collectionHelpers";
import { getTripsWithProgress, deleteTrip } from "@/utils/trip/trip-manager";
import { TripWithProgress } from "@/types/trip";

// Unified type for both Collections and AI Trips
export type UnifiedSavedItem =
  | (EnrichedCollection & { isAITrip?: false })
  | (TripWithProgress & { isAITrip: true });
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

const CollectionsTab: React.FC = () => {
  const [items, setItems] = useState<UnifiedSavedItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'collections' | 'trips'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; isAITrip: boolean } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = () => {
    const rawCollections = getCollections();
    const recommendations = getRecommendations();
    const rawTrips = getTripsWithProgress();

    // Flatten all places from recommendations for enrichment
    const allPlaces = recommendations.flatMap((rec) =>
      rec.places.map((place) => ({
        id: place.id,
        recId: place.recId || place.id,
        category: place.category,
      }))
    );

    // Enrich collections
    const enrichedCollections: UnifiedSavedItem[] = rawCollections.map(col => ({
      ...enrichCollection(col, allPlaces),
      isAITrip: false as const
    }));

    // Wrap trips
    const tripItems: UnifiedSavedItem[] = rawTrips.map(trip => ({
      ...trip,
      isAITrip: true as const
    }));

    // Combine and sort by date
    const combined = [...enrichedCollections, ...tripItems].sort((a, b) => {
      const dateA = new Date(
        a.isAITrip ? a.dateModified : ((a as any).lastModified || (a as any).createdAt)
      ).getTime();
      const dateB = new Date(
        b.isAITrip ? b.dateModified : ((b as any).lastModified || (b as any).createdAt)
      ).getTime();
      return dateB - dateA;
    }) as UnifiedSavedItem[];

    setItems(combined);
  };

  useEffect(() => {
    loadData();

    // Listen for updates to keep list in sync
    const handleRefresh = () => loadData();
    window.addEventListener("collectionUpdated", handleRefresh);
    window.addEventListener("tripUpdated", handleRefresh);
    window.addEventListener("tripCreated", handleRefresh);
    window.addEventListener("tripDeleted", handleRefresh);

    return () => {
      window.removeEventListener("collectionUpdated", handleRefresh);
      window.removeEventListener("tripUpdated", handleRefresh);
      window.removeEventListener("tripCreated", handleRefresh);
      window.removeEventListener("tripDeleted", handleRefresh);
    };
  }, []);

  const handleOpenItem = (item: UnifiedSavedItem) => {
    if (item.isAITrip) {
      navigate(`/trip/${item.id}`);
    } else {
      navigate(`/collections/${item.id}`);
    }
  };

  // Filter items based on selected filter type
  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'collections') return !item.isAITrip;
    if (filterType === 'trips') return item.isAITrip;
    return true;
  });

  const handleCreateCollection = () => {
    mediumHaptic();
    setIsDrawerOpen(true);
  };

  const handleCollectionCreated = () => {
    loadData();
  };

  const handleDeleteItem = (item: UnifiedSavedItem) => {
    mediumHaptic();
    setItemToDelete({ id: item.id, name: item.name, isAITrip: item.isAITrip });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      mediumHaptic();
      if (itemToDelete.isAITrip) {
        deleteTrip(itemToDelete.id);
      } else {
        deleteCollection(itemToDelete.id);
      }
      loadData();
      toast({
        title: `${itemToDelete.isAITrip ? 'Trip' : 'Collection'} deleted`,
        description: `"${itemToDelete.name}" has been removed.`,
      });
      setItemToDelete(null);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 pt-6 pb-3">
            <h1 className="text-2xl font-bold text-[#667eea] dark:text-white">
              My Collections
            </h1>
          </div>

          {/* Filter Toggle */}
          <div className="px-4 pb-3">
            <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-white/5 rounded-xl border border-neutral-200/50 dark:border-white/10">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filterType === 'all'
                  ? 'bg-white dark:bg-white/12 shadow-sm text-[#667eea] dark:text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('collections')}
                className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filterType === 'collections'
                  ? 'bg-white dark:bg-white/12 shadow-sm text-[#667eea] dark:text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                Collections
              </button>
              <button
                onClick={() => setFilterType('trips')}
                className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filterType === 'trips'
                  ? 'bg-white dark:bg-white/12 shadow-sm text-[#667eea] dark:text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                AI Trips
              </button>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyState
              variant="no-collections"
              onCtaClick={handleCreateCollection}
            />
          ) : (
            <>
              <div>
                {filteredItems.map((item, index) => (
                  <CollectionCard
                    key={item.id}
                    item={item}
                    onDelete={() => handleDeleteItem(item)}
                    onClick={() => handleOpenItem(item)}
                  />
                ))}
              </div>

              {/* Floating Add Button - matching Routes tab */}
              {!isDrawerOpen && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCreateCollection}
                  className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
                  aria-label="Add collection"
                  style={{
                    bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <Plus className="h-6 w-6 text-white" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <CreateCollectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCollectionCreated={handleCollectionCreated}
      />

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.isAITrip ? 'Trip' : 'Collection'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
              {itemToDelete?.isAITrip ? " " : " The places in this collection will not be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default CollectionsTab;
