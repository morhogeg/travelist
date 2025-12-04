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
import { getRoutes, createRoute, addPlaceToRoute } from "@/utils/route/route-manager";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, MapPinPlus, Check } from "lucide-react";
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

  const handleCreateRoute = () => {
    const name = newRouteName.trim() || `${initialCity || "New"} Route`;
    const city = initialCity || "Unknown";
    const country = initialCountry || "Unknown";
    const newRoute = createRoute(name, initialCityId || "", city, country);
    setRoutes((prev) => [...prev, newRoute]);
    setSelectedRouteIds((prev) => new Set(prev).add(newRoute.id));
    setIsCreating(false);
    setNewRouteName("");
  };

  const handleDone = () => {
    if (!placeId) return;
    const selected = Array.from(selectedRouteIds);
    const names: string[] = [];
    selected.forEach((routeId) => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) return;
      const added = addPlaceToRoute(route.id, 1, placeId);
      if (added) {
        names.push(route.name);
      }
    });
    if (names.length) {
      toast({
        title: "Added to routes",
        description: `${placeName} added to ${names.join(", ")}`,
      });
    }
    onAdded?.("");
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[60vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-center">Add to Route</DrawerTitle>
          <DrawerDescription className="text-center">
            Select a route or create a new one for this place
          </DrawerDescription>
        </DrawerHeader>

        {/* Scrollable list */}
        <div className="px-6 overflow-y-auto flex-1 min-h-0 space-y-2">
          {routes.length === 0 && !isCreating ? (
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border ios26-transition-smooth text-left ${
                      selected ? "border-[#667eea] bg-[#667eea]/10" : "border-border hover:border-[#667eea]/30"
                    }`}
                    onClick={() => toggleRoute(route.id)}
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

          {/* Create route section (non-scrolling) */}
        <div className="px-6 pt-3 pb-2 border-t border-border space-y-2">
          {isCreating ? (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Route name"
                value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateRoute();
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button size="sm" onClick={handleCreateRoute} className="bg-[#667eea] text-white">
                  <MapPinPlus className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border border-border"
                onClick={() => setIsCreating(true)}
              >
                <MapPinPlus className="h-4 w-4" />
                <span>Create New Route</span>
              </Button>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <Button
            className={`w-full ring-0 focus-visible:ring-0 active:bg-muted/60 ${
              selectedRouteIds.size === 0 ? "opacity-60 pointer-events-none" : ""
            }`}
            variant="default"
            onClick={handleDone}
            style={{
              WebkitTapHighlightColor: 'transparent',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RoutePickerDrawer;
