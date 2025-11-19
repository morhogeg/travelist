import React from "react";
import { motion } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import { lightHaptic } from "@/utils/ios/haptics";

interface LocationSectionProps {
  countries: string[];
  cities: string[];
  availableCountries: string[];
  availableCities: string[];
  onCountriesChange: (values: string[]) => void;
  onCitiesChange: (values: string[]) => void;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  countries,
  cities,
  availableCountries,
  availableCities,
  onCountriesChange,
  onCitiesChange,
}) => {
  const handleCountryToggle = (country: string) => {
    lightHaptic();
    const newValues = countries.includes(country)
      ? countries.filter((c) => c !== country)
      : [...countries, country];
    onCountriesChange(newValues);
  };

  const handleCityToggle = (city: string) => {
    lightHaptic();
    const newValues = cities.includes(city)
      ? cities.filter((c) => c !== city)
      : [...cities, city];
    onCitiesChange(newValues);
  };

  return (
    <div className="space-y-4">
      {/* Countries */}
      {availableCountries.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#667eea]" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Countries</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCountries.map((country) => {
              const isSelected = countries.includes(country);
              return (
                <motion.button
                  key={country}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCountryToggle(country)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    border ios26-transition-smooth
                    ${
                      isSelected
                        ? "border-[#667eea] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "border-white/20 liquid-glass-clear text-gray-700 dark:text-gray-300 hover:border-[#667eea]/30"
                    }
                  `}
                >
                  {country}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cities */}
      {availableCities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#667eea]" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cities</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCities.map((city) => {
              const isSelected = cities.includes(city);
              return (
                <motion.button
                  key={city}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCityToggle(city)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    border ios26-transition-smooth
                    ${
                      isSelected
                        ? "border-[#667eea] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                        : "border-white/20 liquid-glass-clear text-gray-700 dark:text-gray-300 hover:border-[#667eea]/30"
                    }
                  `}
                >
                  {city}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSection;
