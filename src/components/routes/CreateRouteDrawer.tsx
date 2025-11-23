import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createRoute } from "@/utils/route/route-manager";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { useToast } from "@/hooks/use-toast";
import { mediumHaptic } from "@/utils/ios/haptics";
import { MapPin } from "lucide-react";

interface CreateRouteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteCreated: () => void;
  initialCity?: string;
  initialCountry?: string;
  initialCityId?: string;
}

interface CityOption {
  cityId: string;
  city: string;
  country: string;
}

const CreateRouteDrawer: React.FC<CreateRouteDrawerProps> = ({
  isOpen,
  onClose,
  onRouteCreated,
  initialCity,
  initialCountry,
  initialCityId,
}) => {
  const [routeName, setRouteName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(initialCityId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const { toast } = useToast();

  // Load available cities when drawer opens
  useEffect(() => {
    if (isOpen) {
      const recommendations = getRecommendations();
      const cities: CityOption[] = recommendations.map(rec => ({
        cityId: rec.cityId || rec.id,
        city: rec.city,
        country: rec.country || "Unknown"
      }));

      // Remove duplicates
      const uniqueCities = Array.from(
        new Map(cities.map(c => [c.cityId, c])).values()
      );

      setAvailableCities(uniqueCities);

      // Set initial city if provided
      if (initialCityId) {
        setSelectedCityId(initialCityId);
      } else if (uniqueCities.length === 1) {
        setSelectedCityId(uniqueCities[0].cityId);
      }

      // Generate default route name if city is provided
      if (initialCity && !routeName) {
        setRouteName(`${initialCity} Trip`);
      }
    } else {
      // Reset state when drawer closes
      if (!initialCityId) {
        setRouteName("");
        setSelectedCityId("");
      }
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen, initialCity, initialCityId]);

  const handleCreateRoute = () => {
    mediumHaptic();

    if (!routeName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your route.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCityId) {
      toast({
        title: "City required",
        description: "Please select a city for your route.",
        variant: "destructive",
      });
      return;
    }

    // Validate dates if both provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        toast({
          title: "Invalid dates",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        return;
      }
    }

    const selectedCity = availableCities.find(c => c.cityId === selectedCityId);
    if (!selectedCity) {
      toast({
        title: "Error",
        description: "Selected city not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      createRoute(
        routeName.trim(),
        selectedCity.cityId,
        selectedCity.city,
        selectedCity.country,
        startDate || undefined,
        endDate || undefined
      );

      toast({
        title: "Route created!",
        description: `"${routeName}" has been created successfully.`,
      });

      onRouteCreated();
      onClose();
    } catch (error) {
      console.error("Error creating route:", error);
      toast({
        title: "Error",
        description: "Failed to create route. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedCity = availableCities.find(c => c.cityId === selectedCityId);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Create New Route</DrawerTitle>
          <DrawerDescription>
            Plan your trip itinerary for a city
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0 pb-4">
          {/* Route Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Route Name</label>
            <Input
              placeholder="e.g., Paris Weekend, Tokyo Day 1"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            {availableCities.length === 0 ? (
              <div className="liquid-glass-clear rounded-xl p-4 text-center text-sm text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No cities available yet.</p>
                <p className="text-xs mt-1">Add some recommendations first!</p>
              </div>
            ) : (
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a city...</option>
                {availableCities.map((city) => (
                  <option key={city.cityId} value={city.cityId}>
                    {city.city}, {city.country}
                  </option>
                ))}
              </select>
            )}
            {selectedCity && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3 w-3" />
                {selectedCity.city}, {selectedCity.country}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date (Optional)</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date (Optional)</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                disabled={!startDate}
              />
              {!startDate && (
                <p className="text-xs text-muted-foreground">
                  Add a start date first
                </p>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="liquid-glass-clear rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              💡 You can add places to your route after creating it
            </p>
          </div>
        </div>

        <DrawerFooter className="border-t border-border flex-shrink-0 pointer-events-auto">
          <Button
            type="button"
            onClick={handleCreateRoute}
            disabled={!routeName.trim() || !selectedCityId}
            className="text-white font-semibold pointer-events-auto"
            style={{
              background: (!routeName.trim() || !selectedCityId) ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: (!routeName.trim() || !selectedCityId) ? undefined : '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            Create Route
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateRouteDrawer;
