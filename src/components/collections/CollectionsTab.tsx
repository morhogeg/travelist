import React, { useEffect, useState } from "react";
import { getCollections, deleteCollection } from "@/utils/collections/collectionStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Plus, Folder } from "lucide-react";
import CreateCollectionDrawer from "./CreateCollectionDrawer";
import CollectionCard from "./CollectionCard";
import { mediumHaptic } from "@/utils/ios/haptics";
import { useToast } from "@/hooks/use-toast";
import { getRecommendations } from "@/utils/recommendation-parser";
import { getEnrichedAndGroupedCollections, EnrichedCollection } from "@/utils/collections/collectionHelpers";
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
  const [collections, setCollections] = useState<EnrichedCollection[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadCollections = () => {
    const rawCollections = getCollections();
    const recommendations = getRecommendations();

    // Flatten all places from recommendations
    const allPlaces = recommendations.flatMap((rec) =>
      rec.places.map((place) => ({
        id: place.id,
        recId: place.recId || place.id,
        category: place.category || rec.category,
      }))
    );

    // Enrich and group collections, then flatten into single sorted list
    const grouped = getEnrichedAndGroupedCollections(rawCollections, allPlaces);
    // Combine recent and older, maintaining the sort order (recent first, then older)
    setCollections([...grouped.recent, ...grouped.older]);
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleOpenCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  const handleCreateCollection = () => {
    mediumHaptic();
    setIsDrawerOpen(true);
  };

  const handleDeleteCollection = (collectionId: string, collectionName: string) => {
    mediumHaptic();
    setCollectionToDelete({ id: collectionId, name: collectionName });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCollection = () => {
    if (collectionToDelete) {
      mediumHaptic();
      deleteCollection(collectionToDelete.id);
      loadCollections();
      toast({
        title: "Collection deleted",
        description: `"${collectionToDelete.name}" has been removed.`,
      });
      setCollectionToDelete(null);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Header - matching Travelist heading style */}
        <div className="text-center mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Collections
          </h1>
        </div>

        {collections.length === 0 ? (
          <div className="liquid-glass-clear rounded-2xl p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-2">
              <Folder className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base mb-1">No collections yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first collection to organize your places
              </p>
            </div>
            <Button
              onClick={handleCreateCollection}
              className="text-white font-semibold shadow-lg mt-4"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
            </Button>
          </div>
        ) : (
          <>
            <div>
              {collections.map((collection, index) => (
                <React.Fragment key={collection.id}>
                  <CollectionCard
                    collection={collection}
                    onDelete={() => handleDeleteCollection(collection.id, collection.name)}
                    onClick={() => handleOpenCollection(collection.id)}
                  />
                  {index < collections.length - 1 && (
                    <div className="h-px bg-border/30 mx-4" />
                  )}
                </React.Fragment>
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
      </motion.div>

      <CreateCollectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCollectionCreated={loadCollections}
      />

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collectionToDelete?.name}"? This action cannot be undone.
              The places in this collection will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCollectionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCollection}
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