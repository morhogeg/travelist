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
import { getCategoryColor, getCategoryIcon, categories } from "@/components/recommendations/utils/category-data";
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const recommendations = getRecommendations();
      const cityPlaces: PlaceItem[] = [];
      const existingPlaceIds = new Set(
        route.days.flatMap(day => day.places.map(p => p.placeId))
      );

      recommendations.forEach(rec => {
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

      const uniquePlaces = Array.from(
        new Map(cityPlaces.map(place => [place.id, place])).values()
      );

      uniquePlaces.sort((a, b) => {
        if (a.alreadyInRoute !== b.alreadyInRoute) {
          return a.alreadyInRoute ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

      setAvailablePlaces(uniquePlaces);
    } else {
      setSearchTerm("");
      setSelectedPlaceIds([]);
      setSelectedCategory(null);
    }
  }, [isOpen, route]);

  const handleTogglePlace = (placeId: string, alreadyInRoute: boolean) => {
    if (alreadyInRoute) {
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

  const filteredPlaces = availablePlaces.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory ||
      place.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const availableCategories = Array.from(
    new Set(availablePlaces.map(p => p.category?.toLowerCase()).filter(Boolean))
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background text-foreground border-t border-border max-h-[85vh] flex flex-col" forceMount>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Add places to Day {dayNumber}</DrawerTitle>
          <DrawerDescription>Select places from {route.city}</DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3 sticky top-0 bg-background z-10 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-visible:ring-1 focus-visible:ring-transparent"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(102, 126, 234, 0.18)',
                  transition: 'box-shadow 150ms ease, border-color 150ms ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(102, 126, 234, 0.35)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px rgba(102, 126, 234, 0.18)';
                }}
              />
            </div>

            {availableCategories.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={`shrink-0 text-xs font-semibold px-0 ${!selectedCategory ? 'text-foreground' : 'text-muted-foreground'}`}
                  style={!selectedCategory ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                  } : undefined}
                >
                  All
                </Button>

                {availableCategories.map((catId) => {
                  const cat = categories.find(c => c.id.toLowerCase() === catId);
                  return (
                    <Button
                      key={catId}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(catId)}
                      className={`shrink-0 text-xs font-semibold px-0 ${selectedCategory === catId ? 'text-foreground' : 'text-muted-foreground'}`}
                      style={selectedCategory === catId ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                      } : undefined}
                    >
                      {cat?.icon} {cat?.label || catId}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="divide-y divide-border/60 dark:divide-white/10">
            {filteredPlaces.map((place) => {
              const categoryColor = getCategoryColor(place.category || 'general');
              const categoryIcon = getCategoryIcon(place.category || 'general');
              return (
                <label
                  key={place.id}
                  className={`flex items-start gap-3 py-3 ios26-transition-smooth ${place.alreadyInRoute ? 'opacity-60' : ''}`}
                  onClick={() => handleTogglePlace(place.id!, place.alreadyInRoute)}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span style={{ color: categoryColor }}>{categoryIcon}</span>
                      <p className="font-medium text-sm">{place.name}</p>
                    </div>
                    {place.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{place.description}</p>
                    )}
                  </div>
                  <Checkbox
                    checked={selectedPlaceIds.includes(place.id!)}
                    onCheckedChange={() => handleTogglePlace(place.id!, place.alreadyInRoute)}
                    disabled={place.alreadyInRoute}
                    className="ml-auto h-3.5 w-3.5 rounded-full border-white text-[#667eea] data-[state=checked]:bg-white data-[state=checked]:text-[#667eea] data-[state=unchecked]:bg-transparent"
                  />
                </label>
              );
            })}
          </div>
        </div>

        <DrawerFooter className="border-t border-border flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={handleAddPlaces}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
            }}
          >
            {selectedPlaceIds.length > 0
              ? `Add ${selectedPlaceIds.length} ${selectedPlaceIds.length === 1 ? 'place' : 'places'} to Day ${dayNumber}`
              : `Add to Day ${dayNumber}`}
          </Button>
          <DrawerClose asChild>
            <button
              type="button"
              className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            >
              Cancel
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddPlacesToRouteDrawer;
