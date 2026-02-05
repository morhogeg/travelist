import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { SearchResult, SearchHeaderProps } from "./types";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import countryToCode from "@/utils/flags/countryToCode";
import { ArrowLeft } from "lucide-react";
import { FilterButton } from "@/components/home/filters";

interface ExtendedSearchHeaderProps extends SearchHeaderProps {
  activeFilterCount?: number;
  onFilterClick?: () => void;
  scrollOpacity?: number;
}

const SearchHeader = ({ heading, activeFilterCount = 0, onFilterClick, scrollOpacity = 1 }: ExtendedSearchHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [cityName, setCityName] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [isCityView, setIsCityView] = useState(false);

  useEffect(() => {
    const matchCity = location.pathname.match(/\/place\/(.+)/);
    const matchCountry = location.pathname.match(/\/country\/(.+)/);

    const allPlaces = getUserPlaces();
    const allRecs = getRecommendations();

    if (matchCity) {
      const placeId = matchCity[1];
      const place = allPlaces.find(p => p.id === placeId);
      const rec = allRecs.find(r => r.id === placeId || r.cityId === placeId);
      const city = place?.name || rec?.city;
      const country = place?.country || rec?.country;
      setCityName(city || null);
      setCountryName(country || null);
      setIsCityView(true);
    } else if (matchCountry) {
      const country = decodeURIComponent(matchCountry[1]);
      setCityName(null);
      setCountryName(country);
      setIsCityView(false);
    } else {
      setCityName(null);
      setCountryName(null);
      setIsCityView(false);
    }
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    window.dispatchEvent(new CustomEvent("navbar:hide"));
    window.dispatchEvent(new CustomEvent("fab:hide"));
  };

  const handleBlur = () => {
    // Only show if no search term (e.g. user just tapped and left without typing)
    if (searchTerm.trim().length === 0) {
      window.dispatchEvent(new CustomEvent("navbar:show"));
      window.dispatchEvent(new CustomEvent("fab:show"));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length > 0) {
      const places = getUserPlaces();
      const recommendations = getRecommendations();
      const filteredPlaces = places.filter(place =>
        place.name.toLowerCase().includes(term.toLowerCase()) ||
        place.country?.toLowerCase().includes(term.toLowerCase())
      ).map(place => ({
        id: place.id,
        name: place.name,
        country: place.country,
        type: 'place' as const
      }));
      const filteredRecommendations = recommendations.flatMap(rec => {
        const cityMatches = rec.city.toLowerCase().includes(term.toLowerCase());
        return rec.places.filter(place => {
          const lowerTerm = term.toLowerCase();
          const nameMatches = place.name.toLowerCase().includes(lowerTerm);
          const sourceMatches = place.source?.name?.toLowerCase().includes(lowerTerm);
          const tipMatches = place.context?.specificTip?.toLowerCase().includes(lowerTerm);
          const noteMatches = place.context?.personalNote?.toLowerCase().includes(lowerTerm);
          const tagMatches = place.context?.occasionTags?.some(tag =>
            tag.toLowerCase().includes(lowerTerm)
          );

          return nameMatches || cityMatches || sourceMatches || tipMatches || noteMatches || tagMatches;
        }).map(place => ({
          id: place.id || `place-${Date.now()}-${Math.random()}`,
          name: place.name,
          city: rec.city,
          cityId: rec.cityId || rec.id,
          category: place.category,
          placeId: place.id,
          type: 'recommendation' as const
        }));
      });
      setSearchResults([...filteredPlaces, ...filteredRecommendations]);
      setShowResults(true);
      window.dispatchEvent(new CustomEvent("navbar:hide"));
      window.dispatchEvent(new CustomEvent("fab:hide"));
    } else {
      setSearchResults([]);
      setShowResults(false);
      // Do not show navbar here, rely on blur
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'place' && result.id) {
      navigate(`/place/${result.id}`);
    } else if (result.type === 'recommendation') {
      // Dispatch event to open the recommendation details dialog
      window.dispatchEvent(new CustomEvent('openRecommendationDetails', {
        detail: {
          id: result.id,
          placeId: result.placeId,
          cityId: result.cityId
        }
      }));
    }
    setSearchTerm("");
    setShowResults(false);
    window.dispatchEvent(new CustomEvent("navbar:show"));
    window.dispatchEvent(new CustomEvent("fab:show"));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    window.dispatchEvent(new CustomEvent("navbar:show"));
    window.dispatchEvent(new CustomEvent("fab:show"));
  };



  const getFlag = (country: string | null): string => {
    if (!country) return "";
    const code = countryToCode[country];
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: scrollOpacity, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 pt-3 pb-2 relative"
      style={{
        pointerEvents: scrollOpacity < 0.1 ? 'none' : 'auto',
        transition: 'opacity 0.15s ease-out'
      }}
    >
      {(isCityView || countryName) && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 p-2 z-50 hover:bg-[#667eea]/10 active:bg-[#667eea]/20 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#667eea]" />
        </button>
      )}

      {/* Heading */}
      {(isCityView || countryName) && (
        <div className="flex items-center gap-4 mb-1">
          <h1 className="text-[28px] font-bold tracking-tight bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent dark:from-white dark:to-white/80">
            {isCityView && cityName ? (
              <span className="flex items-center gap-2">
                <span>📍</span>
                <span>{cityName}</span>
              </span>
            ) : countryName ? (
              <span className="flex items-center gap-2">
                <span>📍{getFlag(countryName)}</span>
                <span>{countryName}</span>
              </span>
            ) : null}
          </h1>
        </div>
      )}

      {/* Always-visible Search Bar + Filter (home view only) */}
      {!(isCityView || countryName) && (
        <div ref={searchContainerRef} className="mt-3 relative">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput
                searchTerm={searchTerm}
                onChange={handleSearch}
                onClear={clearSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            {onFilterClick && (
              <FilterButton
                activeCount={activeFilterCount}
                onClick={onFilterClick}
              />
            )}
          </div>
          <SearchResults results={searchResults} searchTerm={searchTerm} showResults={showResults} onResultClick={handleResultClick} />
        </div>
      )}
    </motion.div>
  );
};

export default SearchHeader;