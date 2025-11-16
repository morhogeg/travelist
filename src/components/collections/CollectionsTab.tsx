import React, { useEffect, useState } from "react";
import { getCollections } from "@/utils/collections/collectionStore";
import { Collection } from "@/utils/collections/collectionStore";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CollectionsTab: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCollections(getCollections());
  }, []);

  const handleOpenCollection = (collectionId: string) => {
    navigate(`/collections/${collectionId}`);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">My Collections</h1>
      {collections.length === 0 ? (
        <p className="text-muted-foreground">You don’t have any collections yet.</p>
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
    </div>
  );
};

export default CollectionsTab;