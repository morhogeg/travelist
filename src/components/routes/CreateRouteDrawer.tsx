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
import { createRoute, addPlaceToRoute } from "@/utils/route/route-manager";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { useToast } from "@/hooks/use-toast";
import { mediumHaptic, lightHaptic } from "@/utils/ios/haptics";
import { MapPin, ArrowLeft, ArrowRight, CheckCircle2, GripVertical } from "lucide-react";
import { getCategoryColor, getCategoryIcon } from "@/components/recommendations/utils/category-data";
import { useNavigate } from "react-router-dom";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";
import { RecommendationPlace } from "@/utils/recommendation/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface PlaceOption {
  id: string;
  name: string;
  category: string;
  description?: string;
  recId?: string;
}

interface SortablePlaceProps {
  place: PlaceOption;
  index: number;
}

const SortablePlace: React.FC<SortablePlaceProps> = ({ place, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColor = getCategoryColor(place.category);
  const categoryIcon = getCategoryIcon(place.category);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 border-l-4 bg-card ${isDragging ? 'shadow-lg scale-105' : ''} ios26-transition-smooth`}
      style={{ ...style, borderLeftColor: categoryColor }}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground ios26-transition-smooth"
          onTouchStart={() => lightHaptic()}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Order Number */}
        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {index + 1}
          </span>
        </div>

        {/* Place Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <div
              className="shrink-0 mt-0.5"
              style={{ color: categoryColor }}
            >
              {categoryIcon}
            </div>
            <h3 className="font-semibold text-sm">
              {place.name}
            </h3>
          </div>
          {place.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
              {place.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateRouteDrawer: React.FC<CreateRouteDrawerProps> = ({
  isOpen,
  onClose,
  onRouteCreated,
  initialCity,
  initialCountry,
  initialCityId,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [routeName, setRouteName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(initialCityId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<PlaceOption[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
  const [orderedPlaces, setOrderedPlaces] = useState<PlaceOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPlace, setViewingPlace] = useState<RecommendationPlace | null>(null);
  const [allRecommendations, setAllRecommendations] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load available cities when drawer opens
  useEffect(() => {
    if (isOpen) {
      const recommendations = getRecommendations();
      setAllRecommendations(recommendations);

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
      setCurrentStep(1);
      if (!initialCityId) {
        setRouteName("");
        setSelectedCityId("");
      }
      setStartDate("");
      setEndDate("");
      setSelectedPlaceIds(new Set());
      setOrderedPlaces([]);
      setSearchQuery("");
    }
  }, [isOpen, initialCity, initialCityId]);

  // Load places when city is selected
  useEffect(() => {
    if (selectedCityId) {
      const recommendations = getRecommendations();
      const cityRec = recommendations.find(r => (r.cityId || r.id) === selectedCityId);
      if (cityRec) {
        const places: PlaceOption[] = cityRec.places.map(p => ({
          id: p.id || '',
          name: p.name,
          category: p.category,
          description: p.description,
          recId: p.recId || p.id,
        })).filter(p => p.id);
        setAvailablePlaces(places);
      }
    }
  }, [selectedCityId]);

  const handleNext = () => {
    mediumHaptic();

    if (currentStep === 1) {
      // Validate step 1
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

      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Move selected places to ordered list
      const selected = availablePlaces.filter(p => selectedPlaceIds.has(p.id));
      setOrderedPlaces(selected);
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    mediumHaptic();
    if (currentStep === 3) {
      // When going back from step 3, preserve selections
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleTogglePlace = (placeId: string) => {
    lightHaptic();
    setSelectedPlaceIds(prev => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  };

  const handleViewPlaceDetails = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent toggling selection
    lightHaptic();

    // Find the full place data from recommendations
    for (const rec of allRecommendations) {
      const place = rec.places.find((p: any) => p.id === placeId || p.recId === placeId);
      if (place) {
        setViewingPlace(place);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedPlaces.findIndex(p => p.id === active.id);
      const newIndex = orderedPlaces.findIndex(p => p.id === over.id);

      setOrderedPlaces(arrayMove(orderedPlaces, oldIndex, newIndex));
      mediumHaptic();
    }
  };

  const handleCreateRoute = () => {
    mediumHaptic();

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
      const route = createRoute(
        routeName.trim(),
        selectedCity.cityId,
        selectedCity.city,
        selectedCity.country,
        startDate || undefined,
        endDate || undefined
      );

      // Add places in order
      orderedPlaces.forEach((place, index) => {
        addPlaceToRoute(route.id, 1, place.id, place.name);
      });

      toast({
        title: "Route created!",
        description: `"${routeName}" has been created with ${orderedPlaces.length} places.`,
      });

      onRouteCreated();
      onClose();

      // Navigate to the new route
      navigate(`/routes/${route.id}`);
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

  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>
            {currentStep === 1 && "Create New Route"}
            {currentStep === 2 && "Select Places"}
            {currentStep === 3 && "Review & Arrange"}
          </DrawerTitle>
          <DrawerDescription>
            {currentStep === 1 && "Plan your trip itinerary for a city"}
            {currentStep === 2 && "Choose places to add to your route"}
            {currentStep === 3 && "Drag to reorder places before creating"}
          </DrawerDescription>
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`flex-1 h-1 rounded-full ios26-transition-smooth ${step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Step {currentStep} of 3
          </p>
        </DrawerHeader>

        <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0 pb-4">
          {/* Step 1: Route Details */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Route Name</label>
                <Input
                  placeholder="e.g., Paris Weekend, Tokyo Day 1"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full"
                />
              </div>

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
            </>
          )}

          {/* Step 2: Select Places */}
          {currentStep === 2 && (
            <>
              {/* Search */}
              <div className="space-y-2 sticky top-0 bg-background z-10 pb-2">
                <Input
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {selectedPlaceIds.size} place{selectedPlaceIds.size !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Places List */}
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No places match your search' : 'No places available for this city'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPlaces.map(place => {
                    const isSelected = selectedPlaceIds.has(place.id);
                    const categoryColor = getCategoryColor(place.category);
                    const categoryIcon = getCategoryIcon(place.category);

                    return (
                      <div
                        key={place.id}
                        onClick={() => handleTogglePlace(place.id)}
                        className={`rounded-xl p-3 border-l-4 cursor-pointer ios26-transition-smooth ${isSelected ? 'bg-primary/10' : 'bg-card'
                          }`}
                        style={{ borderLeftColor: categoryColor }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="shrink-0 mt-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ios26-transition-smooth ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                              }`}>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Place Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <div
                                className="shrink-0 mt-0.5"
                                style={{ color: categoryColor }}
                              >
                                {categoryIcon}
                              </div>
                              <h3
                                onClick={(e) => handleViewPlaceDetails(place.id, e)}
                                className="font-semibold text-sm cursor-pointer hover:text-primary hover:underline ios26-transition-smooth"
                              >
                                {place.name}
                              </h3>
                            </div>
                            {place.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
                                {place.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Step 3: Review & Reorder */}
          {currentStep === 3 && (
            <>
              {orderedPlaces.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-muted-foreground">
                    No places selected. Go back to add some!
                  </p>
                </div>
              ) : (
                <>
                  <div className="liquid-glass-clear rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">
                      💡 Long-press and drag to reorder places
                    </p>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={orderedPlaces.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {orderedPlaces.map((place, index) => (
                          <SortablePlace
                            key={place.id}
                            place={place}
                            index={index}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-border flex-shrink-0 pointer-events-auto">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && (!routeName.trim() || !selectedCityId)}
                className="flex-1 text-white font-semibold pointer-events-auto"
                style={{
                  background: (currentStep === 1 && (!routeName.trim() || !selectedCityId)) ? undefined : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: (currentStep === 1 && (!routeName.trim() || !selectedCityId)) ? undefined : '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreateRoute}
                className="flex-1 text-white font-semibold pointer-events-auto"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                Create Route
              </Button>
            )}
          </div>

          <DrawerClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>

      {/* Place Details Dialog */}
      <RecommendationDetailsDialog
        isOpen={!!viewingPlace}
        onClose={() => setViewingPlace(null)}
        recommendation={viewingPlace}
        onToggleVisited={() => { }}
        hideEditDelete={true}
      />
    </Drawer>
  );
};

export default CreateRouteDrawer;
