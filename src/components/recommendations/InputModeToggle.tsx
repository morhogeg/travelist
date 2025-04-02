
import React from "react";
import { Switch } from "@/components/ui/switch";
import { InputModeToggleProps } from "./types";

const InputModeToggle: React.FC<InputModeToggleProps> = ({ 
  isStructuredInput, 
  toggleInputMode 
}) => {
  return (
    <div className="mx-4 mb-6 flex items-center justify-between bg-secondary/80 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span 
          className={`text-sm font-medium cursor-pointer ${!isStructuredInput ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => toggleInputMode()}
        >
          Free text
        </span>
        <Switch 
          checked={isStructuredInput}
          onCheckedChange={toggleInputMode}
        />
        <span 
          className={`text-sm font-medium cursor-pointer ${isStructuredInput ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => toggleInputMode()}
        >
          Structured
        </span>
      </div>
    </div>
  );
};

export default InputModeToggle;
