import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCollections, deleteCollection, removePlaceFromCollection } from "@/utils/collections/collectionStore";
import { getRecommendations, markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/home/search/SearchInput";
import CategoryList from "@/components/home/categories/CategoryList";
import { categories, getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
import { ArrowLeft, MapPin, MapPinned, Compass, Trash2, Search as SearchIcon, Plus } from "lucide-react";
import { lightHaptic } from "@/utils/ios/haptics";
import Layout from "@/components/layout/Layout";
import countryToCode from "@/utils/flags/countryToCode";
import { createRouteFromCollection, syncVisitedStateToRoutes } from "@/utils/route/route-manager";
import { useToast } from "@/hooks/use-toast";
import { mediumHaptic } from "@/utils/ios/haptics";
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

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collection, setCollection] = useState<any>(null);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsRecommendation, setDetailsRecommendation] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveItemDialogOpen, setIsRemoveItemDialogOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isAddPlacesDrawerOpen, setIsAddPlacesDrawerOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    if (!id || typeof id !== "string") return;

    const collections = getCollections();
    const found = collections.find((c) => c.id === id);
    setCollection(found || null);

    const recs = getRecommendations();
    const flattened = recs.flatMap(rec =>
      rec.places.map(place => ({
        ...place,
        city: rec.city,
        cityId: rec.cityId || rec.id,
        country: rec.country,
        location: place.location || `${rec.city}, ${rec.country}`,
        category: place.category || rec.category,
        dateAdded: rec.dateAdded,
        recId: place.recId || place.id,
      }))
    );

    setAllItems(flattened);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Listen for collection changes
  useEffect(() => {
    const handleCollectionChange = () => loadData();

    window.addEventListener("collectionUpdated", handleCollectionChange);
    window.addEventListener("recommendationAdded", handleCollectionChange);

    return () => {
      window.removeEventListener("collectionUpdated", handleCollectionChange);
      window.removeEventListener("recommendationAdded", handleCollectionChange);
    };
  }, [id]);

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

  const handleViewDetails = (item: any) => {
    // Convert to the format expected by RecommendationDetailsDialog
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

    // Sync to routes containing this place
    syncVisitedStateToRoutes(itemId, newVisitedState);

    // Reload items to reflect the change
    const recs = getRecommendations();
    const flattened = recs.flatMap(rec =>
      rec.places.map(place => ({
        ...place,
        city: rec.city,
        cityId: rec.cityId || rec.id,
        country: rec.country,
        location: place.location || `${rec.city}, ${rec.country}`,
        category: place.category || rec.category,
        dateAdded: rec.dateAdded,
        recId: place.recId || place.id,
      }))
    );
    setAllItems(flattened);
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

      // Reload items to reflect the change
      const recs = getRecommendations();
      const flattened = recs.flatMap(rec =>
        rec.places.map(place => ({
          ...place,
          city: rec.city,
          cityId: rec.cityId || rec.id,
          country: rec.country,
          location: place.location || `${rec.city}, ${rec.country}`,
          category: place.category || rec.category,
          dateAdded: rec.dateAdded,
          recId: place.recId || place.id,
        }))
      );
      setAllItems(flattened);
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

  const matchedItems = allItems
    .filter((item) => collection.placeIds.includes(item.recId) || collection.placeIds.includes(item.id))
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(item.category?.toLowerCase());

      return matchesSearch && matchesCategory;
    });

  // Get only categories that actually exist in this collection
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

  const handleConvertToRoute = () => {
    mediumHaptic();

    if (!collection || matchedItems.length === 0) {
      toast({
        title: "Cannot create route",
        description: "No places in this collection to add to a route.",
        variant: "destructive",
      });
      return;
    }

    // Get the first item to determine city and country
    const firstItem = matchedItems[0];
    if (!firstItem.city || !firstItem.country) {
      toast({
        title: "Cannot create route",
        description: "Collection items need city and country information.",
        variant: "destructive",
      });
      return;
    }

    // Check if all items are from the same city
    const cities = new Set(matchedItems.map(item => item.city));
    if (cities.size > 1) {
      toast({
        title: "Multiple cities",
        description: "This collection contains places from multiple cities. Routes can only contain places from a single city.",
        variant: "destructive",
      });
      return;
    }

    try {
      const placeIds = matchedItems.map(item => item.id);
      const route = createRouteFromCollection(
        collection.name,
        firstItem.cityId,
        firstItem.city,
        firstItem.country,
        placeIds
      );

      toast({
        title: "Route created!",
        description: `"${collection.name}" has been converted to a route.`,
      });

      navigate(`/routes/${route.id}`);
    } catch (error) {
      console.error("Error creating route from collection:", error);
      toast({
        title: "Error",
        description: "Failed to create route. Please try again.",
        variant: "destructive",
      });
    }
  };

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

      // Reload collection to reflect the change
      const collections = getCollections();
      const found = collections.find((c) => c.id === id);
      setCollection(found || null);

      toast({
        title: "Removed from collection",
        description: `"${itemToRemove.name}" has been removed from this collection.`,
      });
      setItemToRemove(null);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 pt-2 pb-24"
      >
        {/* Header row - title centered, buttons on sides */}
        <div className="flex items-center justify-between mb-1 relative">
          {/* Left side: Back + Search */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Search icon button */}
            {!isSearchExpanded && (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={toggleSearch}
                className="min-h-11 min-w-11 rounded-full flex items-center justify-center hover:opacity-60 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
                aria-label="Open search"
              >
                <SearchIcon className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* Center: Title (absolutely positioned for true centering) */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold truncate max-w-[50%] text-center">
            {collection.name}
          </h1>

          {/* Right side: Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteCollection}
            className="shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Create Route button - centered below */}
        {matchedItems.length > 0 && (
          <div className="mb-4 text-center">
            <Button
              onClick={handleConvertToRoute}
              variant="outline"
              size="sm"
            >
              <MapPinned className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          </div>
        )}

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
          <div className="flex gap-2 overflow-x-auto pb-3">
            <CategoryList
              categories={filteredCategories}
              activeCategories={resolvedActiveCategories}
              onCategoryToggle={toggleCategory}
            />
          </div>
        )}

        {/* Places List */}
        <div className="space-y-3">
          {matchedItems.map((item, index) => {
            const borderColor = getCategoryColor(item.category || 'general');
            const itemId = item.recId || item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <SwipeableCard
                  onDeleteTrigger={() => handleRemoveItem(itemId, item.name)}
                >
                  <motion.div
                    className={`liquid-glass-clear rounded-2xl overflow-hidden ios26-transition-smooth cursor-pointer relative ${
                      item.visited ? 'ring-2 ring-success/30' : ''
                    }`}
                    style={{
                      border: 'none',
                      borderLeft: `4px solid ${borderColor}`,
                      boxShadow: 'none'
                    }}
                    onClick={() => handleViewDetails(item)}
                  >
                    <div className="px-3 py-2 flex gap-2">
                      {/* Left side: Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Header with name and category icon */}
                        <div className="flex items-center gap-2">
                          {/* Category icon */}
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center" style={{ color: borderColor }}>
                            {getCategoryIcon(item.category || 'general')}
                          </div>
                          <h3 className="text-base font-semibold leading-tight flex-1 truncate">{item.name}</h3>
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        )}

                        {/* Location info */}
                        {(item.city || item.country) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {item.city && item.country
                                ? `${item.city}, ${getFlag(item.country)} ${item.country}`
                                : item.city || `${getFlag(item.country)} ${item.country}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right side: Actions (vertically stacked) */}
                      <div className="flex flex-col justify-between items-center py-1">
                        <ItemActions
                          item={item}
                          onToggleVisited={handleToggleVisited}
                          onDelete={() => handleRemoveItem(itemId, item.name)}
                          onEditClick={() => {}}
                        />
                      </div>
                    </div>
                  </motion.div>
                </SwipeableCard>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Details Dialog */}
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

      {/* Recommendation Drawer for Editing */}
      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editRecommendation={selectedRecommendation}
      />

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{collection.name}"? This action cannot be undone.
              The places in this collection will not be deleted.
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

      {/* Remove Item from Collection Confirmation Dialog */}
      <AlertDialog open={isRemoveItemDialogOpen} onOpenChange={setIsRemoveItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{itemToRemove?.name}" from this collection?
              The place will not be deleted from your recommendations.
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

      {/* Add Places to Collection Drawer */}
      <AddPlacesToCollectionDrawer
        isOpen={isAddPlacesDrawerOpen}
        onClose={() => setIsAddPlacesDrawerOpen(false)}
        collection={collection}
        onPlacesAdded={loadData}
      />

      {/* Floating Add Button - hide when drawer is open */}
      {!isAddPlacesDrawerOpen && !detailsDialogOpen && !isDrawerOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => {
            mediumHaptic();
            setIsAddPlacesDrawerOpen(true);
          }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          aria-label="Add places"
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