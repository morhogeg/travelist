
import React from "react";
import Layout from "@/components/layout/Layout";
import { Settings as SettingsIcon, Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { lightHaptic } from "@/utils/ios/haptics";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    lightHaptic();
    toggleTheme();
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-6 py-8 pb-24"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4 shadow-md">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] mb-1">
            Settings
          </h1>
          <p className="text-muted-foreground text-sm">Customize your experience</p>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Appearance Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Appearance
            </h3>
            <div className="space-y-3">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="liquid-glass-clear rounded-2xl p-4 shadow-md hover:shadow-lg ios26-transition-smooth"
              >
                <div className="flex items-center justify-between min-h-[44px]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      {theme === "light" ? (
                        <Sun className="h-6 w-6 text-primary" />
                      ) : (
                        <Moon className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base leading-tight">Theme</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {theme === "light" ? "Light mode" : "Dark mode"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={handleToggleTheme}
                    className="ml-3"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              What's Next
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="liquid-glass-clear rounded-2xl p-6 shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 mb-4">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">More features coming soon</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                We're working on additional settings and customization options to enhance your travel experience.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist v1.0.0
          </p>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
