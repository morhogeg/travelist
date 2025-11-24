import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCollections } from "@/utils/collections/collectionStore";
import { getRecommendations, markRecommendationVisited, deleteRecommendation } from "@/utils/recommendation-parser";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/home/search/SearchInput";
import CategoryList from "@/components/home/categories/CategoryList";
import { categories, getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";
import { ArrowLeft, MapPin, MapPinned, Compass } from "lucide-react";
import Layout from "@/components/layout/Layout";
import countryToCode from "@/utils/flags/countryToCode";
import { createRouteFromCollection, syncVisitedStateToRoutes } from "@/utils/route/route-manager";
import { useToast } from "@/hooks/use-toast";
import { mediumHaptic } from "@/utils/ios/haptics";
import ItemActions from "@/components/home/category/recommendation-item/ItemActions";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";

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

  useEffect(() => {
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
        location: place.location || `${place.name}, ${rec.city}, ${rec.country}`,
        category: place.category || rec.category,
        dateAdded: rec.dateAdded
      }))
    );

    setAllItems(flattened);
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

  const handleClearSearch = () => setSearchTerm("");

  const handleViewDetails = (item: any) => {
    setDetailsRecommendation(item);
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
        location: place.location || `${place.name}, ${rec.city}, ${rec.country}`,
        category: place.category || rec.category,
        dateAdded: rec.dateAdded
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
          location: place.location || `${place.name}, ${rec.city}, ${rec.country}`,
          category: place.category || rec.category,
          dateAdded: rec.dateAdded
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
    .filter((item) => collection.placeIds.includes(item.id))
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
        .filter((item) => collection.placeIds.includes(item.id))
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

  return (
    <Layout>
      <div className="px-4 pt-1 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 p-2 z-50 hover:bg-[#667eea]/10 active:bg-[#667eea]/20 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#667eea]" />
        </button>

        <div className="text-center pt-8">
          <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {matchedItems.length} place{matchedItems.length !== 1 ? "s" : ""}
          </p>

          {matchedItems.length > 0 && (
            <Button
              onClick={handleConvertToRoute}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              <MapPinned className="h-4 w-4 mr-2" />
              Create Route
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4">
        <SearchInput
          searchTerm={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={handleClearSearch}
        />

        {filteredCategories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <CategoryList
              categories={filteredCategories}
              activeCategories={resolvedActiveCategories}
              onCategoryToggle={toggleCategory}
            />
          </div>
        )}

        <div className="space-y-3 pb-8">
          {matchedItems.map((item, index) => {
            const borderColor = getCategoryColor(item.category || 'general');

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
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
                      onDelete={() => {}}
                      onEditClick={() => {}}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Details Dialog */}
      <RecommendationDetailsDialog
        recommendation={detailsRecommendation}
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        onEdit={handleDetailsEdit}
        onDelete={handleDetailsDelete}
        onToggleVisited={handleToggleVisited}
      />

      {/* Recommendation Drawer for Editing */}
      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editRecommendation={selectedRecommendation}
      />
    </Layout>
  );
};

export default CollectionDetailPage;