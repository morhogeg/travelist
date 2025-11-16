import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, CheckCircle2, ExternalLink, MapPin, Navigation } from "lucide-react";
import { deleteRecommendation, markRecommendationVisited } from "@/utils/recommendation-parser";
import { useToast } from "@/hooks/use-toast";
import RecommendationActions from "./RecommendationActions";
import { getCityImage } from "@/utils/image/getSmartImage"; // ✅ Corrected path
import { generateMapLink } from "@/utils/link-helpers";
import { formatWebsiteUrl } from "@/utils/countries";
import { ToastAction } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  id: string;
  placeName: string;
  category: string;
  name: string;
  description?: string;
  image?: string;
  website?: string;
  address?: string;
  visited?: boolean;
  dateAdded?: string;
}

interface CategoryRecommendationsListProps {
  recommendations: Recommendation[];
  category: string;
}

const CategoryRecommendationsList: React.FC<CategoryRecommendationsListProps> = ({ 
  recommendations, 
  category 
}) => {
  const { toast } = useToast();
  const [lastDeletedRec, setLastDeletedRec] = React.useState<Recommendation | null>(null);

  const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const undoDelete = () => {
    if (!lastDeletedRec) return;
    try {
      const allRecommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');
      for (const rec of allRecommendations) {
        if (rec.city === lastDeletedRec.placeName) {
          rec.places.push({
            id: lastDeletedRec.id,
            name: lastDeletedRec.name,
            category: lastDeletedRec.category,
            description: lastDeletedRec.description || "",
            image: lastDeletedRec.image,
            website: lastDeletedRec.website,
            visited: lastDeletedRec.visited
          });
          break;
        }
      }
      localStorage.setItem('recommendations', JSON.stringify(allRecommendations));
      toast({ title: "Recommendation restored", description: `"${lastDeletedRec.name}" has been restored.` });
      setLastDeletedRec(null);
      window.dispatchEvent(new CustomEvent('recommendationAdded'));
    } catch (error) {
      console.error("Error restoring recommendation:", error);
      toast({ title: "Error", description: "Could not restore the recommendation.", variant: "destructive" });
    }
  };

  const handleDelete = (rec: Recommendation) => {
    if (!rec.id || !rec.name) return;
    setLastDeletedRec(rec);
    deleteRecommendation(rec.id);
    toast({
      title: "Recommendation deleted",
      description: `"${rec.name}" has been removed from your recommendations.`,
      action: <ToastAction altText="Undo" onClick={undoDelete}>Undo</ToastAction>
    });
    window.dispatchEvent(new CustomEvent('recommendationDeleted'));
  };

  const handleToggleVisited = (rec: Recommendation) => {
    if (!rec.id || !rec.name) return;
    markRecommendationVisited(rec.id, rec.name, !rec.visited);
    window.dispatchEvent(new CustomEvent('recommendationVisited'));
    toast({
      title: rec.visited ? "Marked as unvisited" : "Marked as visited",
      description: `"${rec.name}" has been marked as ${rec.visited ? 'unvisited' : 'visited'}.`,
    });
  };

  if (recommendations.length === 0) {
    const displayCategory = category === "All" ? "recommendations" : `${toTitleCase(category)} recommendations`;
    return <div className="text-center py-4">No {displayCategory} found.</div>;
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => {
        const imageUrl = rec.image || getCityImage(rec.placeName);
        const mapUrl = generateMapLink(rec.name, rec.placeName);
        const websiteUrl = rec.website ? formatWebsiteUrl(rec.website) : null;

        return (
          <Card key={rec.id} className={`overflow-hidden transition-all ${rec.visited ? 'bg-muted/30 ring-1 ring-green-500/50 dark:ring-green-400/30' : ''}`}>
            <div className="flex flex-col sm:flex-row">
              {imageUrl && (
                <div className="sm:w-32 h-24 sm:h-auto relative">
                  <img
                    src={imageUrl}
                    alt={rec.name}
                    className={`w-full h-full object-cover ${rec.visited ? 'opacity-80' : ''}`}
                  />
                  {rec.visited && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-success/20 backdrop-blur-sm border-success/30 text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Visited
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="flex-1 py-4 px-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${rec.visited ? 'text-muted-foreground' : ''}`}>
                      {rec.name}
                      {rec.visited && <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-600" />}
                    </h3>

                    {rec.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {rec.description}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{rec.placeName}</span>
                    </div>

                    {rec.dateAdded && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(rec.dateAdded).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex mt-3 space-x-2">
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                        title="Navigate to this place"
                      >
                        <Navigation className="h-4 w-4" />
                      </a>

                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                          title="Visit website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <RecommendationActions
                    recommendation={rec}
                    onDelete={() => handleDelete(rec)}
                    onToggleVisited={() => handleToggleVisited(rec)}
                  />
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryRecommendationsList;