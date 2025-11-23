
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { deleteRecommendation, markRecommendationVisited } from "@/utils/recommendation-parser";
import { syncVisitedStateToRoutes } from "@/utils/route/route-manager";

interface LastAction {
  type: 'delete' | 'visited';
  recId: string;
  name: string;
  data: any;
}

export const useRecommendationActions = (onRecommendationsChange: () => void) => {
  const [lastAction, setLastAction] = useState<LastAction | null>(null);
  const { toast } = useToast();

  const undoDelete = () => {
    if (lastAction && lastAction.type === 'delete' && lastAction.data) {
      const recommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');
      
      // Loop through recommendations to find where to add this back
      for (const rec of recommendations) {
        if (rec.city === lastAction.data.city || rec.id === lastAction.data.cityId) {
          // Add the recommendation back
          rec.places.push(lastAction.data);
          localStorage.setItem('recommendations', JSON.stringify(recommendations));
          
          // Dispatch event to update UI
          window.dispatchEvent(new CustomEvent('recommendationAdded'));
          
          toast({
            title: "Recommendation restored",
            description: `"${lastAction.name}" has been restored.`,
          });
          
          // Reset last action
          setLastAction(null);
          return;
        }
      }
      
      // If we couldn't find a matching city, add it as a new recommendation
      toast({
        title: "Recommendation restored",
        description: `"${lastAction.name}" has been restored.`,
      });
      
      // Reset last action
      setLastAction(null);
    } else if (lastAction && lastAction.type === 'visited') {
      // Toggle back the visited state
      const revertedState = !lastAction.data;
      markRecommendationVisited(lastAction.recId, lastAction.name, revertedState);

      // Sync to all routes containing this place (two-way sync)
      syncVisitedStateToRoutes(lastAction.recId, revertedState);

      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('recommendationVisited'));

      toast({
        title: "Status reverted",
        description: `"${lastAction.name}" has been marked as ${lastAction.data ? 'not visited' : 'visited'}.`,
      });

      // Reset last action
      setLastAction(null);
    }
  };

  const handleDelete = (recId: string, itemName: string) => {
    if (!recId || !itemName) {
      console.error("Missing data for deletion:", { recId, itemName });
      return;
    }
    
    // Store the recommendation for potential undo
    const recommendations = JSON.parse(localStorage.getItem('recommendations') || '[]');
    let deletedRec = null;
    let cityInfo = null;
    
    // Find the recommendation to be deleted
    for (const rec of recommendations) {
      const placeIndex = rec.places.findIndex(place => 
        place.id === recId || place.recId === recId
      );
      
      if (placeIndex !== -1) {
        deletedRec = rec.places[placeIndex];
        cityInfo = { city: rec.city, id: rec.id };
        break;
      }
    }
    
    // If we found the recommendation, store it and delete it
    if (deletedRec) {
      setLastAction({
        type: 'delete',
        recId,
        name: itemName,
        data: {
          ...deletedRec,
          city: cityInfo.city,
          cityId: cityInfo.id
        }
      });
      
      // Delete the recommendation place
      deleteRecommendation(recId);
      
      // Show toast notification with undo action
      toast({
        title: "Recommendation deleted",
        description: `"${itemName}" has been removed from your recommendations.`,
        action: (
          <ToastAction altText="Undo" onClick={undoDelete}>
            Undo
          </ToastAction>
        )
      });
      
      // Reload the recommendations
      onRecommendationsChange();
    } else {
      // If we couldn't find the recommendation, show an error
      toast({
        title: "Error",
        description: `Couldn't find "${itemName}" to delete.`,
        variant: "destructive"
      });
    }
  };
  
  const handleVisitedToggle = (recId: string, itemName: string, currentVisited: boolean) => {
    if (!recId || !itemName) {
      console.error("Missing data for toggling visited state:", { recId, itemName });
      return;
    }

    // Store the current state for potential undo
    setLastAction({
      type: 'visited',
      recId,
      name: itemName,
      data: currentVisited
    });

    // Mark the recommendation as visited or unvisited
    const newVisitedState = !currentVisited;
    markRecommendationVisited(recId, itemName, newVisitedState);

    // Sync to all routes containing this place (two-way sync)
    syncVisitedStateToRoutes(recId, newVisitedState);

    // Dispatch event for other components to know about the change
    window.dispatchEvent(new CustomEvent('recommendationVisited'));

    // Show toast notification with undo action
    toast({
      title: currentVisited ? "Marked as unvisited" : "Marked as visited",
      description: `"${itemName}" has been marked as ${currentVisited ? 'unvisited' : 'visited'}.`,
      action: (
        <ToastAction altText="Undo" onClick={undoDelete}>
          Undo
        </ToastAction>
      )
    });

    // Reload the recommendations
    onRecommendationsChange();
  };

  return {
    handleDelete,
    handleVisitedToggle
  };
};
