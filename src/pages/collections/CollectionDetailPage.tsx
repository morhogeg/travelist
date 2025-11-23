import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCollections } from "@/utils/collections/collectionStore";
import { getRecommendations } from "@/utils/recommendation-parser";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/home/search/SearchInput";
import CategoryList from "@/components/home/categories/CategoryList";
import { categories } from "@/components/recommendations/utils/category-data";
import { ArrowLeft, MapPin, ExternalLink, MapPinned } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { formatUrl } from "@/utils/link-helpers";
import countryToCode from "@/utils/flags/countryToCode";
import { createRouteFromCollection } from "@/utils/route/route-manager";
import { useToast } from "@/hooks/use-toast";
import { mediumHaptic } from "@/utils/ios/haptics";

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collection, setCollection] = useState<any>(null);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const collections = getCollections();
    const found = collections.find((c) => c.id === id);
    setCollection(found || null);

    const recs = getRecommendations();
    const flattened = recs.flatMap(rec =>
      rec.places.map(place => ({
        ...place,
        id: place.id,
        city: rec.city,
        cityId: rec.cityId || rec.id,
        country: rec.country,
        category: place.category || rec.category,
        image: place.image,
        dateAdded: rec.dateAdded
      }))
    );

    setAllItems(flattened);
  }, [id]);

  const toggleCategory = (categoryId: string) => {
    setActiveCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearSearch = () => setSearchTerm("");

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

  const filteredCategories = categories.filter((cat) =>
    availableCategories.includes(cat.id.toLowerCase())
  );

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

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id.toLowerCase() === category?.toLowerCase());
    return cat?.icon || "📍";
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      food: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      lodging: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      attractions: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      shopping: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
      nightlife: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    };
    return colorMap[category?.toLowerCase()] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
  };

  return (
    <Layout>
      <div className="px-4 pt-3 pb-4">
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
          <CategoryList
            categories={filteredCategories}
            activeCategories={activeCategories}
            onCategoryToggle={toggleCategory}
          />
        )}

        <div className="grid gap-4 pb-8">
          {matchedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              className="liquid-glass-clear rounded-xl overflow-hidden shadow-md hover:shadow-lg ios26-transition-smooth"
            >
              <div className="flex gap-3 p-3">
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.category && (
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight mb-1">{item.name}</h3>

                  {(item.city || item.country) && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {item.city && item.country
                          ? `${item.city}, ${getFlag(item.country)} ${item.country}`
                          : item.city || `${getFlag(item.country)} ${item.country}`}
                      </span>
                    </div>
                  )}

                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
                  )}

                  {item.website && (
                    <a
                      href={formatUrl(item.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit website
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CollectionDetailPage;