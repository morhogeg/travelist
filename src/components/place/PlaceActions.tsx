// FILE: src/components/place/PlaceActions.tsx

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceActionsProps {
  placeName: string;
  onAddClick?: () => void;
}

const PlaceActions: React.FC<PlaceActionsProps> = ({ onAddClick }) => {
  if (!onAddClick) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-[100]">
      <Button
        size="icon"
        variant="default"
        aria-label="Add recommendation"
        onClick={onAddClick}
        className="rounded-full w-12 h-12 shadow-lg hover:bg-primary/80 transform hover:scale-105 transition-all dark:bg-primary dark:hover:bg-primary/90 dark:text-white"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PlaceActions;