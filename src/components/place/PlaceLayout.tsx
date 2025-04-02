import React from "react";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceLayoutProps {
  name: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  onBack?: () => void;
  viewMode?: "grid" | "list";
  toggleViewMode?: () => void;
}

const PlaceLayout: React.FC<PlaceLayoutProps> = ({
  name,
  subtitle,
  actions,
  children,
  onBack,
  viewMode,
  toggleViewMode
}) => {
  return (
    <div className="relative min-h-screen">
      {/* Back Button */}
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

      {/* Title Section */}
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

        {/* View Mode Toggle */}
        {toggleViewMode && (
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
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
        )}
      </div>

      {/* Actions */}
      {actions && <div className="px-6 sm:px-8 pt-4">{actions}</div>}

      {/* Content */}
      <div className="px-6 sm:px-8 pt-2 pb-10">{children}</div>
    </div>
  );
};

export default PlaceLayout;
