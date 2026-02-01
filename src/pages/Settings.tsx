import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { lightHaptic } from "@/utils/ios/haptics";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import ShareExtensionGuide from "@/components/settings/ShareExtensionGuide";
import ProximitySettings from "@/components/settings/ProximitySettings";
import AISettings from "@/components/settings/AISettings";
import AuthSettings from "@/components/settings/AuthSettings";
import DeleteAccountSettings from "@/components/settings/DeleteAccountSettings";
import SettingsRow from "@/components/settings/SettingsRow";
import { useNavigate } from "react-router-dom";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Compute cities list for proximity settings
  const allCities = useMemo(() => {
    const recommendations = getRecommendations();
    const cityMap = new Map<string, { cityId: string; cityName: string; placeCount: number }>();

    recommendations.forEach(rec => {
      const cityId = rec.cityId || rec.id;
      const cityName = rec.city;

      if (!cityMap.has(cityId)) {
        cityMap.set(cityId, { cityId, cityName, placeCount: 0 });
      }

      const city = cityMap.get(cityId)!;
      city.placeCount += rec.places?.length || 0;
    });

    return Array.from(cityMap.values()).sort((a, b) =>
      a.cityName.localeCompare(b.cityName)
    );
  }, []);

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
  };

  // Load current auth session for conditional rendering
  useEffect(() => {
    if (!supabase) return;

    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const Separator = () => <div className="h-px bg-border/30 ml-8" />;

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Settings List */}
        <div className="px-3">
          {/* Theme Toggle */}
          <SettingsRow
            icon={theme === "light" ? Sun : Moon}
            title="Theme"
            subtitle={theme === "light" ? "Light mode" : "Dark mode"}
            action={
              <Switch
                checked={theme === "dark"}
                onCheckedChange={handleToggleTheme}
              />
            }
          />

          <Separator />

          {/* Proximity Alerts */}
          <ProximitySettings allCities={allCities} />

          <Separator />

          <Separator />

          {/* AI Settings Section */}
          <div className="py-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-1 mb-4">
              Intelligence & Privacy
            </h2>
            <AISettings />
          </div>

          {/* Supabase Auth */}
          <AuthSettings />

          {/* Delete Account Section - Only show when signed in */}
          {userEmail && (
            <>
              <div className="h-px bg-border/30 ml-8 mt-2" />
              <DeleteAccountSettings />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist AI v1.0.0
          </p>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
