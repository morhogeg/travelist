
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Globe, MapPin, Navigation, Trash2 } from "lucide-react";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { Badge } from "@/components/ui/badge";
import { RecommendationDetail } from "@/components/recommendations/RecommendationDetail";
import { useNavigate } from "react-router-dom";

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

  const handleExternalClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        {/* Hero Image Section */}
        <div className="relative h-64 flex-shrink-0 overflow-hidden">
          <img
            src={recommendation.image || getCategoryPlaceholder(recommendation.category)}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent"></div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="liquid-glass-clear text-white border-white/20 font-medium px-3 py-1.5">
              {recommendation.category}
            </Badge>
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-white text-2xl font-bold">{recommendation.name}</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Location Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{recommendation.location}</span>
              </div>

              {recommendation.country && (
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  <span>{recommendation.country}</span>
                </div>
              )}
            </div>

            {/* Date Added */}
            {recommendation.dateAdded && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  Added on {new Date(recommendation.dateAdded).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}

            {/* Attribution and Context Details */}
            <RecommendationDetail
              source={recommendation.source}
              context={recommendation.context}
              onClose={onClose}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
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
        <div className="flex-shrink-0 p-4 border-t liquid-glass-clear flex justify-between items-center gap-3">
          <Button
            variant="destructive"
            size="default"
            className="flex items-center gap-2 ios26-transition-smooth"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationDetailsDialog;
