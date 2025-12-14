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
import { addPlaceToCollection, Collection } from "@/utils/collections/collectionStore";
import { getRecommendations } from "@/utils/recommendation-parser";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { getCategoryColor, getCategoryIcon, categories } from "@/components/recommendations/utils/category-data";
import { mediumHaptic } from "@/utils/ios/haptics";

interface AddPlacesToCollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collection: Collection;
  onPlacesAdded: () => void;
}

interface PlaceItem {
  id: string;
  recId: string;
  name: string;
  description?: string;
  category?: string;
  city?: string;
  country?: string;
  alreadyInCollection: boolean;
}

const AddPlacesToCollectionDrawer: React.FC<AddPlacesToCollectionDrawerProps> = ({
  isOpen,
  onClose,
  collection,
  onPlacesAdded,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<PlaceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Load available places when drawer opens
  useEffect(() => {
    if (isOpen) {
      const recommendations = getRecommendations();
      const existingPlaceIds = new Set(collection.placeIds);

      // Flatten all places from recommendations
      const allPlaces: PlaceItem[] = [];

      recommendations.forEach(rec => {
        rec.places.forEach(place => {
          const placeId = place.recId || place.id;
          if (placeId) {
            allPlaces.push({
              id: place.id,
              recId: placeId,
              name: place.name,
              description: place.description,
              category: place.category || rec.category,
              city: rec.city,
              country: rec.country,
              alreadyInCollection: existingPlaceIds.has(placeId) || existingPlaceIds.has(place.id)
            });
          }
        });
      });

      // Remove duplicates by id
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.recId, place])).values()
      );

      // Sort: not in collection first, then by name
      uniquePlaces.sort((a, b) => {
        if (a.alreadyInCollection !== b.alreadyInCollection) {
          return a.alreadyInCollection ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

      setAvailablePlaces(uniquePlaces);
    } else {
      // Reset state when drawer closes
      setSearchTerm("");
      setSelectedPlaceIds([]);
      setSelectedCategory(null);
    }
  }, [isOpen, collection]);

  const handleTogglePlace = (placeId: string, alreadyInCollection: boolean) => {
    if (alreadyInCollection) {
      toast({
        title: "Already in collection",
        description: "This place is already in this collection.",
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
        addPlaceToCollection(collection.id, placeId);
      });

      toast({
        title: "Places added!",
        description: `${selectedPlaceIds.length} place${selectedPlaceIds.length !== 1 ? 's' : ''} added to "${collection.name}".`,
      });

      onPlacesAdded();
      onClose();
    } catch (error) {
      console.error("Error adding places to collection:", error);
      toast({
        title: "Error",
        description: "Failed to add places. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter places based on search term and category
  const filteredPlaces = availablePlaces.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory ||
      place.category?.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Get available categories from places
  const availableCategories = Array.from(
    new Set(availablePlaces.map(p => p.category?.toLowerCase()).filter(Boolean))
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Add Places to {collection.name}</DrawerTitle>
          <DrawerDescription>
            Select places from your recommendations to add
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3 sticky top-0 bg-background z-10 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search places..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter Chips */}
            {availableCategories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className={`shrink-0 text-xs ${!selectedCategory ? 'text-white border-transparent' : ''}`}
                  style={!selectedCategory ? {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  } : undefined}
                >
                  All
                </Button>
                {categories
                  .filter(cat => availableCategories.includes(cat.id.toLowerCase()))
                  .map(cat => {
                    const isActive = selectedCategory?.toLowerCase() === cat.id.toLowerCase();
                    return (
                      <Button
                        key={cat.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`shrink-0 text-xs ${isActive ? 'text-white border-transparent' : ''}`}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        } : undefined}
                      >
                        {cat.icon} {cat.label}
                      </Button>
                    );
                  })
                }
              </div>
            )}
          </div>

          {/* Places List */}
          {availablePlaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No places available.</p>
              <p className="text-sm mt-2">Add some recommendations first!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {filteredPlaces.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No places match your search
                </p>
              ) : (
                filteredPlaces.map(place => {
                  const categoryColor = getCategoryColor(place.category || 'general');
                  const isDisabled = place.alreadyInCollection;
                  const isSelected = selectedPlaceIds.includes(place.recId);

                  return (
                    <div
                      key={place.recId}
                      className={`flex items-center space-x-3 p-3 rounded-xl border-l-4 transition-all ${isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-muted/50'
                          : 'cursor-pointer'
                        }`}
                      style={!isDisabled ? { borderLeftColor: categoryColor } : {}}
                      onClick={() => !isDisabled && handleTogglePlace(place.recId, isDisabled)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => handleTogglePlace(place.recId, isDisabled)}
                        onClick={(e) => e.stopPropagation()}
                        className={isSelected ? "border-[#667eea] data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#667eea] data-[state=checked]:to-[#764ba2]" : ""}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="shrink-0" style={{ color: categoryColor }}>
                            {getCategoryIcon(place.category || 'general')}
                          </div>
                          <p className="font-medium text-sm truncate">{place.name}</p>
                        </div>

                        {place.city && (
                          <p className="text-xs text-muted-foreground">
                            {place.city}{place.country ? `, ${place.country}` : ''}
                          </p>
                        )}

                        {isDisabled && (
                          <p className="text-xs text-primary mt-1">
                            ✓ Already in collection
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

        <DrawerFooter className="border-t border-border">
          <Button
            type="button"
            onClick={handleAddPlaces}
            disabled={selectedPlaceIds.length === 0}
            className={`font-semibold ${selectedPlaceIds.length === 0 ? 'bg-muted text-muted-foreground' : 'text-white'}`}
            style={selectedPlaceIds.length > 0 ? {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            } : undefined}
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

export default AddPlacesToCollectionDrawer;
