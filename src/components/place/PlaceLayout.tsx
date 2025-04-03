import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceLayoutProps {
  name: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
}

const PlaceLayout: React.FC<PlaceLayoutProps> = ({
  name,
  subtitle,
  actions,
  children,
  onBack,
}) => {
  return (
    <div className="relative min-h-screen">
      {onBack && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="absolute top-4 left-4 z-20 bg-background/80 hover:bg-background"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="px-6 sm:px-8 pt-16 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          <span className="text-muted-foreground mr-2">📍</span>
          {name}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {actions && <div className="px-6 sm:px-8 pt-4">{actions}</div>}
      <div className="px-6 sm:px-8 pt-2 pb-10">{children}</div>
    </div>
  );
};

export default PlaceLayout;