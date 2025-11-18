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

      // Combine and deduplicate by id
      const allPlaces = [...placesFromUserPlaces, ...placesFromRecommendations];
      const uniquePlaces = Array.from(
        new Map(allPlaces.map(place => [place.id, place])).values()
      );

      setAvailablePlaces(uniquePlaces);
    } else {
      // Reset state when drawer closes
      setCollectionName("");
      setSearchTerm("");
      setSelectedPlaceIds([]);
    }
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

  // Filter places based on search term
  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[90vh] flex flex-col">
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
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Add Places ({selectedPlaceIds.length} selected)
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
              <p>No places available yet.</p>
              <p className="text-sm mt-2">Add some recommendations first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPlaces.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No places match your search</p>
              ) : (
                filteredPlaces.map(place => (
                  <div
                    key={place.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleTogglePlace(place.id)}
                  >
                    <Checkbox
                      checked={selectedPlaceIds.includes(place.id)}
                      onCheckedChange={() => handleTogglePlace(place.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {place.image && (
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{place.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {place.city && `${place.city}, `}{place.country}
                        {place.category && ` • ${place.category}`}
                      </p>
                    </div>
                  </div>
                ))
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
              console.log('Button clicked!');
              handleCreateCollection();
            }}
            disabled={!collectionName.trim()}
            className="text-white font-semibold pointer-events-auto"
            style={{
              background: !collectionName.trim() ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: !collectionName.trim() ? undefined : '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
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
