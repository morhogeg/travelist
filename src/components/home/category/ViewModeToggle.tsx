import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onToggleViewMode: () => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onToggleViewMode }) => {
  return (
    <motion.button
      layout
      onClick={onToggleViewMode}
      className="min-h-11 min-w-11 rounded-full liquid-glass-clear hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 shrink-0 flex items-center justify-center ios26-transition-smooth"
      aria-label={viewMode === "grid" ? "Switch to list view" : "Switch to gallery view"}
    >
      {viewMode === "grid" ? (
        <List className="h-5 w-5" />
      ) : (
        <LayoutGrid className="h-5 w-5" />
      )}
    </motion.button>
  );
};

export default ViewModeToggle;