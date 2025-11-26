import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Settings, ChevronRight, BookOpen, Folder, MapPinned } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { getCollections } from "@/utils/collections/collectionStore";
import { getGroupedRoutes } from "@/utils/route/route-manager";
import { TravelStoryCard } from "@/components/story";

const Profile = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalRecommendations: 0,
    visitedCount: 0,
    totalCollections: 0,
    totalRoutes: 0,
    countriesVisited: 0,
    citiesVisited: 0,
  });

  useEffect(() => {
    // Calculate real statistics
    const places = getUserPlaces();
    const recommendations = getRecommendations();
    const collections = getCollections();
    const groupedRoutes = getGroupedRoutes();

    // Count total routes
    const totalRoutes =
      groupedRoutes.ongoing.length +
      groupedRoutes.completed.length +
      groupedRoutes.upcoming.length +
      groupedRoutes.past.length +
      groupedRoutes.undated.length;

    // Flatten all recommendations
    const allRecs = recommendations.flatMap(rec =>
      rec.places.map(place => ({
        ...place,
        city: rec.city,
        country: rec.country,
        visited: place.visited || rec.visited
      }))
    );

    // Count visited
    const visitedCount = allRecs.filter(rec => rec.visited).length;

    // Count unique countries and cities
    const uniqueCountries = new Set(
      [...places.map(p => p.country), ...recommendations.map(r => r.country)].filter(Boolean)
    );
    const uniqueCities = new Set(
      recommendations.map(r => r.city).filter(Boolean)
    );

    setStats({
      totalPlaces: places.length,
      totalRecommendations: allRecs.length,
      visitedCount,
      totalCollections: collections.length,
      totalRoutes,
      countriesVisited: uniqueCountries.size,
      citiesVisited: uniqueCities.size,
    });
  }, []);

  const completionRate = useMemo(() => {
    if (stats.totalRecommendations === 0) return 0;
    return Math.round((stats.visitedCount / stats.totalRecommendations) * 100);
  }, [stats]);

  // Action row component - iOS Settings style
  const ActionRow = ({
    icon: Icon,
    label,
    subtitle,
    value,
    onClick,
    isLast = false
  }: {
    icon: React.ElementType;
    label: string;
    subtitle?: string;
    value?: string | number;
    onClick: () => void;
    isLast?: boolean;
  }) => (
    <>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3"
      >
        <Icon className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
        <div className="flex-1 text-left min-w-0">
          <p className="font-medium text-[15px]">{label}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {value !== undefined && (
            <span className="text-sm">{value}</span>
          )}
          <ChevronRight className="h-4 w-4" />
        </div>
      </motion.button>
      {!isLast && (
        <div className="h-px bg-border/30 ml-8" />
      )}
    </>
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Header - matching other pages */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 mb-2 text-white text-xl font-bold shadow-lg">
            T
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Travelist
          </h1>
        </div>

        {/* Stats Row - Clean numbers without icon boxes */}
        <div className="flex justify-around mb-4 py-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalRecommendations}</p>
            <p className="text-xs text-muted-foreground">Places</p>
          </div>
          <div className="w-px bg-border/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.countriesVisited}</p>
            <p className="text-xs text-muted-foreground">Countries</p>
          </div>
          <div className="w-px bg-border/30" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{stats.citiesVisited}</p>
            <p className="text-xs text-muted-foreground">Cities</p>
          </div>
        </div>

        {/* Travel Story Card - Entry point to the story feature */}
        <TravelStoryCard />

        {/* Progress Section - Only show if there are recommendations */}
        {stats.totalRecommendations > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground/80">Travel Progress</p>
              <p className="text-sm font-semibold" style={{ color: '#667eea' }}>{completionRate}%</p>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.visitedCount} of {stats.totalRecommendations} places visited
            </p>
          </div>
        )}

        {/* Quick Actions - iOS list style */}
        <div className="px-3">
          <ActionRow
            icon={Folder}
            label="Collections"
            value={stats.totalCollections}
            onClick={() => navigate('/collections')}
          />
          <ActionRow
            icon={MapPinned}
            label="Routes"
            value={stats.totalRoutes}
            onClick={() => navigate('/routes')}
          />
          <ActionRow
            icon={Settings}
            label="Settings"
            subtitle="Customize your experience"
            onClick={() => navigate('/settings')}
          />
          <ActionRow
            icon={BookOpen}
            label="View Welcome Tour"
            subtitle="See the app introduction again"
            onClick={() => {
              localStorage.removeItem('onboarding_completed');
              window.dispatchEvent(new CustomEvent('resetOnboarding'));
            }}
            isLast
          />
        </div>

        {/* App Version */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Made with love for travelers
          </p>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
