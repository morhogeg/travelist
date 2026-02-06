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
import { addCollection, addPlaceToCollection } from "@/utils/collections/collectionStore";
import { getUserPlaces } from "@/utils/recommendation-parser";
import { getRecommendations } from "@/utils/recommendation-parser";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { getCategoryIcon, getCategoryColor, categories } from "@/components/recommendations/utils/category-data";
import { Keyboard } from "@capacitor/keyboard";

interface CreateCollectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCollectionCreated: () => void;
}

interface PlaceItem {
  id: string;
  name: string;
  city?: string;
  country?: string;
  image?: string;
  category?: string;
}

const CreateCollectionDrawer: React.FC<CreateCollectionDrawerProps> = ({
  isOpen,
  onClose,
  onCollectionCreated,
}) => {
  const [collectionName, setCollectionName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<PlaceItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { toast } = useToast();

  // Load all available places when drawer opens
  useEffect(() => {
    if (isOpen) {
      const userPlaces = getUserPlaces();
      const recommendations = getRecommendations();

      // Convert user places to PlaceItem format
      const placesFromUserPlaces: PlaceItem[] = userPlaces.map(place => ({
        id: place.id,
        name: place.name,
        country: place.country,
        image: place.image,
      }));

      // Convert recommendations to PlaceItem format (flatten)
      const placesFromRecommendations: PlaceItem[] = recommendations.flatMap(rec =>
        rec.places.map(place => ({
          id: place.id || `${rec.cityId || rec.id}-${place.name}`,
          name: place.name,
          city: rec.city,
          country: rec.country,
          image: place.image,
          category: place.category,
        }))
      );

      // Only use places from recommendations (they have categories)
      // Filter out cities from userPlaces
      const uniquePlaces = Array.from(
        new Map(placesFromRecommendations.map(place => [place.id, place])).values()
      ).filter(place => place.category); // Only include places with categories

      setAvailablePlaces(uniquePlaces);
    } else {
      // Reset state when drawer closes
      setCollectionName("");
      setSearchTerm("");
      setSelectedPlaceIds([]);
      setSelectedCategory(null);
    }
  }, [isOpen]);

  // Keyboard listeners
  useEffect(() => {
    let showHandle: any;
    let hideHandle: any;

    const setupListeners = async () => {
      showHandle = await Keyboard.addListener('keyboardWillShow', info => {
        setKeyboardHeight(info.keyboardHeight);
      });
      hideHandle = await Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardHeight(0);
      });
    };

    if (isOpen) {
      setupListeners();
    }

    return () => {
      if (showHandle) showHandle.remove();
      if (hideHandle) hideHandle.remove();
    };
  }, [isOpen]);

  const handleTogglePlace = (placeId: string) => {
    setSelectedPlaceIds(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    );
  };

  const handleCreateCollection = () => {
    console.log('Create collection clicked!', { collectionName, selectedPlaceIds });

    if (!collectionName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your collection.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the collection
      const newCollection = addCollection(collectionName.trim());
      console.log('Collection created:', newCollection);

      // Add selected places to the collection
      selectedPlaceIds.forEach(placeId => {
        addPlaceToCollection(newCollection.id, placeId);
      });

      toast({
        title: "Collection created!",
        description: `"${collectionName}" has been created with ${selectedPlaceIds.length} place${selectedPlaceIds.length !== 1 ? 's' : ''}.`,
      });

      onCollectionCreated();
      onClose();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter places based on search term and category
  const filteredPlaces = availablePlaces.filter(place => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchTerm.toLowerCase());

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
      <DrawerContent
        className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border flex flex-col"
        style={{
          maxHeight: '94vh',
          height: 'auto',
          minHeight: '500px',
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
        }}
      >
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Create New Collection</DrawerTitle>
          <DrawerDescription>
            Name your collection and select places to add
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Collection Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Collection Name</label>
            <Input
              placeholder="e.g., Summer Trip 2024"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Places Search */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Add Places {selectedPlaceIds.length > 0 && `(${selectedPlaceIds.length} selected)`}
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
              <p>No places available yet.</p>
              <p className="text-sm mt-2">Add some recommendations first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlaces.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No places match your search</p>
              ) : (
                filteredPlaces.map(place => {
                  const categoryColor = getCategoryColor(place.category || 'general');
                  const isSelected = selectedPlaceIds.includes(place.id);

                  return (
                    <div
                      key={place.id}
                      className="flex items-center space-x-3 p-3 rounded-xl border-l-4 transition-all cursor-pointer"
                      style={{ borderLeftColor: categoryColor }}
                      onClick={() => handleTogglePlace(place.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleTogglePlace(place.id)}
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

                        <p className="text-xs text-muted-foreground">
                          {place.city}{place.country ? `, ${place.country}` : ''}
                        </p>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCreateCollection();
            }}
            disabled={!collectionName.trim()}
            className={`font-semibold pointer-events-auto ${!collectionName.trim() ? 'bg-muted text-muted-foreground' : 'text-white'}`}
            style={collectionName.trim() ? {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            } : undefined}
          >
            Create Collection
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateCollectionDrawer;
