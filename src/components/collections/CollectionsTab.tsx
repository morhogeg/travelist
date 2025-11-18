import React, { useEffect, useState } from "react";
import { getCollections } from "@/utils/collections/collectionStore";
import { Collection } from "@/utils/collections/collectionStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import CreateCollectionDrawer from "./CreateCollectionDrawer";
import { mediumHaptic } from "@/utils/ios/haptics";

const CollectionsTab: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 space-y-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              My Collections
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Organize your favorite places</p>
          </div>
        </div>

        {collections.length === 0 ? (
          <div className="glass-card dark:glass-card-dark p-8 text-center space-y-4">
            <p className="text-muted-foreground">You don't have any collections yet.</p>
            <p className="text-sm text-muted-foreground">
              Create collections to organize your saved places
            </p>
            <Button
              onClick={handleCreateCollection}
              className="text-white font-semibold"
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
          <div className="space-y-3">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="flex justify-between items-center px-4 py-3 cursor-pointer hover:shadow-md transition"
                onClick={() => handleOpenCollection(collection.id)}
              >
                <div>
                  <div className="font-medium">{collection.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {collection.placeIds.length} place{collection.placeIds.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  View
                </Button>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      <CreateCollectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCollectionCreated={loadCollections}
      />
    </Layout>
  );
};

export default CollectionsTab;