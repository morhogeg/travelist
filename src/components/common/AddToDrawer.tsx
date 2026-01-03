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
import { Folder, MapPin, Plus, Check, X, Library } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getCollections,
    addCollection,
    addPlaceToCollection,
    Collection,
} from "@/utils/collections/collectionStore";
import {
    getRoutes,
    createRoute,
    addPlaceToRoute,
    getRouteById,
} from "@/utils/route/route-manager";
import { Route } from "@/types/route";
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
    const [activeTab, setActiveTab] = useState<"collections" | "routes">("collections");
    const { toast } = useToast();

    // Collections state
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");

    // Routes state
    const [routes, setRoutes] = useState<Route[]>([]);
    const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [newRouteName, setNewRouteName] = useState("");

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

            // Load routes
            const allRoutes = getRoutes();
            setRoutes(allRoutes);
            setSelectedRouteIds(new Set()); // Routes are usually "add to", not "membership toggle" in current UI, but we'll follow the same pattern if needed.

            // Reset creation states
            setIsCreatingCollection(false);
            setNewCollectionName("");
            setIsCreatingRoute(false);
            setNewRouteName("");
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

    const handleToggleRoute = (id: string) => {
        lightHaptic();
        setSelectedRouteIds(prev => {
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

    const handleCreateRoute = () => {
        const name = newRouteName.trim() || `${initialCity || "New"} Route`;
        const city = initialCity || "Unknown";
        const country = initialCountry || "Unknown";

        try {
            const newRoute = createRoute(name, initialCityId || "", city, country);
            setRoutes(prev => [...prev, newRoute]);
            setSelectedRouteIds(prev => new Set(prev).add(newRoute.id));
            setNewRouteName("");
            setIsCreatingRoute(false);
            mediumHaptic();
        } catch (error) {
            toast({ title: "Error", description: "Failed to create route", variant: "destructive" });
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

        // Save routes
        selectedRouteIds.forEach(id => {
            const route = routes.find(r => r.id === id);
            if (route) {
                const added = addPlaceToRoute(id, 1, placeId, placeName);
                if (added) {
                    addedTo.push(route.name);
                    addedCount++;
                }
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
                    <DrawerTitle className="text-center">Add to...</DrawerTitle>
                    <DrawerDescription className="text-center">
                        Organize "{placeName}" into your collections or routes
                    </DrawerDescription>
                </DrawerHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                        lightHaptic();
                        setActiveTab(v as any);
                    }}
                    className="flex-1 flex flex-col min-h-0"
                >
                    <div className="px-6 mb-4">
                        <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-800/50 p-1 rounded-xl">
                            <TabsTrigger value="collections" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm">
                                <Folder className="h-4 w-4 mr-2" />
                                Collections
                            </TabsTrigger>
                            <TabsTrigger value="routes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-700 data-[state=active]:shadow-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                Routes
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 min-h-0">
                        <TabsContent value="collections" className="mt-0 space-y-4 pb-4">
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
                            </div>

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
                                    className="w-full border-dashed border-2 py-6 rounded-xl text-muted-foreground hover:text-[#667eea] hover:border-[#667eea]/50"
                                    onClick={() => setIsCreatingCollection(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Collection
                                </Button>
                            )}
                        </TabsContent>

                        <TabsContent value="routes" className="mt-0 space-y-4 pb-4">
                            <div className="space-y-2">
                                {routes.length === 0 && !isCreatingRoute ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p>No routes yet</p>
                                    </div>
                                ) : (
                                    routes.map((route) => {
                                        const isSelected = selectedRouteIds.has(route.id);
                                        return (
                                            <motion.button
                                                key={route.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleToggleRoute(route.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected
                                                        ? "border-[#667eea] bg-[#667eea]/5"
                                                        : "border-border hover:border-[#667eea]/30"
                                                    }`}
                                            >
                                                <MapPin className={`h-5 w-5 ${isSelected ? "text-[#667eea]" : "text-muted-foreground"}`} />
                                                <div className="flex-1 text-left">
                                                    <p className={`font-medium text-sm ${isSelected ? "text-[#667eea]" : ""}`}>{route.name}</p>
                                                    <p className="text-xs text-muted-foreground">{route.city}, {route.country}</p>
                                                </div>
                                                {isSelected && <Check className="h-4 w-4 text-[#667eea]" />}
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>

                            {isCreatingRoute ? (
                                <div className="flex gap-2 pt-2">
                                    <Input
                                        autoFocus
                                        placeholder="Route name"
                                        value={newRouteName}
                                        onChange={(e) => setNewRouteName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateRoute()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleCreateRoute} className="text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        Create
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsCreatingRoute(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-2 py-6 rounded-xl text-muted-foreground hover:text-[#667eea] hover:border-[#667eea]/50"
                                    onClick={() => setIsCreatingRoute(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Route
                                </Button>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>

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
