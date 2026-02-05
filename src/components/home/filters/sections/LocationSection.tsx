import React from "react";
import { MapPin, Globe } from "lucide-react";
import { lightHaptic } from "@/utils/ios/haptics";
import SourcePill from "@/components/ui/SourcePill";

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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCountries.map((country) => (
              <SourcePill
                key={country}
                label={country}
                isActive={countries.includes(country)}
                onClick={() => handleCountryToggle(country)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cities */}
      {availableCities.length > 0 && availableCountries.length > 0 && (
        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent my-2" />
      )}

      {/* Cities */}
      {availableCities.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">City</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableCities.map((city) => (
              <SourcePill
                key={city}
                label={city}
                isActive={cities.includes(city)}
                onClick={() => handleCityToggle(city)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSection;
