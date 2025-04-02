import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface RecommendationFieldsProps {
  form: UseFormReturn<FormValues>;
  namePlaceholder?: string;
  onlyName?: boolean;
  onlyDescription?: boolean;
  onlyWebsite?: boolean;
}

const RecommendationFields: React.FC<RecommendationFieldsProps> = ({
  form,
  namePlaceholder = "e.g. Eiffel Tower",
  onlyName = false,
  onlyDescription = false,
  onlyWebsite = false,
}) => {
  return (
    <>
      {/* Name */}
      {!onlyDescription && !onlyWebsite && (
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder={namePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Description */}
      {!onlyName && !onlyWebsite && (
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add some notes about this place..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Website */}
      {!onlyName && !onlyDescription && (
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g. www.example.com or https://example.com" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default RecommendationFields;