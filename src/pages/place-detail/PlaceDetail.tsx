// FILE: src/pages/place-detail/PlaceDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import CategoryResults from "@/components/home/CategoryResults";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { GroupedRecommendation } from "@/utils/recommendation/types";
import { getFilteredRecommendations } from "@/utils/recommendation/filter-helpers";
import CategoriesScrollbar from "@/components/home/CategoriesScrollbar";
import SearchInput from "@/components/home/search/SearchInput";
import { Plus, ArrowLeft, Search as SearchIcon } from "lucide-react";
import countryToCode from "@/utils/flags/countryToCode";
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";

interface Place {
  id: string;
  name: string;
  image: string;
  country?: string;
}

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRecommendation, setEditRecommendation] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>("all");
  const [groupedRecommendations, setGroupedRecommendations] = useState<GroupedRecommendation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const places = getUserPlaces();
    let currentPlace = places.find(p => p.id === id);

    if (!currentPlace) {
      const recommendations = getRecommendations();
      const recWithThisId = recommendations.find(rec => rec.id === id || rec.cityId === id);
      if (recWithThisId) {
        currentPlace = {
          id: recWithThisId.cityId || recWithThisId.id,
          name: recWithThisId.city,
          image: recWithThisId.places?.[0]?.image || "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=800&q=80",
          country: recWithThisId.country
        };
      }
    }

    if (currentPlace) {
      setPlace(currentPlace);
    } else {
      toast({
        title: "Place not found",
        description: "We couldn't find this place.",
        variant: "destructive"
      });
    }
    setLoading(false);
  }, [id, toast]);

  useEffect(() => {
    if (!place) return;

    const loadRecommendations = async () => {
      const results = await getFilteredRecommendations(selectedCategory);
      const filtered = results.filter(group =>
        group.cityId === place.id
      );
      setGroupedRecommendations(filtered);
    };

    loadRecommendations();
    window.addEventListener("recommendationAdded", loadRecommendations);
    return () => window.removeEventListener("recommendationAdded", loadRecommendations);
  }, [place, selectedCategory]);

  useEffect(() => {
    const categoryHandler = (e: Event) => {
      const customEvent = e as CustomEvent<string | string[]>;
      setSelectedCategory(customEvent.detail);
    };
    window.addEventListener("categorySelected", categoryHandler);
    return () => window.removeEventListener("categorySelected", categoryHandler);
  }, []);

  const handleEditClick = (recommendation: any) => {
    setEditRecommendation(recommendation);
    setIsDrawerOpen(true);
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

  const filteredGroups = groupedRecommendations.map(group => ({
    ...group,
    items: Array.isArray(group.items)
      ? group.items.filter(place =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (place.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        )
      : []
  })).filter(group => group.items.length > 0);

  const flagEmoji =
    place?.country && countryToCode[place.country]
      ? String.fromCodePoint(...[...countryToCode[place.country]].map(c => 127397 + c.charCodeAt(0)))
      : "";

  if (loading) {
    return (
      <Layout>
        <div className="p-6 text-center text-muted-foreground">Loading city...</div>
      </Layout>
    );
  }

  if (!place) return null;

  return (
    <Layout>
      <div className="px-4 pt-3 pb-4 relative">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 min-h-11 min-w-11 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-50 ios26-transition-smooth"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-[#667eea]" />
        </motion.button>

        {/* Search Icon Button */}
        {!isSearchExpanded && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleSearch}
            className="absolute left-[4rem] top-3 min-h-11 min-w-11 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-40 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
            aria-label="Open search"
          >
            <SearchIcon className="h-5 w-5" />
          </motion.button>
        )}

        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{place.name}</h1>
            {place.country && (
              <p className="text-sm text-muted-foreground">{flagEmoji} {place.country}</p>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      <AnimatePresence>
        {isSearchExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 relative overflow-hidden"
          >
            <SearchInput
              searchTerm={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={handleClearSearch}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-3">
        <CategoriesScrollbar />
      </div>

      <div>
        <CategoryResults
          category={selectedCategory}
          groupedRecommendations={filteredGroups}
          onToggleVisited={() => {}}
          onDeleteRecommendation={() => {}}
          onEditClick={handleEditClick}
          onCityClick={() => {}}
          hideCityHeader
          hideCountryHeader
          showToggle={false}
          noSidePadding={true}
        />
      </div>

      {!isDrawerOpen && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
          aria-label="Add recommendation"
          onClick={() => {
            mediumHaptic();
            setEditRecommendation(null);
            setIsDrawerOpen(true);
          }}
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"
          }}
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      <RecommendationDrawer
        key={editRecommendation ? `edit-${editRecommendation.id}` : "new"}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={place.name}
        initialCountry={place.country || ""}
        editRecommendation={editRecommendation}
      />
    </Layout>
  );
};

export default PlaceDetail;