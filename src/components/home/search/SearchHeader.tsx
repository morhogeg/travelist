
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { SearchResult, SearchHeaderProps } from "./types";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

const SearchHeader = ({ heading = "Discover" }: SearchHeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      
      // Filter places by term
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
      
      // Filter recommendations by term
      const filteredRecommendations = recommendations.flatMap(rec => {
        // Check if city name matches
        const cityMatches = rec.city.toLowerCase().includes(term.toLowerCase());
        
        // Filter places within this recommendation
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
    console.log("Navigating to result:", result);
    
    if (result.type === 'place') {
      if (result.id) {
        console.log(`Navigating to place/${result.id}`);
        navigate(`/place/${result.id}`);
      } else {
        console.error("Cannot navigate: place has no ID");
      }
    } else if (result.type === 'recommendation' && result.cityId) {
      console.log(`Navigating to place/${result.cityId}`);
      navigate(`/place/${result.cityId}`);
      
      // Scroll to specific recommendation if needed
      setTimeout(() => {
        if (result.id) {
          const placeElement = document.getElementById(`rec-${result.id}`);
          if (placeElement) {
            placeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            placeElement.classList.add('highlight-recommendation');
            
            setTimeout(() => {
              placeElement.classList.remove('highlight-recommendation');
            }, 2000);
          } else {
            console.warn(`Could not find element with id rec-${result.id}`);
          }
        }
      }, 500);
    } else {
      console.error("Cannot navigate: insufficient information", result);
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
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          <p className="text-muted-foreground">Find your next destination</p>
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
