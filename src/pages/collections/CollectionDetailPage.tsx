import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCollections } from "@/utils/collections/collectionStore";
import { getRecommendations } from "@/utils/recommendation-parser";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/home/search/SearchInput";
import CategoryList from "@/components/home/categories/CategoryList";
import RecommendationItem from "@/components/home/category/RecommendationItem";
import { categories } from "@/components/recommendations/utils/category-data";

const CollectionDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        category: rec.category,
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
      <div className="p-4">
        <p className="text-muted-foreground">Collection not found.</p>
      </div>
    );
  }

  const matchedItems = allItems
    .filter((item) => collection.placeIds.includes(item.id))
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesCategory =
        activeCategories.length === 0 || activeCategories.includes(item.category?.toLowerCase());

      return matchesSearch && matchesCategory;
    });

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{collection.name}</h1>
        <p className="text-muted-foreground">
          {matchedItems.length} place{matchedItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      <SearchInput
        searchTerm={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onClear={handleClearSearch}
      />

      <CategoryList
        categories={categories}
        activeCategories={activeCategories}
        onCategoryToggle={toggleCategory}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matchedItems.map((item, index) => (
          <RecommendationItem
            key={item.id}
            item={item}
            index={index}
            onDelete={() => {}}
            onToggleVisited={() => {}}
            onEditClick={() => {}}
            onCityClick={() => navigate(`/place/${item.cityId}`)}
            getCategoryPlaceholder={() => null}
            compact={true}
          />
        ))}
      </div>

      <Button onClick={() => navigate(-1)} variant="outline">
        Back
      </Button>
    </div>
  );
};

export default CollectionDetailPage;