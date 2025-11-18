import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { StructuredInputForm } from "./forms/StructuredInputForm";
import { FreeTextForm } from "./forms/FreeTextForm";
import { useToast } from "@/hooks/use-toast";
import { RecommendationDrawerProps } from "./types";
import { useRecommendationSubmit } from "@/hooks/useRecommendationSubmit";
import {
  getCollections,
  addPlaceToCollection,
  findCollectionIdByPlaceId,
} from "@/utils/collections/collectionStore";

const RecommendationDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  initialCity = "",
  initialCountry = "",
  editRecommendation = null,
}: RecommendationDrawerProps) => {
  const [mode, setMode] = useState<"structured" | "freetext">("structured");
  const [localEditRecommendation, setLocalEditRecommendation] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");

  const { toast } = useToast();
  const {
    isLoading,
    submitStructuredRecommendation,
    submitFreeTextRecommendation,
  } = useRecommendationSubmit();

  // Always reset or set localEditRecommendation when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      // Reload collections every time drawer opens to get latest
      const loaded = getCollections();
      setCollections(loaded);

      if (editRecommendation) {
        // EDIT mode
        setLocalEditRecommendation(editRecommendation);
        const collectionId = findCollectionIdByPlaceId(editRecommendation.id || editRecommendation.recId);
        setSelectedCollectionId(collectionId || "");
        setMode("structured");
      } else {
        // ADD mode — clean state!
        setLocalEditRecommendation(null);
        setSelectedCollectionId("");
        setMode("structured");
      }
    } else {
      setLocalEditRecommendation(null);
      setSelectedCollectionId("");
    }
  }, [isDrawerOpen, editRecommendation]);

  const handleSubmitStructured = async (values: any) => {
    const recId = localEditRecommendation?.recId || localEditRecommendation?.id;
    const savedId = await submitStructuredRecommendation(values, recId);

    if (savedId) {
      if (selectedCollectionId) {
        addPlaceToCollection(selectedCollectionId, savedId);
        console.log("[Collection Debug] Adding", savedId, "to", selectedCollectionId);
      }

      toast({
        title: localEditRecommendation ? "Recommendation updated!" : "Recommendation added!",
        description: `Your recommendation has been successfully ${
          localEditRecommendation ? "updated" : "added"
        }.`,
      });

      setIsDrawerOpen(false);
    }
  };

  const handleSubmitFreeText = async (values: { city: string; recommendations: string }) => {
    const savedId = await submitFreeTextRecommendation(values);

    if (savedId) {
      if (selectedCollectionId) {
        addPlaceToCollection(selectedCollectionId, savedId);
        console.log("[Collection Debug] Adding", savedId, "to", selectedCollectionId);
      }

      toast({
        title: "Recommendation added!",
        description: "Your recommendation has been successfully added.",
      });

      setIsDrawerOpen(false);
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border">
        <DrawerHeader>
          <DrawerTitle>
            {localEditRecommendation ? "Edit Recommendation" : "Add a Recommendation"}
          </DrawerTitle>
          {localEditRecommendation && (
            <DrawerDescription>
              Update the details of your recommendation.
            </DrawerDescription>
          )}
        </DrawerHeader>

        <div className="px-6 space-y-4">
          {!localEditRecommendation && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setMode("structured")}
                className={`w-1/2 ${mode === "structured" ? "text-white border-transparent" : ""}`}
                style={mode === "structured" ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                } : undefined}
              >
                Structured Input
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode("freetext")}
                className={`w-1/2 ${mode === "freetext" ? "text-white border-transparent" : ""}`}
                style={mode === "freetext" ? {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                } : undefined}
              >
                Free Text Input
              </Button>
            </div>
          )}

          {collections.length > 0 && (
            <div
              className="touch-none"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              <label className="block mb-1 text-sm text-muted-foreground">
                Add to collection (optional):
              </label>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="">-- None --</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "structured" ? (
            <StructuredInputForm
              onSubmit={handleSubmitStructured}
              initialCity={localEditRecommendation?.location || initialCity}
              initialCountry={localEditRecommendation?.country || initialCountry}
              isAnalyzing={isLoading}
              editRecommendation={localEditRecommendation}
            />
          ) : (
            <FreeTextForm onSubmit={handleSubmitFreeText} isAnalyzing={isLoading} />
          )}
        </div>

        <DrawerFooter className="border-t border-border">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RecommendationDrawer;