import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between px-6 sm:px-8 py-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="rounded-full"
            aria-label="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;