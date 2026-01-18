import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { useStatusBarTheme } from "@/hooks/native/useStatusBar";
import RecommendationDrawer from "@/components/recommendations/RecommendationDrawer";
import { OnboardingFlow, isOnboardingComplete } from "@/components/onboarding";
import { syncSupabaseRecommendationsOnce, getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { addInboxItem, parseInboxItem } from "@/utils/inbox/inbox-store";
import { useToast } from "@/hooks/use-toast";
import { importSharedInbox } from "@/utils/inbox/shared-import";
import RecommendationDetailsDialog from "@/components/home/RecommendationDetailsDialog";

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
import TravelStory from "./pages/TravelStory";
import TripDetailPage from "./pages/TripDetailPage";
import Inbox from "./pages/Inbox";

// Declare global window interface
declare global {
  interface Window {
    showRecDrawer?: (cityName?: string, countryName?: string) => void;
  }
}

// Inner component that uses theme
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingComplete());
  const { toast } = useToast();

  // Proximity notification - place card state
  const [proximityPlace, setProximityPlace] = useState<any>(null);
  const [showProximityCard, setShowProximityCard] = useState(false);

  // Automatically manage status bar based on theme
  useStatusBarTheme(theme === 'dark' ? 'dark' : 'light');

  // One-time sync with Supabase when signed in
  useEffect(() => {
    syncSupabaseRecommendationsOnce();
  }, []);

  // Listen for proximity notification taps
  useEffect(() => {
    const handleProximityTap = (event: CustomEvent<{ placeId?: string; recId?: string; placeName?: string; cityId?: string }>) => {
      const { recId, placeName, cityId } = event.detail;
      console.log('[App] Proximity notification tapped:', placeName, recId);

      // Find the place in recommendations
      const allRecs = getRecommendations();
      for (const rec of allRecs) {
        const place = rec.places?.find(p => p.recId === recId || p.id === recId);
        if (place) {
          setProximityPlace({
            ...place,
            city: rec.city,
            country: rec.country,
            cityId: rec.cityId || rec.id
          });
          setShowProximityCard(true);

          // Hide the FAB while card is open
          window.dispatchEvent(new CustomEvent('fab:hide'));

          // Navigate to home if not there
          if (location.pathname !== '/') {
            navigate('/');
          }
          return;
        }
      }

      console.warn('[App] Could not find place for proximity notification:', recId);
    };

    window.addEventListener('proximityPlaceTapped', handleProximityTap as EventListener);
    return () => {
      window.removeEventListener('proximityPlaceTapped', handleProximityTap as EventListener);
    };
  }, [navigate, location.pathname]);

  // Import from native share extension (App Group) on launch/foreground
  useEffect(() => {
    let isMounted = true;

    const importNow = async () => {
      await importSharedInbox();
    };

    importNow();

    const sub = CapacitorApp.addListener("appStateChange", (state) => {
      if (state.isActive) {
        importNow();
      }
    });

    return () => {
      isMounted = false;
      sub.then(h => h.remove());
    };
  }, [toast]);

  // Handle deep links like travelist://share?text=...
  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    const handleUrl = async (url: string) => {
      try {
        const incoming = new URL(url);
        // For custom schemes, host often carries the "path" (e.g., travelist://share?text=...)
        const path = incoming.pathname.replace(/^\//, '') || incoming.host;
        if (path !== 'share') return;

        const text = incoming.searchParams.get('text') || incoming.searchParams.get('sharedText');
        if (!text) return;

        const item = addInboxItem(text, incoming.host || 'deeplink');
        await parseInboxItem(item.id);
        navigate('/inbox');
        toast({
          title: "Shared text saved",
          description: "Added to Inbox and parsed",
        });
      } catch (err) {
        console.warn('[DeepLink] Failed to handle url', url, err);
      }
    };

    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      listener.then(h => h.remove());
    };
  }, [toast, navigate]);

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

  // Listen for reset onboarding event
  useEffect(() => {
    const handleResetOnboarding = () => {
      setShowOnboarding(true);
    };

    window.addEventListener('resetOnboarding', handleResetOnboarding);
    return () => {
      window.removeEventListener('resetOnboarding', handleResetOnboarding);
    };
  }, []);

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
          <Route path="/trip/:id" element={<TripDetailPage />} /> {/* ✅ AI Trip detail */}
          <Route path="/story" element={<TravelStory />} /> {/* ✅ Travel Story */}
          <Route path="/inbox" element={<Inbox />} /> {/* ✅ Shared inbox */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      <RecommendationDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        initialCity={selectedCity}
        initialCountry={selectedCountry}
      />

      {/* Proximity notification place card */}
      {proximityPlace && (
        <RecommendationDetailsDialog
          recommendation={proximityPlace}
          isOpen={showProximityCard}
          onClose={() => {
            setShowProximityCard(false);
            setProximityPlace(null);
            // Show the FAB again
            window.dispatchEvent(new CustomEvent('fab:show'));
          }}
          onToggleVisited={(recId, name, visited) => {
            // Dispatch event for the recommendation manager to handle
            window.dispatchEvent(new CustomEvent('togglePlaceVisited', {
              detail: { recId, name, visited }
            }));
          }}
          hideEditDelete={false}
        />
      )}

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
