import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { SearchResult, SearchHeaderProps } from "./types";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

const SearchHeader = ({ heading }: SearchHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [cityName, setCityName] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);

  useEffect(() => {
    const match = location.pathname.match(/\/place\/(.+)/);
    if (match) {
      const placeId = match[1];
      const allPlaces = getUserPlaces();
      const allRecs = getRecommendations();
      const matchPlace = allPlaces.find(p => p.id === placeId);
      const matchRec = allRecs.find(r => r.id === placeId || r.cityId === placeId);
      const city = matchPlace?.name || matchRec?.city;
      const country = matchPlace?.country || matchRec?.country;
      setCityName(city || null);
      setCountryName(country || null);
    } else {
      setCityName(null);
      setCountryName(null);
    }
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim().length > 0) {
      const places = getUserPlaces();
      const recommendations = getRecommendations();
      
      const filteredPlaces = places
        .filter(place => 
          place.name.toLowerCase().includes(term.toLowerCase()) ||
          place.country?.toLowerCase().includes(term.toLowerCase())
        )
        .map(place => ({
          id: place.id,
          name: place.name,
          country: place.country,
          type: 'place' as const
        }));

      const filteredRecommendations = recommendations.flatMap(rec => {
        const cityMatches = rec.city.toLowerCase().includes(term.toLowerCase());

        return rec.places
          .filter(place => 
            place.name.toLowerCase().includes(term.toLowerCase()) || cityMatches
          )
          .map(place => ({
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
    if (result.type === 'place') {
      if (result.id) {
        navigate(`/place/${result.id}`);
      }
    } else if (result.type === 'recommendation' && result.cityId) {
      navigate(`/place/${result.cityId}`);

      setTimeout(() => {
        if (result.id) {
          const placeElement = document.getElementById(`rec-${result.id}`);
          if (placeElement) {
            placeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            placeElement.classList.add('highlight-recommendation');
            setTimeout(() => {
              placeElement.classList.remove('highlight-recommendation');
            }, 2000);
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-6 pt-6 pb-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {cityName && countryName ? (
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="mr-2">📍</span>
              {cityName}, {countryName}
            </h1>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
              <p className="text-muted-foreground">Find your next destination</p>
            </>
          )}
        </div>
      </div>
      <div ref={searchContainerRef} className="mt-6 relative">
        <SearchInput 
          searchTerm={searchTerm} 
          onChange={handleSearch} 
          onClear={clearSearch} 
        />
        <SearchResults 
          results={searchResults}
          searchTerm={searchTerm}
          showResults={showResults}
          onResultClick={handleResultClick}
        />
      </div>
    </motion.div>
  );
};

export default SearchHeader;
