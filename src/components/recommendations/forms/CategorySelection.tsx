
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { categories } from "../utils/category-data";
import CategoryPill from "@/components/ui/CategoryPill";
import { FormValues } from "./types";

interface CategorySelectionProps {
  form: UseFormReturn<FormValues>;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ form }) => {
  // Set category value without automatically submitting the form
  const handleCategorySelect = (categoryId: string) => {
    form.setValue("category", categoryId, {
      shouldValidate: true
    });
  };

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <div className="flex flex-wrap gap-2 my-2">
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  isActive={field.value === category.id}
                  onClick={(e) => {
                    // Stop propagation to prevent drawer from closing
                    e.preventDefault();
                    e.stopPropagation();
                    handleCategorySelect(category.id);
                  }}
                />
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategorySelection;
