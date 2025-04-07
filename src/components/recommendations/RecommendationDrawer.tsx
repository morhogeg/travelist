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

const RecommendationDrawer = ({ 
  isDrawerOpen, 
  setIsDrawerOpen, 
  initialCity = "", 
  initialCountry = "",
  editRecommendation = null
}: RecommendationDrawerProps) => {
  const [mode, setMode] = useState<"structured" | "freetext">("structured");
  const [localEditRecommendation, setLocalEditRecommendation] = useState<any>(null);

  const { toast } = useToast();
  const { 
    isLoading,
    submitStructuredRecommendation, 
    submitFreeTextRecommendation 
  } = useRecommendationSubmit();

  useEffect(() => {
    if (editRecommendation && isDrawerOpen) {
      setMode("structured");
      setLocalEditRecommendation(editRecommendation);
    } else if (!isDrawerOpen) {
      setLocalEditRecommendation(null);
    }
  }, [editRecommendation, isDrawerOpen]);

  const handleSubmitStructured = async (values: any) => {
    const recId = localEditRecommendation?.recId || localEditRecommendation?.id;
    const success = await submitStructuredRecommendation(values, recId);

    if (success) {
      toast({
        title: localEditRecommendation ? "Recommendation updated!" : "Recommendation added!",
        description: `Your recommendation has been successfully ${localEditRecommendation ? 'updated' : 'added'}.`,
      });
      setIsDrawerOpen(false);
    }
  };

  const handleSubmitFreeText = async (values: { city: string; recommendations: string }) => {
    const success = await submitFreeTextRecommendation(values);
    if (success) {
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
          <DrawerTitle>{localEditRecommendation ? "Edit Recommendation" : "Add a Recommendation"}</DrawerTitle>
          <DrawerDescription>
            {localEditRecommendation 
              ? "Update the details of your recommendation." 
              : "Choose how you'd like to add your recommendation."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 space-y-4">
          {!localEditRecommendation && (
            <div className="flex items-center space-x-2">
              <Button
                variant={mode === "structured" ? "default" : "outline"}
                onClick={() => setMode("structured")}
                className="w-1/2"
              >
                Structured Input
              </Button>
              <Button
                variant={mode === "freetext" ? "default" : "outline"}
                onClick={() => setMode("freetext")}
                className="w-1/2"
              >
                Free Text Input
              </Button>
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