
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, Edit, ExternalLink, Globe, MapPin, Navigation, Trash2 } from "lucide-react";
import { getCategoryPlaceholder } from "@/utils/recommendation-helpers";
import { formatUrl, generateMapLink } from "@/utils/link-helpers";
import { Badge } from "@/components/ui/badge";
import { RecommendationDetail } from "@/components/recommendations/RecommendationDetail";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={recommendation.image || getCategoryPlaceholder(recommendation.category)}
            alt={recommendation.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="font-medium">
              {recommendation.category}
            </Badge>
          </div>
          
          {recommendation.visited && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-success/20 backdrop-blur-sm border-success/30 text-success font-medium">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Visited
              </Badge>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white text-xl font-semibold">{recommendation.name}</h2>
          </div>
        </div>

        <DialogHeader className="px-6 pt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" /> 
            <span>{recommendation.location}</span>
            
            {recommendation.country && (
              <span className="flex items-center ml-3">
                <Globe className="h-4 w-4 mr-1" />
                {recommendation.country}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 py-2">
          {recommendation.description && (
            <p className="mt-2 text-sm">{recommendation.description}</p>
          )}
          
          {recommendation.dateAdded && (
            <div className="flex items-center text-xs text-muted-foreground mt-4">
              <Calendar className="h-3.5 w-3.5 mr-1" />
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
          />

          <div className="flex flex-wrap gap-3 mt-5">
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-1"
              onClick={(e) => handleExternalClick(e, mapUrl)}
            >
              <Navigation className="h-4 w-4" />
              <span>Navigate</span>
            </Button>
            
            {websiteUrl && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => handleExternalClick(e, websiteUrl)}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Website</span>
              </Button>
            )}
            
            <Button 
              variant={recommendation.visited ? "destructive" : "outline"} 
              size="sm"
              className={`flex items-center gap-1 ${recommendation.visited ? 'bg-opacity-80' : ''}`}
              onClick={onToggleVisited}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{recommendation.visited ? 'Unmark Visited' : 'Mark Visited'}</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
            <Button 
              variant="destructive" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
            
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">Close</Button>
              </DialogClose>
              
              <Button 
                variant="default"
                size="sm"
                className="flex items-center gap-1"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationDetailsDialog;
