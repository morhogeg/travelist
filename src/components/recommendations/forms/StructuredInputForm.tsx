import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategorySelection from "./CategorySelection";
import CityInput from "./CityInput";
import CountrySelect from "./CountrySelect";
import RecommendationFields from "./RecommendationFields";
import AddToCollectionPicker from "./AddToCollectionPicker";
import { SourceInput } from "./SourceInput";
import { ContextInput } from "./ContextInput";
import { FormValues, structuredFormSchema } from "./types";
import { Loader2 } from "lucide-react";
import { formatWebsiteUrl } from "@/utils/countries";
import { addToUserPlaces, getUserPlaces } from "@/utils/recommendation/user-places";
import { addPlaceToCollection } from "@/utils/collections/collectionStore";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { useToast } from "@/hooks/use-toast";

interface StructuredInputFormProps {
  onSubmit: (values: FormValues) => void;
  initialCity?: string;
  initialCountry?: string;
  isAnalyzing?: boolean;
  editRecommendation?: any | null;
}

export const StructuredInputForm: React.FC<StructuredInputFormProps> = ({
  onSubmit,
  initialCity = "",
  initialCountry = "",
  isAnalyzing = false,
  editRecommendation = null,
}) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(structuredFormSchema),
    defaultValues: {
      name: "",
      category: "",
      city: "",
      country: "",
      description: "",
      website: "",
      source: undefined,
      context: undefined,
    },
  });

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Watch city field and auto-fill country from existing recommendations
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'city' && value.city && !editRecommendation) {
        const cityName = value.city.trim();
        const recommendations = getRecommendations();
        const existingCity = recommendations.find(
          r => r.city.toLowerCase().trim() === cityName.toLowerCase()
        );

        if (existingCity && existingCity.country && !value.country) {
          form.setValue('country', existingCity.country);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, editRecommendation]);

  // Merge description into context.specificTip if context doesn't have one
  // This handles AI-created recommendations that store tips in description
  const getContextWithTip = () => {
    if (editRecommendation?.context?.specificTip) {
      return editRecommendation.context;
    }
    if (editRecommendation?.description) {
      return { ...editRecommendation.context, specificTip: editRecommendation.description };
    }
    return editRecommendation?.context;
  };

  useEffect(() => {
    const values = editRecommendation
      ? {
        name: editRecommendation.name || "",
        category: editRecommendation.category || "",
        city: editRecommendation.city || initialCity,
        country: editRecommendation.country || initialCountry,
        description: editRecommendation.description || "",
        website: editRecommendation.website || "",
        source: editRecommendation.source || undefined,
        context: getContextWithTip(),
      }
      : {
        name: "",
        category: "",
        city: initialCity,
        country: initialCountry,
        description: "",
        website: "",
        source: undefined,
        context: undefined,
      };

    // Force reset with keepDefaultValues: false to clear all fields
    form.reset(values, { keepDefaultValues: false });
  }, [editRecommendation, initialCity, initialCountry]);

  const handleSubmit = (values: FormValues) => {
    if (values.website) {
      values.website = formatWebsiteUrl(values.website);
    }

    if (values.city) {
      addToUserPlaces(values.city.trim(), values.country);
    }

    onSubmit(values);

    // Fix: add real saved place to collection
    if (!editRecommendation && selectedCollectionId) {
      const latest = getUserPlaces().at(-1); // last added
      if (latest) {
        addPlaceToCollection(selectedCollectionId, latest.id);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <RecommendationFields form={form} namePlaceholder="e.g. Louvre Museum" onlyName />
        <CityInput form={form} initialCity={initialCity} />
        <CountrySelect form={form} initialCountry={initialCountry} />
        <CategorySelection form={form} />
        <SourceInput form={form} initialSource={editRecommendation?.source} />

        <ContextInput
          form={form}
          initialContext={getContextWithTip()}
          initialWebsite={editRecommendation?.website}
        />

        {/* Show date added when editing (read-only) */}
        {editRecommendation?.dateAdded && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Added {new Date(editRecommendation.dateAdded).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        )}

        {!editRecommendation && (
          <AddToCollectionPicker
            onSelect={(id) => setSelectedCollectionId(id)}
          />
        )}
        <Button
          type="submit"
          className="w-full text-white font-bold rounded-full py-6 transition-all duration-300"
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: isAnalyzing ? 'none' : '0 8px 16px -4px rgba(102, 126, 234, 0.4)'
          }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            editRecommendation ? "Update Recommendation" : "Add Recommendation"
          )}
        </Button>
      </form>
    </Form>
  );
};
