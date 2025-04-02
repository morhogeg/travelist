import React from "react";
import { CheckCircle2, MoreHorizontal, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ListViewProps } from "./types";
import { markRecommendationVisited } from "@/utils/recommendation-parser";

const ListView: React.FC<ListViewProps & { onRefresh?: () => void }> = ({
  items,
  onDeleteRecommendation,
  onEditClick,
  onRefresh
}) => {
  const { toast } = useToast();

  const toggle = (recId: string, name: string, visited: boolean) => {
    markRecommendationVisited(recId, name, !visited);
    onRefresh?.();
    toast({
      title: `Marked as ${visited ? "not visited" : "visited"}`,
      description: `"${name}" has been marked as ${visited ? "not visited" : "visited"}.`,
      action: (
        <ToastAction altText="Undo" onClick={() => {
          markRecommendationVisited(recId, name, visited);
          onRefresh?.();
        }}>Undo</ToastAction>
      )
    });
  };

  return (
    <div className="space-y-3">
      {items.map(item => {
        const isVisited = !!item.visited;

        return (
          <Card
            key={item.recId}
            className={`transition-all ${isVisited ? "ring-4 ring-green-500 border-green-400 border" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.name}</h3>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    {isVisited && (
                      <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Visited
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.country && (
                    <div className="mt-2 text-sm text-muted-foreground">Country: {item.country}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ', ' + (item.city || item.country))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    title="Open in Google Maps"
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => toggle(item.recId, item.name, isVisited)}
                    className={`p-2 rounded-full border transition-colors ${isVisited
                      ? "bg-green-500 border-green-600 text-white"
                      : "border-gray-300 dark:border-gray-600 hover:bg-muted"}`}
                    title={isVisited ? "Mark as not visited" : "Mark as visited"}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-muted transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClick?.(item)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggle(item.recId, item.name, isVisited)}>
                        Mark as {isVisited ? "not visited" : "visited"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteRecommendation(item.recId, item.name)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ListView;
