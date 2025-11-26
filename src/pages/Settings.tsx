import React from "react";
import Layout from "@/components/layout/Layout";
import { Moon, Sun, Sparkles } from "lucide-react";
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
        className="px-4 pt-3 pb-24"
      >
        {/* Header - matching Collections/Routes style */}
        <div className="text-center mb-6">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Settings List - matching Profile ActionRow style */}
        <div className="px-3">
          {/* Theme Toggle Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-1 ios26-transition-smooth flex items-center gap-3"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            ) : (
              <Moon className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[15px]">Theme</p>
              <p className="text-xs text-muted-foreground">
                {theme === "light" ? "Light mode" : "Dark mode"}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={handleToggleTheme}
            />
          </motion.div>

          <div className="h-px bg-border/30 ml-8" />

          {/* Coming Soon Row */}
          <div className="w-full py-3 px-1 flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0" style={{ color: '#667eea' }} />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[15px]">More features coming soon</p>
              <p className="text-xs text-muted-foreground">
                Additional settings and customization options
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Travelist v1.0.0
          </p>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Settings;
