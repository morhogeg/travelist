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
import { FolderPlus, MapPin, Plus, Check } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRoutes(getRoutes());
      setNewRouteName("");
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleAddToRoute = (route: Route) => {
    if (!placeId) return;
    const added = addPlaceToRoute(route.id, 1, placeId);
    if (added) {
      toast({
        title: "Added to route",
        description: `${placeName} added to ${route.name}`,
      });
      onAdded?.(route.name);
      onClose();
    } else {
      toast({
        title: "Already in route",
        description: `${placeName} is already in ${route.name}`,
      });
    }
  };

  const handleCreateRoute = () => {
    const name = newRouteName.trim() || `${initialCity || "New"} Route`;
    const city = initialCity || "Unknown";
    const country = initialCountry || "Unknown";
    const newRoute = createRoute(name, initialCityId || "", city, country);
    setRoutes((prev) => [...prev, newRoute]);
    handleAddToRoute(newRoute);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border max-h-[60vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Add to Route</DrawerTitle>
          <DrawerDescription>
            Select a route or create a new one for this place
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 overflow-y-auto flex-1 min-h-0 space-y-2">
          {routes.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No routes yet</p>
              <p className="text-sm mt-1">Create your first route below</p>
            </div>
          ) : (
            <div className="space-y-2">
              {routes.map((route) => (
                <button
                  key={route.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 ios26-transition-smooth text-left"
                  onClick={() => handleAddToRoute(route)}
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
                  <Check className="h-4 w-4 text-transparent group-hover:text-primary" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            {isCreating ? (
              <div className="flex gap-2">
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
                <Button size="sm" onClick={handleCreateRoute}>
                  <Plus className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-dashed"
                onClick={() => setIsCreating(true)}
              >
                <FolderPlus className="h-4 w-4" />
                <span>Create New Route</span>
              </Button>
            )}
          </div>
        </div>

        <DrawerFooter className="border-t border-border">
          <Button onClick={onClose}>Done</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RoutePickerDrawer;
