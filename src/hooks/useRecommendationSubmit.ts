
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processStructuredRecommendation } from "@/utils/recommendation/structured-recommendation";
import { processFreeTextRecommendation } from "@/utils/recommendation/free-text-recommendation";
import { StructuredFormValues, FreeTextFormValues } from "@/utils/recommendation/types";

export const useRecommendationSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitStructuredRecommendation = async (
    values: StructuredFormValues, 
    existingRecId?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Submitting structured recommendation:", values);
      console.log("With existing rec ID:", existingRecId);
      const result = await processStructuredRecommendation(values, toast, existingRecId);
      return result;
    } catch (error) {
      console.error("Error submitting structured recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendation. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const submitFreeTextRecommendation = async (
    values: FreeTextFormValues
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await processFreeTextRecommendation(values, toast);
      return result;
    } catch (error) {
      console.error("Error submitting free text recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendation. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitStructuredRecommendation,
    submitFreeTextRecommendation,
  };
};
