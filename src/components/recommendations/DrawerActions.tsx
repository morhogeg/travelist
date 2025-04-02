
import React from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { DrawerActionsProps } from "./types";

const DrawerActions: React.FC<DrawerActionsProps> = ({ isAnalyzing, onClose }) => {
  return (
    <DrawerClose asChild>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onClose}
        disabled={isAnalyzing}
      >
        Cancel
      </Button>
    </DrawerClose>
  );
};

export default DrawerActions;
