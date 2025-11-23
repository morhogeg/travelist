
import React from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Globe, MapPin, Navigation, Trash2, Edit } from "lucide-react";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { Badge } from "@/components/ui/badge";
import { RecommendationDetail } from "@/components/recommendations/RecommendationDetail";
import { useNavigate } from "react-router-dom";
import { getCategoryIcon, getCategoryColor } from "@/components/recommendations/utils/category-data";

interface RecommendationDetailsDialogProps {
  recommendation: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisited: () => void;
}

const RecommendationDetailsDialog: React.FC<RecommendationDetailsDialogProps> = ({
  recommendation,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleVisited,
}) => {
  if (!recommendation) return null;

  const mapUrl = generateMapLink(recommendation.name, recommendation.location);
  const websiteUrl = recommendation.website ? formatUrl(recommendation.website) : null;
  const categoryColor = getCategoryColor(recommendation.category || 'general');
  const categoryIcon = getCategoryIcon(recommendation.category || 'general');

  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const navigate = useNavigate();

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent
        className="max-h-[85vh] p-0 flex flex-col"
        style={{
          borderLeft: `4px solid ${categoryColor}`,
          boxShadow: 'none'
        }}
      >
        {/* Compact Header */}
        <div className="relative flex-shrink-0 px-6 pt-2 pb-5 bg-background border-b">
          <div className="flex items-start gap-4">
            {/* Category Icon - Larger */}
            <div
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl"
              style={{ color: categoryColor }}
            >
              {categoryIcon}
            </div>

            {/* Title and Location */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold leading-tight mb-2">{recommendation.name}</h2>

              {/* Location Info Inline */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap mb-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{recommendation.location}</span>
                </div>

                {recommendation.country && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    <span>{recommendation.country}</span>
                  </div>
                )}
              </div>

              {/* Added on Date - Moved to Header */}
              {recommendation.dateAdded && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    Added {new Date(recommendation.dateAdded).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Attribution and Context Details */}
            <RecommendationDetail
              source={recommendation.source}
              context={recommendation.context}
              onClose={onClose}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                size="default"
                className="flex-1 min-w-[140px] ios26-transition-smooth text-white"
                onClick={(e) => handleExternalClick(e, mapUrl)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                <span>Navigate</span>
              </Button>

              <Button
                variant={recommendation.visited ? "default" : "outline"}
                size="default"
                className={`flex-1 min-w-[140px] ios26-transition-smooth ${
                  recommendation.visited
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-gray-300'
                }`}
                onClick={onToggleVisited}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <span>{recommendation.visited ? 'Visited' : 'Mark Visited'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div
          className="flex-shrink-0 p-4 border-t liquid-glass-clear flex items-center gap-3"
          style={{ boxShadow: 'none' }}
        >
          <Button
            variant="destructive"
            size="default"
            className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            className="flex-1 flex items-center justify-center gap-2 ios26-transition-smooth"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RecommendationDetailsDialog;
