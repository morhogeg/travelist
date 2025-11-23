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
import { Checkbox } from "@/components/ui/checkbox";
import { addPlaceToRoute } from "@/utils/route/route-manager";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { Route } from "@/types/route";
import { RecommendationPlace } from "@/utils/recommendation/types";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { getCategoryColor, getCategoryIcon } from "@/components/recommendations/utils/category-data";
import { mediumHaptic } from "@/utils/ios/haptics";

interface AddPlacesToRouteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  dayNumber: number;
  onPlacesAdded: () => void;
}

interface PlaceItem extends RecommendationPlace {
  recId: string;
  alreadyInRoute: boolean;
}

const AddPlacesToRouteDrawer: React.FC<AddPlacesToRouteDrawerProps> = ({
  isOpen,
  onClose,
  route,
  dayNumber,
  onPlacesAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<PlaceItem[]>([]);
  const { toast } = useToast();

  // Load available places when drawer opens
  useEffect(() => {
    if (isOpen) {
      const recommendations = getRecommendations();

      // Get places from the same city only
      const cityPlaces: PlaceItem[] = [];
      const existingPlaceIds = new Set(
        route.days.flatMap(day => day.places.map(p => p.placeId))
      );

      recommendations.forEach(rec => {
        // Only include places from the same city
        if (rec.cityId === route.cityId || rec.city === route.city) {
          rec.places.forEach(place => {
            if (place.id) {
              cityPlaces.push({
                ...place,
                recId: place.recId || place.id,
                alreadyInRoute: existingPlaceIds.has(place.id)
              });
            }
          });
        }
      });

      // Remove duplicates
      const uniquePlaces = Array.from(
        new Map(cityPlaces.map(place => [place.id, place])).values()
      );

      // Sort: not in route first, then by name
      uniquePlaces.sort((a, b) => {
        if (a.alreadyInRoute !== b.alreadyInRoute) {
          return a.alreadyInRoute ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

      setAvailablePlaces(uniquePlaces);
    } else {
      // Reset state when drawer closes
      setSearchTerm("");
      setSelectedPlaceIds([]);
    }
  }, [isOpen, route]);

  const handleTogglePlace = (placeId: string, alreadyInRoute: boolean) => {
    if (alreadyInRoute) {
      // Don't allow selecting places already in route
      toast({
        title: "Already in route",
        description: "This place is already added to your route.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPlaceIds(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  const handleAddPlaces = () => {
    mediumHaptic();

    if (selectedPlaceIds.length === 0) {
      toast({
        title: "No places selected",
        description: "Please select at least one place to add.",
        variant: "destructive",
      });
      return;
    }

    try {
      selectedPlaceIds.forEach(placeId => {
        addPlaceToRoute(route.id, dayNumber, placeId);
      });

      toast({
        title: "Places added!",
        description: `${selectedPlaceIds.length} place${selectedPlaceIds.length !== 1 ? 's' : ''} added to Day ${dayNumber}.`,
      });

      onPlacesAdded();
      onClose();
    } catch (error) {
      console.error("Error adding places to route:", error);
      toast({
        title: "Error",
        description: "Failed to add places to route. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter places based on search term
  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Add Places to Day {dayNumber}</DrawerTitle>
          <DrawerDescription>
            Select places from {route.city} to add to your itinerary
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Places Search */}
          <div className="space-y-2 sticky top-0 bg-background z-10 pb-2">
            <label className="text-sm font-medium">
              {selectedPlaceIds.length > 0 && `${selectedPlaceIds.length} selected`}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Places List */}
          {availablePlaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No places available in {route.city}.</p>
              <p className="text-sm mt-2">Add some recommendations first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlaces.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No places match your search
                </p>
              ) : (
                filteredPlaces.map(place => {
                  const categoryColor = getCategoryColor(place.category);
                  const isDisabled = place.alreadyInRoute;

                  return (
                    <div
                      key={place.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-l-4 transition-all ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-muted/50'
                          : 'border-border hover:bg-accent/50 cursor-pointer'
                      }`}
                      style={!isDisabled ? { borderLeftColor: categoryColor } : {}}
                      onClick={() => !isDisabled && handleTogglePlace(place.id!, isDisabled)}
                    >
                      <Checkbox
                        checked={selectedPlaceIds.includes(place.id!)}
                        disabled={isDisabled}
                        onCheckedChange={() => handleTogglePlace(place.id!, isDisabled)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="shrink-0" style={{ color: categoryColor }}>
                            {getCategoryIcon(place.category)}
                          </div>
                          <p className="font-medium text-sm truncate">{place.name}</p>
                        </div>

                        {place.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {place.description}
                          </p>
                        )}

                        {isDisabled && (
                          <p className="text-xs text-primary mt-1">
                            ✓ Already in route
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-border flex-shrink-0 pointer-events-auto">
          <Button
            type="button"
            onClick={handleAddPlaces}
            disabled={selectedPlaceIds.length === 0}
            className="text-white font-semibold pointer-events-auto"
            style={{
              background: selectedPlaceIds.length === 0 ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: selectedPlaceIds.length === 0 ? undefined : '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            Add {selectedPlaceIds.length > 0 && `(${selectedPlaceIds.length})`} Place{selectedPlaceIds.length !== 1 ? 's' : ''}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddPlacesToRouteDrawer;
