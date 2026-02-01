import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reorder } from "framer-motion";
import { getCollections, deleteCollection, removePlaceFromCollection, updateOrderedPlaceIds, renameCollection, Collection } from "@/utils/collections/collectionStore";
import { getRecommendations, markRecommendationVisited, deleteRecommendation, Recommendation } from "@/utils/recommendation-parser";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/home/search/SearchInput";
import CategoryList from "@/components/home/categories/CategoryList";
import { categories, getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
import { ArrowLeft, MapPin, Trash2, Search as SearchIcon, Plus, GripVertical, Compass, Edit2, Check, X, Lightbulb, MoreHorizontal } from "lucide-react";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";
import Layout from "@/components/layout/Layout";
import countryToCode from "@/utils/flags/countryToCode";
import { useToast } from "@/hooks/use-toast";
import ItemActions from "@/components/home/category/recommendation-item/ItemActions";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import SwipeableCard from "@/components/home/category/recommendation-item/SwipeableCard";
import AddPlacesToCollectionDrawer from "@/components/collections/AddPlacesToCollectionDrawer";
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
import {
  DropdownMenu as DropdownMenuUI,
  DropdownMenuContent as DropdownMenuContentUI,
  DropdownMenuItem as DropdownMenuItemUI,
  DropdownMenuTrigger as DropdownMenuTriggerUI,
} from "@/components/ui/dropdown-menu";
import { ExportToMapsButton } from "@/components/maps/ExportToMapsButton";
import { MapExportPlace } from "@/utils/maps/export-to-maps";
import { Input } from "@/components/ui/input";

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allItems, setAllItems] = useState<Recommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<Recommendation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveItemDialogOpen, setIsRemoveItemDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAddPlacesDrawerOpen, setIsAddPlacesDrawerOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(() => {
    if (!id || typeof id !== "string") return;

    const collections = getCollections();
    const found = collections.find((c) => c.id === id);

    if (found) {
      // Auto-initialize orderedPlaceIds if missing or desynced
      const currentPlaceIds = found.placeIds || [];
      const currentOrderedIds = found.orderedPlaceIds || [];
      const hasAllIds = currentPlaceIds.every(pid => currentOrderedIds.includes(pid));
      const hasIdenticalLength = currentPlaceIds.length === currentOrderedIds.length;

      if (!found.orderedPlaceIds || !hasAllIds || !hasIdenticalLength) {
        updateOrderedPlaceIds(id, currentPlaceIds);
        loadData(); // Recursive call after update
        return;
      }
    }

    setCollection(found || null);
    if (found && !isEditingName) setTempName(found.name);

    const recs = getRecommendations();
    const flattened = recs.flatMap(rec =>
      rec.places.map(place => ({
        ...place,
        city: rec.city,
        cityId: rec.cityId || rec.id,
        country: rec.country,
        location: place.location || `${rec.city}, ${rec.country}`,
        category: place.category || rec.categories?.[0],
        dateAdded: rec.dateAdded,
        recId: place.recId || place.id,
      }))
    );

    setAllItems(flattened as Recommendation[]);
  }, [id, isEditingName]);

  useEffect(() => {
    loadData();
  }, [id, loadData]);

  // Listen for collection changes
  useEffect(() => {
    const handleCollectionChange = () => loadData();

    window.addEventListener("collectionUpdated", handleCollectionChange);
    window.addEventListener("recommendationAdded", handleCollectionChange);

    return () => {
      window.removeEventListener("collectionUpdated", handleCollectionChange);
      window.removeEventListener("recommendationAdded", handleCollectionChange);
    };
  }, [id, loadData]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const handleStartEditing = () => {
    lightHaptic();
    setIsEditingName(true);
    setTempName(collection.name);
  };

  const handleCancelEditing = () => {
    setIsEditingName(false);
    setTempName(collection.name);
  };

  const handleSaveName = () => {
    if (tempName.trim() && id) {
      mediumHaptic();
      renameCollection(id, tempName.trim());
      setIsEditingName(false);
      loadData();
      toast({
        title: "Collection renamed",
        description: `Now named "${tempName.trim()}".`,
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (categoryId === "all") {
      setActiveCategories([]);
      return;
    }

    setActiveCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearchExpanded(false);
  };

  const toggleSearch = () => {
    lightHaptic();
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchTerm("");
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewDetails = (item: Recommendation) => {
    const recommendation = {
      id: item.id,
      name: item.name,
      location: item.location || `${item.city}, ${item.country}`,
      image: item.image || '',
      category: item.category,
      description: item.description,
      website: item.website,
      recId: item.recId || item.id,
      visited: item.visited || false,
      country: item.country,
      city: item.city,
      source: item.source,
      context: item.context,
      dateAdded: item.dateAdded,
    };
    setDetailsRecommendation(recommendation);
    setDetailsDialogOpen(true);
  };

  const handleToggleVisited = (itemId: string, itemName: string, currentVisited: boolean) => {
    const newVisitedState = !currentVisited;
    markRecommendationVisited(itemId, itemName, newVisitedState);
    loadData();
  };

  const handleDetailsEdit = () => {
    setDetailsDialogOpen(false);
    setSelectedRecommendation(detailsRecommendation);
    setIsDrawerOpen(true);
  };

  const handleDetailsDelete = () => {
    if (detailsRecommendation?.recId || detailsRecommendation?.id) {
      const idToDelete = detailsRecommendation.recId || detailsRecommendation.id;
      deleteRecommendation(idToDelete);
      setDetailsDialogOpen(false);
      loadData();
    }
  };

  if (!collection) {
    return (
      <Layout>
        <div className="p-4">
          <p className="text-muted-foreground">Collection not found.</p>
        </div>
      </Layout>
    );
  }

  const orderedIds = collection.orderedPlaceIds || collection.placeIds || [];

  const matchedItems = allItems
    .filter((item) => orderedIds.includes(item.recId) || orderedIds.includes(item.id))
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(item.category?.toLowerCase());

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aId = a.recId || a.id;
      const bId = b.recId || b.id;
      const aIndex = orderedIds.indexOf(aId);
      const bIndex = orderedIds.indexOf(bId);
      return aIndex - bIndex;
    });

  const exportPlaces: MapExportPlace[] = matchedItems.map(item => ({
    name: item.name,
    address: item.location || item.name,
    city: item.city,
    country: item.country
  }));

  const availableCategories = Array.from(
    new Set(
      allItems
        .filter((item) => collection.placeIds.includes(item.recId) || collection.placeIds.includes(item.id))
        .map((item) => item.category?.toLowerCase())
        .filter(Boolean)
    )
  );

  const filteredCategories = [
    { id: "all", label: "All", icon: <Compass className="h-4 w-4" />, color: "#667eea" },
    ...categories.filter((cat) => availableCategories.includes(cat.id.toLowerCase()))
  ];

  const resolvedActiveCategories = activeCategories.length === 0 ? ["all"] : activeCategories;

  const getFlag = (country: string | null): string => {
    if (!country) return "";
    const code = countryToCode[country];
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  };

  const handleDeleteCollection = () => {
    mediumHaptic();
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCollection = () => {
    mediumHaptic();
    if (id) {
      deleteCollection(id);
      toast({
        title: "Collection deleted",
        description: `"${collection.name}" has been removed.`,
      });
      navigate("/collections");
    }
  };

  const handleRemoveItem = (itemId: string, itemName: string) => {
    mediumHaptic();
    setItemToRemove({ id: itemId, name: itemName });
    setIsRemoveItemDialogOpen(true);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove && id) {
      mediumHaptic();
      removePlaceFromCollection(id, itemToRemove.id);
      loadData();
      toast({
        title: "Removed from collection",
        description: `"${itemToRemove.name}" has been removed.`,
      });
      setItemToRemove(null);
    }
  };

  const handleReorder = (newOrder: Recommendation[]) => {
    if (!id) return;
    const newOrderedIds = newOrder.map(item => item.recId || item.id);
    updateOrderedPlaceIds(id, newOrderedIds);

    // Quick local state update for smoothness
    setCollection({ ...collection, orderedPlaceIds: newOrderedIds });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 pt-2 pb-24"
      >
        {/* Header row - title centered, buttons on sides */}
        <div className="flex items-center justify-between mb-4 min-h-[44px] gap-3">
          {/* Left side: Back Button + Title */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 text-neutral-600 dark:text-neutral-400 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {isEditingName ? (
              <div className="flex items-center gap-1 flex-1 min-w-0 max-w-[280px]">
                <Input
                  ref={nameInputRef}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEditing();
                  }}
                  className="h-9 text-left font-bold text-lg bg-transparent border-b border-primary/50 focus:border-primary rounded-none px-1 focus-visible:ring-0 w-full"
                />
                <button onClick={handleSaveName} className="p-1.5 text-success hover:opacity-70 transition-opacity shrink-0">
                  <Check className="h-5 w-5" />
                </button>
                <button onClick={handleCancelEditing} className="p-1.5 text-destructive hover:opacity-70 transition-opacity shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <h1
                onClick={handleStartEditing}
                className="text-xl font-bold truncate cursor-pointer active:opacity-60 transition-opacity pr-2 flex-1"
              >
                {collection.name}
              </h1>
            )}
          </div>

          {/* Right side: Action cluster */}
          <div className="flex items-center gap-0.5 shrink-0">
            {!isSearchExpanded && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="h-10 w-10 text-neutral-600 dark:text-neutral-400"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
            )}

            <ExportToMapsButton
              places={exportPlaces}
              variant="ghost"
              size="icon"
              showText={false}
              className="h-10 w-10 text-neutral-600 dark:text-neutral-400"
            />

            <DropdownMenuUI>
              <DropdownMenuTriggerUI asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-neutral-600 dark:text-neutral-400"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTriggerUI>
              <DropdownMenuContentUI align="end" className="w-48 bg-background/95 backdrop-blur-md border-white/20">
                <DropdownMenuItemUI onClick={handleStartEditing} className="cursor-pointer">
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItemUI>
                <DropdownMenuItemUI
                  onClick={handleDeleteCollection}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Collection</span>
                </DropdownMenuItemUI>
              </DropdownMenuContentUI>
            </DropdownMenuUI>
          </div>
        </div>

        {/* Expandable Search */}
        <AnimatePresence>
          {isSearchExpanded && (
            <motion.div
              ref={searchContainerRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden"
            >
              <SearchInput
                searchTerm={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={handleClearSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Filter */}
        {filteredCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <CategoryList
              categories={filteredCategories}
              activeCategories={resolvedActiveCategories}
              onCategoryToggle={toggleCategory}
            />
          </div>
        )}

        {/* Places List - Always draggable */}
        <Reorder.Group
          axis="y"
          values={matchedItems}
          onReorder={handleReorder}
          className="space-y-3"
        >
          {matchedItems.map((item, index) => {
            const borderColor = getCategoryColor(item.category || 'general');
            const itemId = item.recId || item.id;

            return (
              <Reorder.Item
                key={itemId}
                value={item}
                className="list-none"
                onPointerDown={() => lightHaptic()}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <SwipeableCard
                    onDeleteTrigger={() => handleRemoveItem(itemId, item.name)}
                  >
                    <motion.div
                      className={`liquid-glass-clear rounded-2xl overflow-hidden ios26-transition-smooth cursor-pointer border border-white/30 dark:border-white/12 shadow-md relative ${item.visited ? 'ring-2 ring-success/30' : ''
                        }`}
                      onClick={() => handleViewDetails(item)}
                    >
                      <div className="px-2 py-1.5 sm:px-2 sm:py-2 flex items-center gap-2">
                        {/* Drag Handle */}
                        <div className="flex items-center justify-center text-muted-foreground/30 cursor-grab active:cursor-grabbing hover:text-muted-foreground transition-colors pl-1">
                          <GripVertical className="h-4 w-4" />
                        </div>

                        {/* Category Icon - Clean style like home screen */}
                        <div
                          className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                          style={{ color: borderColor, filter: "saturate(1.4) brightness(0.9)" }}
                        >
                          {getCategoryIcon(item.category || 'general')}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] font-semibold leading-snug truncate">{item.name}</h3>

                          {/* Lightbulb Tip (matching home screen style) */}
                          {(item.description || item.context?.specificTip) && (
                            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400 line-clamp-2 flex items-start gap-1 opacity-90">
                              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span className="truncate">{item.description || item.context?.specificTip}</span>
                            </p>
                          )}
                        </div>

                        {/* Actions inline (matching home screen) */}
                        <div className="flex items-center gap-1 justify-end w-[76px]">
                          <ItemActions
                            item={item}
                            onToggleVisited={handleToggleVisited}
                            onDelete={() => handleRemoveItem(itemId, item.name)}
                            onEditClick={() => { }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </SwipeableCard>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </motion.div>

      {/* Dialogs & Drawers */}
      {detailsRecommendation && (
        <RecommendationDetailsDialog
          recommendation={detailsRecommendation}
          isOpen={detailsDialogOpen}
          onClose={() => {
            setDetailsDialogOpen(false);
            setDetailsRecommendation(null);
          }}
          onEdit={handleDetailsEdit}
          onDelete={handleDetailsDelete}
          onToggleVisited={handleToggleVisited}
        />
      )}

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editRecommendation={selectedRecommendation}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isRemoveItemDialogOpen} onOpenChange={setIsRemoveItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToRemove?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddPlacesToCollectionDrawer
        isOpen={isAddPlacesDrawerOpen}
        onClose={() => setIsAddPlacesDrawerOpen(false)}
        collection={collection}
        onPlacesAdded={loadData}
      />

      {/* FAB */}
      {!isAddPlacesDrawerOpen && !detailsDialogOpen && !isDrawerOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            mediumHaptic();
            setIsAddPlacesDrawerOpen(true);
          }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <Plus className="h-6 w-6 text-white" />
        </motion.button>
      )}
    </Layout>
  );
};

export default CollectionDetailPage;