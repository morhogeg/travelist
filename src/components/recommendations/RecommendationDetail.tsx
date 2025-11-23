import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RecommendationSource,
  RecommendationContext,
} from "@/utils/recommendation/types";
import {
  UserCircle,
  ExternalLink,
  Calendar,
  Lightbulb,
  DollarSign,
  Clock,
  StickyNote,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecommendationDetailProps {
  source?: RecommendationSource;
  context?: RecommendationContext;
  onClose?: () => void;
  currentPath?: string;
}

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "medium":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "low":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    default:
      return "";
  }
};

const getPriorityEmoji = (priority?: string) => {
  switch (priority) {
    case "high":
      return "🔥";
    case "medium":
      return "⭐";
    case "low":
      return "💭";
    default:
      return "";
  }
};

const getPriorityLabel = (priority?: string) => {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "";
  }
};

export const RecommendationDetail: React.FC<RecommendationDetailProps> = ({
  source,
  context,
  onClose,
  currentPath,
}) => {
  const navigate = useNavigate();

  // Return null if no source or context data
  if (!source && !context) {
    return null;
  }

  const hasSource =
    source?.name || source?.type || source?.url || source?.date;
  const hasContext =
    context?.specificTip ||
    context?.occasionTags?.length ||
    context?.bestTime ||
    context?.priceRange ||
    context?.visitPriority ||
    context?.personalNote;

  if (!hasSource && !hasContext) {
    return null;
  }

  const handleSourceClick = (sourceName: string) => {
    // Check if we're on a route detail page
    if (currentPath && currentPath.startsWith('/routes/')) {
      // Navigate to home with filter state and return path
      navigate('/', {
        state: {
          filterSource: sourceName,
          returnTo: currentPath
        }
      });
      onClose?.();
    } else {
      // Apply filter for this friend (current behavior)
      window.dispatchEvent(new CustomEvent('sourceFilterChanged', { detail: sourceName }));
      onClose?.();
    }
  };

  const handleTypeClick = (sourceType: string) => {
    // Apply filter for this source type
    window.dispatchEvent(new CustomEvent('sourceTypeFilterChanged', { detail: sourceType }));
    // Close the dialog
    onClose?.();
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Source Section */}
      {hasSource && (
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <UserCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">
                    Recommended by{' '}
                    <button
                      onClick={() => source.name && handleSourceClick(source.name)}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold cursor-pointer transition-colors"
                    >
                      {source.name || "someone"}
                    </button>
                  </span>
                  {source.type && (
                    <Badge
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                      onClick={() => handleTypeClick(source.type!)}
                    >
                      {source.type.charAt(0).toUpperCase() + source.type.slice(1)}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {source.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(source.date).toLocaleDateString()}
                    </div>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View original
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Context Section */}
      {hasContext && (
        <div className="space-y-3">
          {/* Specific Tip - Highlighted */}
          {context?.specificTip && (
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {context.specificTip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Occasion Tags */}
          {context?.occasionTags && context.occasionTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {context.occasionTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-purple-50/50 dark:bg-purple-950/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Quick Info Row - Price, Time, Priority */}
          {(context?.priceRange ||
            context?.bestTime ||
            context?.visitPriority) && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  {context.priceRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{context.priceRange}</span>
                    </div>
                  )}

                  {context.bestTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{context.bestTime}</span>
                    </div>
                  )}

                  {context.visitPriority && (
                    <Badge
                      variant="outline"
                      className={getPriorityColor(context.visitPriority)}
                    >
                      {getPriorityEmoji(context.visitPriority)}{" "}
                      {getPriorityLabel(context.visitPriority)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Note */}
          {context?.personalNote && (
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {context.personalNote}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
