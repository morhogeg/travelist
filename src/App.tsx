import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";

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

// Declare global window interface
declare global {
  interface Window {
    showRecDrawer?: (cityName?: string, countryName?: string) => void;
  }
}

function App() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);

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

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;