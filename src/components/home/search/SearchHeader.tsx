import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { SearchResult, SearchHeaderProps } from "./types";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import countryToCode from "@/utils/flags/countryToCode";
import { ArrowLeft } from "lucide-react";

const SearchHeader = ({ heading }: SearchHeaderProps) => {
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
        return rec.places.filter(place =>
          place.name.toLowerCase().includes(term.toLowerCase()) || cityMatches
        ).map(place => ({
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
  };

  const getFlag = (country: string | null): string => {
    if (!country) return "";
    const code = countryToCode[country];
    if (!code) return "";
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
  };

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-6 pt-6 pb-4 relative">
      {(isCityView || countryName) && (
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-3 p-2 text-foreground z-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 pl-8 sm:pl-0">
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
            <>
              <h1 className="text-2xl font-bold tracking-tight">{heading || "Discover"}</h1>
              <p className="text-muted-foreground">Find your next destination</p>
            </>
          )}
        </div>
      </div>

      <div ref={searchContainerRef} className="mt-6 relative">
        <SearchInput searchTerm={searchTerm} onChange={handleSearch} onClear={clearSearch} />
        <SearchResults results={searchResults} searchTerm={searchTerm} showResults={showResults} onResultClick={handleResultClick} />
      </div>
    </motion.div>
  );
};

export default SearchHeader;