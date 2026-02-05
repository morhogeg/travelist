import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCollections,
  addCollection,
  addPlaceToCollection,
  Collection,
} from "@/utils/collections/collectionStore";
import { useToast } from "@/hooks/use-toast";
import { Folder, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CollectionPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  onSuccess?: () => void;
}

const CollectionPickerDrawer: React.FC<CollectionPickerDrawerProps> = ({
  isOpen,
  onClose,
  placeId,
  placeName,
  onSuccess,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [membershipMap, setMembershipMap] = useState<Record<string, boolean>>({});
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAdds, setSelectedAdds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load collections and check membership when drawer opens
  useEffect(() => {
    if (isOpen) {
      const allCollections = getCollections();
      setCollections(allCollections);

      // Build membership map
      const membership: Record<string, boolean> = {};
      allCollections.forEach((col) => {
        membership[col.id] = col.placeIds?.includes(placeId) ?? false;
      });
      setMembershipMap(membership);
      setNewCollectionName("");
      setIsCreating(false);
      setSelectedAdds(new Set());
    }
  }, [isOpen, placeId]);

  const handleToggleCollection = (collectionId: string) => {
    setSelectedAdds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = addCollection(newCollectionName.trim());
      setCollections((prev) => [...prev, newCollection]);
      setMembershipMap((prev) => ({
        ...prev,
        [newCollection.id]: false,
      }));
      setSelectedAdds((prev) => new Set(prev).add(newCollection.id));

      toast({
        title: "Collection created",
        description: `"${newCollectionName}" created`,
      });

      setNewCollectionName("");
      setIsCreating(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      });
    }
  };

  const memberCount = Object.values(membershipMap).filter(Boolean).length;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[60vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Add to Collection</DrawerTitle>
          <DrawerDescription>
            {memberCount > 0
              ? `In ${memberCount} collection${memberCount !== 1 ? 's' : ''}`
              : "Select a collection or create a new one for this place"
            }
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 overflow-y-auto flex-1 min-h-0">
          {/* Collections List */}
          {collections.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No collections yet</p>
              <p className="text-sm mt-1">Create your first collection below</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => {
                const isMember = membershipMap[collection.id];
                const isSelected = selectedAdds.has(collection.id) || isMember;
                return (
                  <motion.button
                    key={collection.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleCollection(collection.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ios26-transition-smooth ${isSelected
                      ? "border-[#667eea] bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10"
                      : "border-border hover:border-[#667eea]/30"
                      }`}
                  >
                    <div className={`flex-shrink-0 ${isSelected ? "text-[#667eea]" : "text-muted-foreground"}`}>
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium text-sm ${isSelected ? "text-[#667eea]" : ""}`}>
                        {collection.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collection.placeIds?.length || 0} place{(collection.placeIds?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-[#667eea] flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Create New Collection */}
          <div className="mt-2 pt-2 border-t border-border">
            {isCreating ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateCollection();
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="rounded-full px-4 text-white font-bold"
                  style={{
                    background: newCollectionName.trim()
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : undefined,
                    boxShadow: newCollectionName.trim() ? '0 4px 12px -2px rgba(102, 126, 234, 0.4)' : 'none'
                  }}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ring-0 focus-visible:ring-0"
                  onClick={() => {
                    setIsCreating(false);
                    setNewCollectionName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-[#667eea]/50 transition-colors"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Create New Collection</span>
              </motion.button>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-border flex-shrink-0">
          <DrawerClose asChild>
            <Button
              variant="default"
              className={`w-full py-6 font-bold rounded-full transition-all duration-300 ${selectedAdds.size === 0 ? "opacity-60 pointer-events-none" : ""
                }`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: selectedAdds.size > 0 ? '0 8px 16px -4px rgba(102, 126, 234, 0.4)' : 'none',
                color: 'white',
              }}
              onClick={() => {
                if (selectedAdds.size === 0) {
                  onClose();
                  return;
                }
                const names: string[] = [];
                selectedAdds.forEach((id) => {
                  if (!membershipMap[id]) {
                    const col = collections.find((c) => c.id === id);
                    if (col) names.push(col.name);
                    addPlaceToCollection(id, placeId);
                  }
                });
                if (names.length) {
                  toast({
                    title: "Added to collections",
                    description: `"${placeName}" added to ${names.join(", ")}`,
                  });
                }
                onSuccess?.();
                onClose();
              }}
            >
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CollectionPickerDrawer;
