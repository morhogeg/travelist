import React from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: "grid" | "list";
  onToggleViewMode: () => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onToggleViewMode }) => {
  return (
    <div className="absolute right-6 top-[13rem] sm:right-8 z-10">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggleViewMode}
        className="flex items-center gap-2"
      >
        {viewMode === "grid" ? (
          <>
            <List className="h-4 w-4" />
            <span>List View</span>
          </>
        ) : (
          <>
            <LayoutGrid className="h-4 w-4" />
            <span>Gallery View</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ViewModeToggle;