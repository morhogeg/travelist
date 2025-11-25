import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStatusBarTheme } from "@/hooks/native/useStatusBar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { OnboardingFlow, isOnboardingComplete } from "@/components/onboarding";

// Pages
import Index from "./pages/Index";
import Saved from "./pages/Settings";
import Settings from "./pages/Settings";
import PlaceDetail from "./pages/place-detail/PlaceDetail";
import CountryView from "./pages/CountryView";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import CollectionsTab from "@/components/collections/CollectionsTab"; // ✅ new
import CollectionDetailPage from "@/pages/collections/CollectionDetailPage";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";

// Declare global window interface
declare global {
  interface Window {
    showRecDrawer?: (cityName?: string, countryName?: string) => void;
  }
}

// Inner component that uses theme
function AppContent() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete());

  // Automatically manage status bar based on theme
  useStatusBarTheme(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

  useEffect(() => {
    window.showRecDrawer = (cityName?: string, countryName?: string) => {
      setSelectedCity(cityName);
      setSelectedCountry(countryName);
      setIsDrawerOpen(true);
    };

    return () => {
      delete window.showRecDrawer;
    };
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show onboarding for first-time users
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-background font-sans antialiased">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/place/:id" element={<PlaceDetail />} />
          <Route path="/country/:countryName" element={<CountryView />} />
          <Route path="/collections" element={<CollectionsTab />} /> {/* ✅ New route */}
          <Route path="/collections/:id" element={<CollectionDetailPage />} /> {/* ✅ New route */}
          <Route path="/routes" element={<RoutesPage />} /> {/* ✅ Routes feature */}
          <Route path="/routes/:id" element={<RouteDetail />} /> {/* ✅ Route detail */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={selectedCity}
        initialCountry={selectedCountry}
      />

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;