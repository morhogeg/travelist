
import React from "react";
import { Button } from "@/components/ui/button";

interface EmptySavedStateProps {
  openRecDrawer?: () => void;
}

const EmptySavedState: React.FC<EmptySavedStateProps> = ({ openRecDrawer }) => {
  const handleButtonClick = () => {
    if (typeof window.showRecDrawer === 'function') {
      window.showRecDrawer();
    } else if (openRecDrawer) {
      openRecDrawer();
    }
  };
  
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold mb-2">You haven't saved any places yet</h3>
      <p className="text-muted-foreground mb-6">Start by adding recommendations for places you'd like to visit.</p>
      <Button onClick={handleButtonClick}>Add Recommendations</Button>
    </div>
  );
};

export default EmptySavedState;
