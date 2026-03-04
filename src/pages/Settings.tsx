import React, { useEffect, useState, useMemo } from "react";
import Layout from "@/components/layout/Layout";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { lightHaptic } from "@/utils/ios/haptics";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ProximitySettings from "@/components/settings/ProximitySettings";
import NavigationSettings from "@/components/settings/NavigationSettings";
import AISettings from "@/components/settings/AISettings";
import AuthSettings from "@/components/settings/AuthSettings";
import DeleteAccountSettings from "@/components/settings/DeleteAccountSettings";
import SettingsRow from "@/components/settings/SettingsRow";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 px-1 mb-2">
    {children}
  </p>
);

const RowDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent ml-8" />
);

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

    return Array.from(cityMap.values()).sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, []);

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
  };

  useEffect(() => {
    if (!auth) return;
    setUserEmail(auth.currentUser?.email ?? null);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 pt-3 pb-24 space-y-6"
      >
        {/* Header */}
        <h1 className="text-[28px] font-bold tracking-tight bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent dark:from-white dark:to-white/80">
          Settings
        </h1>

        {/* Appearance */}
        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div className="rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08] px-3">
            <SettingsRow
              icon={theme === "light" ? Sun : Moon}
              iconColor={theme === "light" ? "#FF9500" : "#5856D6"}
              title="Theme"
              subtitle={theme === "light" ? "Light mode" : "Dark mode"}
              action={
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleToggleTheme}
                />
              }
            />
          </div>
        </div>

        {/* Location & Alerts */}
        <div>
          <SectionLabel>Location & Alerts</SectionLabel>
          <div className="rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08] px-3">
            <ProximitySettings allCities={allCities} />
          </div>
        </div>

        {/* Navigation */}
        <div>
          <SectionLabel>Navigation</SectionLabel>
          <div className="rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08] px-3">
            <NavigationSettings />
          </div>
        </div>

        {/* Intelligence & Privacy */}
        <div>
          <SectionLabel>Intelligence & Privacy</SectionLabel>
          <div className="rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08] px-3">
            <AISettings />
          </div>
        </div>

        {/* Account */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <div className="rounded-2xl overflow-hidden bg-neutral-100/80 dark:bg-transparent dark:ring-1 dark:ring-white/[0.08] px-3">
            <AuthSettings />
            {userEmail && (
              <>
                <RowDivider />
                <DeleteAccountSettings />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/40 pb-2">
          Travelist AI v1.0.0
        </p>
      </motion.div>
    </Layout>
  );
};

export default Settings;
