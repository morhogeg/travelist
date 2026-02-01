import React, { useState, useEffect } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Folder, Plus, Check, X, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getCollections,
    addCollection,
    addPlaceToCollection,
    Collection,
} from "@/utils/collections/collectionStore";
import { mediumHaptic, lightHaptic } from "@/utils/ios/haptics";

interface AddToDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    placeId: string;
    placeName: string;
    initialCity?: string;
    initialCountry?: string;
    initialCityId?: string;
    onSuccess?: () => void;
}

const AddToDrawer: React.FC<AddToDrawerProps> = ({
    isOpen,
    onClose,
    placeId,
    placeName,
    initialCity,
    initialCountry,
    initialCityId,
    onSuccess,
}) => {
    const { toast } = useToast();

    // Collections state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");

    useEffect(() => {
        if (isOpen) {
            // Load collections
            const allCollections = getCollections();
            setCollections(allCollections);

            // Build initial selection for collections
            const initialColSelection = new Set<string>();
            allCollections.forEach(col => {
                if (col.placeIds?.includes(placeId)) {
                    initialColSelection.add(col.id);
                }
            });
            setSelectedCollectionIds(initialColSelection);

            // Reset creation state
            setIsCreatingCollection(false);
            setNewCollectionName("");
        }
    }, [isOpen, placeId]);

    const handleToggleCollection = (id: string) => {
        lightHaptic();
        setSelectedCollectionIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreateCollection = () => {
        if (!newCollectionName.trim()) return;
        try {
            const newCol = addCollection(newCollectionName.trim());
            setCollections(prev => [...prev, newCol]);
            setSelectedCollectionIds(prev => new Set(prev).add(newCol.id));
            setNewCollectionName("");
            setIsCreatingCollection(false);
            mediumHaptic();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create collection", variant: "destructive" });
        }
    };

    const handleDone = () => {
        mediumHaptic();
        let addedCount = 0;
        const addedTo: string[] = [];

        // Save collections
        selectedCollectionIds.forEach(id => {
            const col = collections.find(c => c.id === id);
            if (col && !col.placeIds?.includes(placeId)) {
                addPlaceToCollection(id, placeId);
                addedTo.push(col.name);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            toast({
                title: "Success",
                description: `Added "${placeName}" to ${addedTo.join(", ")}`,
            });
        }

        onSuccess?.();
        onClose();
    };

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="max-h-[85vh] flex flex-col bg-background border-t border-border">
                <DrawerHeader className="flex-shrink-0 pb-2">
                    <DrawerTitle className="text-center">Add to Collection</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Organize "{placeName}" into your travel collections
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 min-h-0 py-4">
                        <div className="space-y-2">
                            {collections.length === 0 && !isCreatingCollection ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Library className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p>No collections yet</p>
                                </div>
                            ) : (
                                collections.map((col) => {
                                    const isSelected = selectedCollectionIds.has(col.id);
                                    return (
                                        <motion.button
                                            key={col.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleToggleCollection(col.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected
                                                ? "border-[#667eea] bg-[#667eea]/5"
                                                : "border-border hover:border-[#667eea]/30"
                                                }`}
                                        >
                                            <Folder className={`h-5 w-5 ${isSelected ? "text-[#667eea]" : "text-muted-foreground"}`} />
                                            <div className="flex-1 text-left">
                                                <p className={`font-medium text-sm ${isSelected ? "text-[#667eea]" : ""}`}>{col.name}</p>
                                                <p className="text-xs text-muted-foreground">{col.placeIds?.length || 0} places</p>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4 text-[#667eea]" />}
                                        </motion.button>
                                    );
                                })
                            )}

                            {isCreatingCollection ? (
                                <div className="flex gap-2 pt-2">
                                    <Input
                                        autoFocus
                                        placeholder="Collection name"
                                        value={newCollectionName}
                                        onChange={(e) => setNewCollectionName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()} className="text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        Add
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsCreatingCollection(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-2 py-6 rounded-xl text-muted-foreground hover:text-[#667eea] hover:border-[#667eea]/50 mt-2"
                                    onClick={() => setIsCreatingCollection(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Collection
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t border-border p-4">
                    <Button
                        onClick={handleDone}
                        className="w-full py-6 text-white font-semibold rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Done
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default AddToDrawer;
