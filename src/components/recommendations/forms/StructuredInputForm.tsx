import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CategorySelection from "./CategorySelection";
import CityInput from "./CityInput";
import CountrySelect from "./CountrySelect";
import RecommendationFields from "./RecommendationFields";
import AddToCollectionPicker from "./AddToCollectionPicker";
import { FormValues } from "./types";
import { Loader2 } from "lucide-react";
import { formatWebsiteUrl } from "@/utils/countries";
import { addToUserPlaces, getUserPlaces } from "@/utils/recommendation/user-places";
import { addPlaceToCollection } from "@/utils/collections/collectionStore";

const formSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
  category: z.string().min(1, "Please select a category"),
  city: z.string().min(1, "Please enter a city"),
  country: z.string().min(1, "Please select a country"),
  description: z.string().optional(),
  website: z.string().optional(),
});

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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      city: "",
      country: "",
      description: "",
      website: "",
    },
  });

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  useEffect(() => {
    const values = editRecommendation
      ? {
          name: editRecommendation.name || "",
          category: editRecommendation.category || "",
          city: editRecommendation.city || initialCity,
          country: editRecommendation.country || initialCountry,
          description: editRecommendation.description || "",
          website: editRecommendation.website || "",
        }
      : {
          name: "",
          category: "",
          city: initialCity,
          country: initialCountry,
          description: "",
          website: "",
        };

    form.reset(values);
  }, [editRecommendation, initialCity, initialCountry, form]);

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
        <CategorySelection form={form} />
        <RecommendationFields form={form} namePlaceholder="e.g. Louvre Museum" onlyName />
        <RecommendationFields form={form} onlyDescription />
        <RecommendationFields form={form} onlyWebsite />
        <CityInput form={form} initialCity={initialCity} />
        <CountrySelect form={form} initialCountry={initialCountry} />
        {!editRecommendation && (
          <AddToCollectionPicker
            onSelect={(id) => setSelectedCollectionId(id)}
          />
        )}
        <Button
          type="submit"
          className="w-full text-white font-semibold"
          disabled={isAnalyzing}
          style={{
            background: isAnalyzing ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: isAnalyzing ? 'none' : '0 4px 20px rgba(102, 126, 234, 0.4)'
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