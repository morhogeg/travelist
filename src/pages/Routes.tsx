import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getGroupedRoutes } from "@/utils/route/route-manager";
import { RouteWithProgress, GroupedRoutes } from "@/types/route";
import { mediumHaptic } from "@/utils/ios/haptics";
import RouteCard from "@/components/routes/RouteCard";
import CreateRouteDrawer from "@/components/routes/CreateRouteDrawer";

const Routes: React.FC = () => {
  const [groupedRoutes, setGroupedRoutes] = useState<GroupedRoutes>({
    upcoming: [],
    ongoing: [],
    past: [],
    undated: []
  });
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const navigate = useNavigate();

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

  const totalRoutes =
    groupedRoutes.upcoming.length +
    groupedRoutes.ongoing.length +
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
            <RouteCard
              key={route.id}
              route={route}
              onClick={() => handleRouteClick(route.id)}
            />
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
        className="px-6 pt-2 pb-24"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            My Routes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan your perfect trip itineraries
          </p>
        </div>

        {/* Empty State */}
        {totalRoutes === 0 ? (
          <div className="liquid-glass-clear rounded-2xl p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-2">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base mb-1">No routes yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first route to organize your trip
              </p>
            </div>
            <Button
              onClick={handleCreateRoute}
              className="text-white font-semibold shadow-lg mt-4"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Route
            </Button>
          </div>
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
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoute}
              className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl flex items-center justify-center z-50"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
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
    </Layout>
  );
};

export default Routes;
