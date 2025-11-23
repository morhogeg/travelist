import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Calendar, MapPin, Trash2, Edit2, MoreVertical, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  getRouteById,
  deleteRoute,
  markRoutePlaceVisited,
  removePlaceFromRoute,
  addDayToRoute,
  reorderPlacesInDay,
  removeDayFromRoute
} from "@/utils/route/route-manager";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { Route, RouteDay, RoutePlaceReference } from "@/types/route";
import { RecommendationPlace, ParsedRecommendation } from "@/utils/recommendation/types";
import { mediumHaptic, lightHaptic } from "@/utils/ios/haptics";
import DaySection from "@/components/routes/DaySection";
import AddPlacesToRouteDrawer from "@/components/routes/AddPlacesToRouteDrawer";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RouteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<Route | null>(null);
  const [places, setPlaces] = useState<Map<string, RecommendationPlace>>(new Map());
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadRoute = useCallback(() => {
    if (!id) return;
    const routeData = getRouteById(id);
    setRoute(routeData);

    // Load all place details
    if (routeData) {
      const recommendations = getRecommendations();
      const placesMap = new Map<string, RecommendationPlace>();

      recommendations.forEach(rec => {
        rec.places.forEach(place => {
          if (place.id) {
            placesMap.set(place.id, place);
          }
        });
      });

      setPlaces(placesMap);
    }
  }, [id]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  // Listen for route updates
  useEffect(() => {
    const handleRouteUpdate = () => loadRoute();

    window.addEventListener("routeUpdated", handleRouteUpdate);
    window.addEventListener("routeDeleted", handleRouteUpdate);

    return () => {
      window.removeEventListener("routeUpdated", handleRouteUpdate);
      window.removeEventListener("routeDeleted", handleRouteUpdate);
    };
  }, [loadRoute]);

  const handleBack = () => {
    mediumHaptic();
    navigate("/routes");
  };

  const handleAddPlaces = (dayNumber: number) => {
    mediumHaptic();
    setSelectedDayNumber(dayNumber);
    setIsAddDrawerOpen(true);
  };

  const handleToggleVisited = (dayNumber: number, placeId: string, visited: boolean) => {
    lightHaptic();
    if (!id) return;
    markRoutePlaceVisited(id, dayNumber, placeId, !visited);
  };

  const handleRemovePlace = (dayNumber: number, placeId: string) => {
    mediumHaptic();
    if (!id) return;
    removePlaceFromRoute(id, dayNumber, placeId);
  };

  const handleReorderPlaces = (dayNumber: number, reorderedPlaces: RoutePlaceReference[]) => {
    if (!id) return;
    reorderPlacesInDay(id, dayNumber, reorderedPlaces);
  };

  const handleAddDay = () => {
    mediumHaptic();
    if (!id) return;
    addDayToRoute(id);
  };

  const handleRemoveDay = (dayNumber: number) => {
    mediumHaptic();
    if (!id) return;
    removeDayFromRoute(id, dayNumber);
  };

  const handleDeleteRoute = () => {
    mediumHaptic();
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRoute = () => {
    mediumHaptic();
    if (!id) return;

    deleteRoute(id);
    navigate("/routes");
  };

  if (!route) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Route not found</p>
        </div>
      </Layout>
    );
  }

  const formatDateRange = () => {
    if (!route.startDate && !route.endDate) return null;

    if (route.startDate && route.endDate) {
      const start = format(new Date(route.startDate), "MMM d");
      const end = format(new Date(route.endDate), "MMM d, yyyy");
      return `${start} - ${end}`;
    }

    if (route.startDate) {
      return format(new Date(route.startDate), "MMM d, yyyy");
    }

    return null;
  };

  const dateString = formatDateRange();
  const totalPlaces = route.days.reduce((sum, day) => sum + day.places.length, 0);
  const visitedPlaces = route.days.reduce(
    (sum, day) => sum + day.places.filter(p => p.visited).length,
    0
  );
  const progressPercentage = totalPlaces > 0 ? Math.round((visitedPlaces / totalPlaces) * 100) : 0;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 pt-2 pb-24"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteRoute}
            className="shrink-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Route Info */}
        <div className="liquid-glass-clear rounded-2xl p-4 mb-4 shadow-md">
          <h1 className="text-2xl font-bold mb-2">{route.name}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{route.city}, {route.country}</span>
          </div>

          {dateString && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{dateString}</span>
            </div>
          )}

          {/* Progress */}
          {totalPlaces > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/70 font-medium">
                  {visitedPlaces} of {totalPlaces} visited
                </span>
                <span className="font-semibold text-primary">
                  {progressPercentage}%
                </span>
              </div>

              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Days */}
        <div className="space-y-4">
          {route.days.map((day) => (
            <DaySection
              key={day.dayNumber}
              route={route}
              day={day}
              places={places}
              onAddPlaces={() => handleAddPlaces(day.dayNumber)}
              onToggleVisited={handleToggleVisited}
              onRemovePlace={handleRemovePlace}
              onReorderPlaces={handleReorderPlaces}
              onRemoveDay={handleRemoveDay}
            />
          ))}
        </div>

        {/* Add Day Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleAddDay}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Day
        </Button>
      </motion.div>

      {/* Add Places Drawer */}
      <AddPlacesToRouteDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        route={route}
        dayNumber={selectedDayNumber}
        onPlacesAdded={loadRoute}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{route.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default RouteDetail;
