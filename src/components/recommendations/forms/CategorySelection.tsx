import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { categories } from "../utils/category-data";
import CategoryPill from "@/components/ui/CategoryPill";
import { FormValues } from "./types";

interface CategorySelectionProps {
  form: UseFormReturn<FormValues>;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ form }) => {
  const selected = form.watch("category");

  const handleCategorySelect = (categoryId: string) => {
    form.setValue("category", categoryId, { shouldValidate: true });
  };

  return (
    <FormField
      control={form.control}
      name="category"
      render={() => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <div className="flex flex-wrap gap-2 my-2">
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  isActive={selected?.toLowerCase() === category.id.toLowerCase()}
                  onClick={(e) => {
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