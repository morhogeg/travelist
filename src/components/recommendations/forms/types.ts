
import { z } from "zod";

// Schema for a single recommendation (used in the structured form)
export const singleRecommendationSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  description: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

// Schema for the whole form with multiple recommendations
export const formSchema = z.object({
  city: z.string().min(2, {
    message: "City name must be at least 2 characters.",
  }),
  country: z.string().optional(),
  recommendations: z.array(singleRecommendationSchema).min(1, {
    message: "At least one recommendation is required",
  }),
});

// Schema for the structured form with a single recommendation
export const structuredFormSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  name: z.string().min(2, { message: "Name is required" }),
  city: z.string().min(2, { message: "City name is required" }),
  country: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
});

export type FormValues = z.infer<typeof structuredFormSchema>;
