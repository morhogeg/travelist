import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { processStructuredRecommendation } from "@/utils/recommendation/structured-recommendation";
import { processFreeTextRecommendation } from "@/utils/recommendation/free-text-recommendation";
import { processAIParsedRecommendation, AIParsedFormValues } from "@/utils/recommendation/ai-parsed-recommendation";
import { StructuredFormValues, FreeTextFormValues } from "@/utils/recommendation/types";

export const useRecommendationSubmit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitStructuredRecommendation = async (
    values: StructuredFormValues, 
    existingRecId?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      console.log("Submitting structured recommendation:", values);
      console.log("With existing rec ID:", existingRecId);
      const result = await processStructuredRecommendation(values, toast, existingRecId);

      if (result && result.id) return result.id;
      return null;
    } catch (error) {
      console.error("Error submitting structured recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendation. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitFreeTextRecommendation = async (
    values: FreeTextFormValues
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const result = await processFreeTextRecommendation(values, toast);
      if (result && result.id) return result.id;
      return null;
    } catch (error) {
      console.error("Error submitting free text recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendation. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitAIParsedRecommendation = async (
    values: AIParsedFormValues
  ): Promise<string[] | null> => {
    setIsLoading(true);
    try {
      const result = await processAIParsedRecommendation(values, toast);
      if (result && result.ids) return result.ids;
      return null;
    } catch (error) {
      console.error("Error submitting AI-parsed recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to submit recommendations. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitStructuredRecommendation,
    submitFreeTextRecommendation,
    submitAIParsedRecommendation,
  };
};