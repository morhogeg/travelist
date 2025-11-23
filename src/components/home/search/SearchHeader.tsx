import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { SearchResult, SearchHeaderProps } from "./types";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import countryToCode from "@/utils/flags/countryToCode";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { lightHaptic } from "@/utils/ios/haptics";

const SearchHeader = ({ heading }: SearchHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
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
        setIsSearchExpanded(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'place' && result.id) navigate(`/place/${result.id}`);
    else if (result.type === 'recommendation' && result.cityId) {
      navigate(`/place/${result.cityId}`);
      setTimeout(() => {
        if (result.id) {
          const el = document.getElementById(`rec-${result.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('highlight-recommendation');
            setTimeout(() => el.classList.remove('highlight-recommendation'), 2000);
          }
        }
      }, 500);
    }
    setSearchTerm("");
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    setIsSearchExpanded(false);
  };

  const toggleSearch = () => {
    lightHaptic();
    setIsSearchExpanded(!isSearchExpanded);
    if (isSearchExpanded) {
      setSearchTerm("");
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const getFlag = (country: string | null): string => {
    if (!country) return "";
    const code = countryToCode[country];
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-4 pt-3 pb-4 relative">
      {(isCityView || countryName) && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-3 top-3 p-2 z-50 hover:bg-[#667eea]/10 active:bg-[#667eea]/20 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#667eea]" />
        </button>
      )}

      {/* Search Icon Button - only on home view */}
      {!(isCityView || countryName) && !isSearchExpanded && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleSearch}
          className="absolute left-3 top-3 min-h-11 min-w-11 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-40 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
          aria-label="Open search"
        >
          <SearchIcon className="h-5 w-5" />
        </motion.button>
      )}

      <div className="flex items-center gap-4">
        <div className={`flex-1 ${!(isCityView || countryName) ? 'text-center' : 'pl-10'}`}>
          {countryName && !isCityView ? (
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="mr-2">📍{getFlag(countryName)}</span>
              {countryName}
            </h1>
          ) : cityName && countryName ? (
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="mr-2">📍</span>
              {cityName}, {countryName}
            </h1>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {heading || "Travelist"}
            </h1>
          )}
        </div>
      </div>

      {/* Expandable Search Bar */}
      <AnimatePresence>
        {isSearchExpanded && !(isCityView || countryName) && (
          <motion.div
            ref={searchContainerRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 relative overflow-hidden"
          >
            <SearchInput searchTerm={searchTerm} onChange={handleSearch} onClear={clearSearch} />
            <SearchResults results={searchResults} searchTerm={searchTerm} showResults={showResults} onResultClick={handleResultClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchHeader;