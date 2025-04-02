
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "./types";

interface CountryInputProps {
  form: UseFormReturn<FormValues>;
  initialCountry?: string;
}

const CountryInput: React.FC<CountryInputProps> = ({ form, initialCountry = "" }) => {
  // If there's an initialCountry and the form doesn't have a country value yet, set it
  React.useEffect(() => {
    if (initialCountry && !form.getValues("country")) {
      form.setValue("country", initialCountry);
    }
  }, [initialCountry, form]);

  return (
    <FormField
      control={form.control}
      name="country"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Country (optional)</FormLabel>
          <FormControl>
            <Input 
              placeholder="e.g. France" 
              {...field} 
              value={field.value || ""} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CountryInput;
