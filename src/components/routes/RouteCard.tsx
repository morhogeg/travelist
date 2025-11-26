import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import { RouteWithProgress } from "@/types/route";
import { format } from "date-fns";

interface RouteCardProps {
  route: RouteWithProgress;
  onClick: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onClick }) => {
  const formatDateRange = () => {
    if (!route.startDate && !route.endDate) return null;

    if (route.startDate && route.endDate) {
      const start = format(new Date(route.startDate), "MMM d");
      const end = format(new Date(route.endDate), "MMM d, yyyy");
      return `${start} - ${end}`;
    }

    if (route.startDate) {
      return format(new Date(route.startDate), "MMM d, yyyy");
    }

    return null;
  };

  const dateString = formatDateRange();
  const hasProgress = route.totalPlaces > 0;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 ios26-transition-smooth cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-semibold text-base truncate mb-1">
            {route.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{route.city}, {route.country}</span>
          </div>
        </div>

        {/* Days Badge */}
        {route.days.length > 1 && (
          <div className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/10 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {route.days.length}d
            </span>
          </div>
        )}
      </div>

      {/* Date */}
      {dateString && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{dateString}</span>
        </div>
      )}

      {/* Progress Bar */}
      {hasProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-foreground/70 font-medium">
                {route.visitedPlaces} of {route.totalPlaces} visited
              </span>
            </div>
            <span className="font-semibold text-primary">
              {route.progressPercentage}%
            </span>
          </div>

          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${route.progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-1.5 rounded-full bg-gradient-to-r from-primary to-purple-500"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasProgress && (
        <div className="text-xs text-muted-foreground italic">
          No places added yet
        </div>
      )}
    </motion.div>
  );
};

export default RouteCard;
