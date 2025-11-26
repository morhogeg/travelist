import React, { useEffect, useState } from "react";
import { getCollections, deleteCollection } from "@/utils/collections/collectionStore";
import { Collection } from "@/utils/collections/collectionStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Plus, Folder, ArrowRight } from "lucide-react";
import CreateCollectionDrawer from "./CreateCollectionDrawer";
import { mediumHaptic } from "@/utils/ios/haptics";
import SwipeableCard from "@/components/home/category/recommendation-item/SwipeableCard";
import { useToast } from "@/hooks/use-toast";
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
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadCollections = () => {
    setCollections(getCollections());
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
        className="px-6 pt-2 pb-24"
      >
        {/* Header - matching Routes tab */}
        <div className="mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Collections
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize your favorite places
          </p>
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
            <div className="space-y-2">
              {collections.map((collection) => (
                <SwipeableCard
                  key={collection.id}
                  onDeleteTrigger={() => handleDeleteCollection(collection.id, collection.name)}
                >
                  <div
                    className="liquid-glass-clear rounded-2xl px-4 py-3 cursor-pointer ios26-transition-smooth"
                    onClick={() => handleOpenCollection(collection.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{collection.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {collection.placeIds.length} place{collection.placeIds.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </SwipeableCard>
              ))}
            </div>

            {/* Floating Add Button - matching Routes tab */}
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