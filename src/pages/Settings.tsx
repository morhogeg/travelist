
import React from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/ui/PageHeader";
import { Settings as SettingsIcon, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { lightHaptic } from "@/utils/ios/haptics";
import { motion } from "framer-motion";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
  };

  return (
    <Layout>
      <PageHeader
        title="Settings"
        subtitle="Customize your app preferences"
        icon={<SettingsIcon className="h-8 w-8" />}
      />
      <div className="px-6 py-6">
        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Appearance
            </h3>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={handleToggleTheme}
              className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/50 cursor-pointer hover:bg-white/70 dark:hover:bg-neutral-900/70 ios26-transition-smooth"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  {theme === "light" ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === "light" ? "Light mode" : "Dark mode"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground capitalize">{theme}</span>
                <motion.div
                  animate={{ rotate: theme === "dark" ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Future Settings Placeholder */}
          <div className="glass-card dark:glass-card-dark p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">More settings coming soon</h3>
            <p className="text-muted-foreground text-sm">
              Additional options are currently under development.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
