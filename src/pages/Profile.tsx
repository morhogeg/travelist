
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Settings, MapPin, CheckCircle2, Folder, Globe, TrendingUp, BookOpen } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { getUserPlaces, getRecommendations } from "@/utils/recommendation-parser";
import { getCollections } from "@/utils/collections/collectionStore";

const Profile = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalRecommendations: 0,
    visitedCount: 0,
    totalCollections: 0,
    countriesVisited: 0,
    citiesVisited: 0,
  });

  useEffect(() => {
    // Calculate real statistics
    const places = getUserPlaces();
    const recommendations = getRecommendations();
    const collections = getCollections();

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
      countriesVisited: uniqueCountries.size,
      citiesVisited: uniqueCities.size,
    });
  }, []);

  const completionRate = useMemo(() => {
    if (stats.totalRecommendations === 0) return 0;
    return Math.round((stats.visitedCount / stats.totalRecommendations) * 100);
  }, [stats]);

  const StatCard = ({ icon: Icon, label, value, subtitle, onClick }: any) => (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`liquid-glass-clear rounded-2xl p-3.5 shadow-md hover:shadow-lg ios26-transition-smooth ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold leading-none mb-1">{value}</p>
          <p className="text-sm font-medium text-foreground/80 truncate">{label}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 pt-2 pb-24"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 mb-2 text-white text-xl font-bold shadow-lg">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Travelist
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="space-y-3 mb-5">
          <StatCard
            icon={MapPin}
            label="Total Recommendations"
            value={stats.totalRecommendations}
            subtitle="Places to explore"
          />

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Globe}
              label="Countries"
              value={stats.countriesVisited}
            />
            <StatCard
              icon={MapPin}
              label="Cities"
              value={stats.citiesVisited}
            />
          </div>

          <StatCard
            icon={Folder}
            label="Collections"
            value={stats.totalCollections}
            subtitle="Organized groups"
            onClick={() => navigate('/collections')}
          />

          {completionRate > 0 && (
            <div className="liquid-glass-clear rounded-2xl p-3.5 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Travel Progress</p>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You've visited {stats.visitedCount} out of {stats.totalRecommendations} recommendations
              </p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/settings')}
            className="w-full liquid-glass-clear rounded-2xl p-3.5 shadow-md hover:shadow-lg ios26-transition-smooth flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-base">Settings</p>
              <p className="text-xs text-muted-foreground">Customize your experience</p>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              localStorage.removeItem('onboarding_completed');
              window.dispatchEvent(new CustomEvent('resetOnboarding'));
            }}
            className="w-full liquid-glass-clear rounded-2xl p-3.5 shadow-md hover:shadow-lg ios26-transition-smooth flex items-center gap-3"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-base">View Welcome Tour</p>
              <p className="text-xs text-muted-foreground">See the app introduction again</p>
            </div>
          </motion.button>
        </div>

        {/* App Version */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with ❤️ for travelers
          </p>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
