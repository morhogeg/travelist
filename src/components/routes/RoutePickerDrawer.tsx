import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRoutes, getRouteById, createRoute, addPlaceToRoute } from "@/utils/route/route-manager";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Plus, Check, X } from "lucide-react";
import { Route } from "@/types/route";

interface RoutePickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
  initialCity?: string;
  initialCountry?: string;
  initialCityId?: string;
  onAdded?: (routeName: string) => void;
}

const RoutePickerDrawer: React.FC<RoutePickerDrawerProps> = ({
  isOpen,
  onClose,
  placeId,
  placeName,
  initialCity,
  initialCountry,
  initialCityId,
  onAdded,
}) => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newRouteName, setNewRouteName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRouteIds, setSelectedRouteIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRoutes(getRoutes());
      setNewRouteName("");
      setIsCreating(false);
      setSelectedRouteIds(new Set());
    }
  }, [isOpen]);

  const toggleRoute = (routeId: string) => {
    setSelectedRouteIds((prev) => {
      const next = new Set(prev);
      if (next.has(routeId)) {
        next.delete(routeId);
      } else {
        next.add(routeId);
      }
      return next;
    });
  };

  // Create new route AND add place to it immediately
  const handleCreateAndAdd = () => {
    if (!placeId) return;

    const name = newRouteName.trim() || `${initialCity || "New"} Route`;
    const city = initialCity || "Unknown";
    const country = initialCountry || "Unknown";

    // Create the route
    const newRoute = createRoute(name, initialCityId || "", city, country);

    // Add place to it immediately
    const added = addPlaceToRoute(newRoute.id, 1, placeId, placeName);

    if (added) {
      toast({
        title: "Added to route",
        description: `${placeName} added to ${newRoute.name}`,
      });
    }

    onAdded?.("");
    onClose();
  };

  // Add to selected existing routes
  const handleAddToSelected = () => {
    if (!placeId || selectedRouteIds.size === 0) return;

    const selected = Array.from(selectedRouteIds);
    const addedNames: string[] = [];
    const alreadyInNames: string[] = [];

    selected.forEach((routeId) => {
      const route = getRouteById(routeId);
      if (!route) return;

      const added = addPlaceToRoute(route.id, 1, placeId, placeName);
      if (added) {
        addedNames.push(route.name);
      } else {
        alreadyInNames.push(route.name);
      }
    });

    if (addedNames.length > 0) {
      toast({
        title: "Added to route",
        description: `${placeName} added to ${addedNames.join(", ")}`,
      });
    } else if (alreadyInNames.length > 0) {
      toast({
        title: "Already in route",
        description: `${placeName} is already in ${alreadyInNames.join(", ")}`,
      });
    }

    onAdded?.("");
    onClose();
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewRouteName("");
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[60vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-center">Add to Route</DrawerTitle>
          <DrawerDescription className="text-center">
            {isCreating
              ? "Enter a name for your new route"
              : "Select a route or create a new one"
            }
          </DrawerDescription>
        </DrawerHeader>

        {/* Content area */}
        <div className="px-6 overflow-y-auto flex-1 min-h-0">
          {isCreating ? (
            // Creating new route mode
            <div className="py-4">
              <Input
                placeholder="Route name"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateAndAdd();
                  if (e.key === "Escape") cancelCreating();
                }}
                autoFocus
                className="w-full focus:outline-none focus:ring-0 focus-visible:ring-0"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(102, 126, 234, 0.18)',
                }}
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to create and add {placeName}
              </p>
            </div>
          ) : (
            // Route selection mode
            <>
              {routes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No routes yet</p>
                  <p className="text-sm mt-1">Create your first route below</p>
                </div>
              ) : (
                <div className="space-y-2 pb-2">
                  {routes.map((route) => {
                    const selected = selectedRouteIds.has(route.id);
                    return (
                      <button
                        key={route.id}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border ios26-transition-smooth text-left focus:outline-none ${selected
                          ? "border-[#667eea] bg-[#667eea]/10"
                          : "border-border hover:border-[#667eea]/30"
                          }`}
                        onClick={(e) => {
                          (e.currentTarget as HTMLButtonElement).blur();
                          toggleRoute(route.id);
                        }}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <div className="flex-shrink-0 text-muted-foreground">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{route.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {route.city} {route.country ? `• ${route.country}` : ""}
                          </p>
                        </div>
                        {selected && (
                          <Check className="h-4 w-4 text-[#667eea]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="border-t border-border">
          {isCreating ? (
            // Creating mode: Cancel and Create buttons
            <div className="flex gap-3 w-full">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground focus:ring-0 focus:outline-none"
                onClick={cancelCreating}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 focus:ring-0 focus:outline-none"
                onClick={handleCreateAndAdd}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                Create & Add
              </Button>
            </div>
          ) : (
            // Selection mode: New Route and Add buttons
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 border-[#667eea]/30 text-foreground hover:bg-[#667eea]/5 focus:ring-0 focus:outline-none"
                onClick={() => setIsCreating(true)}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Plus className="h-4 w-4 mr-1.5 text-[#667eea]" />
                New Route
              </Button>
              <Button
                className={`flex-1 focus:ring-0 focus:outline-none ${selectedRouteIds.size === 0 ? "opacity-50" : ""
                  }`}
                disabled={selectedRouteIds.size === 0}
                onClick={handleAddToSelected}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                Add to Route
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RoutePickerDrawer;
