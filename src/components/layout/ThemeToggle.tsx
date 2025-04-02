
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../ThemeProvider";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="fixed top-4 right-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80 z-50"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
