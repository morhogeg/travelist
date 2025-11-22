
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormValues } from "./types";
import { countryList } from "@/utils/countries";

interface CountrySelectProps {
  form: UseFormReturn<FormValues>;
  initialCountry?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ form, initialCountry = "" }) => {
  // If there's an initialCountry and the form doesn't have a country value yet, set it
  React.useEffect(() => {
    if (initialCountry && !form.getValues("country")) {
      form.setValue("country", initialCountry);
    }
  }, [initialCountry, form]);

  // Handle the case where the form value is "_placeholder"
  React.useEffect(() => {
    if (form.getValues("country") === "_placeholder") {
      form.setValue("country", "");
    }
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="country"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Country</FormLabel>
          <Select 
            onValueChange={(value) => {
              // Convert "_placeholder" to empty string to maintain the same behavior
              field.onChange(value === "_placeholder" ? "" : value);
            }} 
            defaultValue={field.value || "_placeholder"}
            value={field.value || "_placeholder"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[300px]">
              {/* Don't use an empty string value, use a special placeholder value instead */}
              <SelectItem value="_placeholder">Select a country</SelectItem>
              {countryList.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CountrySelect;
