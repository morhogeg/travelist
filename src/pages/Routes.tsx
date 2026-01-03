import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getGroupedRoutes, deleteRoute } from "@/utils/route/route-manager";
import { RouteWithProgress, GroupedRoutes } from "@/types/route";
import { mediumHaptic } from "@/utils/ios/haptics";
import RouteCard from "@/components/routes/RouteCard";
import CreateRouteDrawer from "@/components/routes/CreateRouteDrawer";
import SwipeableCard from "@/components/home/category/recommendation-item/SwipeableCard";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/use-toast";
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

const Routes: React.FC = () => {
  const [groupedRoutes, setGroupedRoutes] = useState<GroupedRoutes>({
    ongoing: [],
    completed: [],
    upcoming: [],
    past: [],
    undated: []
  });
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadRoutes = useCallback(() => {
    const routes = getGroupedRoutes();
    setGroupedRoutes(routes);
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Listen for route events
  useEffect(() => {
    const handleRouteChange = () => loadRoutes();

    window.addEventListener("routeCreated", handleRouteChange);
    window.addEventListener("routeUpdated", handleRouteChange);
    window.addEventListener("routeDeleted", handleRouteChange);

    return () => {
      window.removeEventListener("routeCreated", handleRouteChange);
      window.removeEventListener("routeUpdated", handleRouteChange);
      window.removeEventListener("routeDeleted", handleRouteChange);
    };
  }, [loadRoutes]);

  const handleCreateRoute = () => {
    mediumHaptic();
    setIsCreateDrawerOpen(true);
  };

  const handleRouteClick = (routeId: string) => {
    mediumHaptic();
    navigate(`/routes/${routeId}`);
  };

  const handleDeleteRoute = (routeId: string, routeName: string) => {
    mediumHaptic();
    setRouteToDelete({ id: routeId, name: routeName });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRoute = () => {
    if (routeToDelete) {
      mediumHaptic();
      deleteRoute(routeToDelete.id);
      loadRoutes();
      toast({
        title: "Route deleted",
        description: `"${routeToDelete.name}" has been removed.`,
      });
      setRouteToDelete(null);
    }
  };

  const totalRoutes =
    groupedRoutes.ongoing.length +
    groupedRoutes.completed.length +
    groupedRoutes.upcoming.length +
    groupedRoutes.past.length +
    groupedRoutes.undated.length;

  const RouteSection = ({
    title,
    routes,
    icon: Icon,
    emptyMessage
  }: {
    title: string;
    routes: RouteWithProgress[];
    icon: React.ComponentType<any>;
    emptyMessage?: string;
  }) => {
    if (routes.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
            {title}
          </h2>
          <span className="text-xs text-muted-foreground">({routes.length})</span>
        </div>
        <div className="space-y-2">
          {routes.map((route) => (
            <SwipeableCard
              key={route.id}
              onDeleteTrigger={() => handleDeleteRoute(route.id, route.name)}
            >
              <RouteCard
                route={route}
                onClick={() => handleRouteClick(route.id)}
              />
            </SwipeableCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Header - matching Travelist heading style */}
        <div className="flex justify-center mb-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Routes
          </h1>
        </div>

        {/* Empty State */}
        {totalRoutes === 0 ? (
          <EmptyState
            variant="no-routes"
            onCtaClick={handleCreateRoute}
          />
        ) : (
          <>
            {/* Routes List */}
            <div className="space-y-6">
              <RouteSection
                title="Ongoing"
                routes={groupedRoutes.ongoing}
                icon={CheckCircle2}
              />

              <RouteSection
                title="Completed"
                routes={groupedRoutes.completed}
                icon={CheckCircle2}
              />

              <RouteSection
                title="Upcoming"
                routes={groupedRoutes.upcoming}
                icon={Calendar}
              />

              <RouteSection
                title="Undated"
                routes={groupedRoutes.undated}
                icon={MapPin}
              />

              <RouteSection
                title="Past"
                routes={groupedRoutes.past}
                icon={Calendar}
              />
            </div>

            {/* Floating Add Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleCreateRoute}
              className="fixed bottom-20 right-4 rounded-full w-14 h-14 z-[100] ios26-transition-spring flex items-center justify-center text-white"
              aria-label="Add route"
              style={{
                bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"
              }}
            >
              <Plus className="h-6 w-6 text-white" />
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Create Route Drawer */}
      <CreateRouteDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onRouteCreated={loadRoutes}
      />

      {/* Delete Route Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{routeToDelete?.name}"? This action cannot be undone.
              All scheduled places in this route will be removed from your itinerary.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRouteToDelete(null)}>Cancel</AlertDialogCancel>
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

export default Routes;
