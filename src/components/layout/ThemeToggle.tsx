
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";
import { motion } from "framer-motion";
import { lightHaptic } from "@/utils/ios/haptics";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    lightHaptic();
    toggleTheme();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleToggle}
      className="fixed top-4 right-4 h-10 w-10 rounded-full liquid-glass-clear flex items-center justify-center hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 z-50 ios26-transition-smooth text-neutral-700 dark:text-neutral-300"
      style={{
        top: 'calc(1rem + env(safe-area-inset-top, 0px))'
      }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
