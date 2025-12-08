import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, UserCircle } from "lucide-react";
import { RecommendationSource, SourceType } from "@/utils/recommendation/types";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: "friend", label: "Friend" },
  { value: "instagram", label: "Instagram" },
  { value: "blog", label: "Blog" },
  { value: "email", label: "Email" },
  { value: "text", label: "Text Message" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "article", label: "Article" },
  { value: "other", label: "Other" },
];

interface SourceInputProps {
  form: UseFormReturn<any>;
  initialSource?: RecommendationSource;
}

export const SourceInput: React.FC<SourceInputProps> = ({
  form,
  initialSource,
}) => {
  const [isOpen, setIsOpen] = useState(!!initialSource);
  const [savedSourceNames, setSavedSourceNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sourceNameValue, setSourceNameValue] = useState(initialSource?.name || "");

  // Load all unique source names from existing recommendations
  useEffect(() => {
    const recommendations = getRecommendations();
    const sourceNames = new Set<string>();

    recommendations.forEach(rec => {
      rec.places.forEach(place => {
        if (place.source?.name) {
          sourceNames.add(place.source.name.trim());
        }
      });
    });

    setSavedSourceNames(Array.from(sourceNames).sort());
  }, []);

  const hasAnySource = () => {
    const source = form.getValues("source");
    return source?.name || source?.type || source?.url || source?.date;
  };

  const clearAllSource = () => {
    form.setValue("source", undefined);
    setSourceNameValue("");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 border-border bg-transparent hover:bg-transparent active:bg-transparent data-[state=open]:bg-transparent focus-visible:ring-0 focus-visible:outline-none focus:outline-none text-foreground data-[state=open]:text-foreground"
              style={{ WebkitTapHighlightColor: "transparent", color: "var(--foreground)" }}
              onClick={(e) => {
                // prevent lingering focus styles causing color shifts
                (e.currentTarget as HTMLButtonElement).blur();
              }}
            >
              <UserCircle className="h-4 w-4" />
              <span>Who recommended this?</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {hasAnySource() && !isOpen && (
                <Badge variant="secondary" className="ml-2">
                  Added
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {hasAnySource() && isOpen && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllSource}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Name with Autocomplete */}
          <FormField
            control={form.control}
            name="source.name"
            render={({ field }) => {
              const handleSourceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                setSourceNameValue(value);
                field.onChange(value);
                setShowSuggestions(value.length > 0);
              };

              const handleSourceNameSelect = (name: string) => {
                setSourceNameValue(name);
                field.onChange(name);
                setShowSuggestions(false);
              };

              const filteredNames = savedSourceNames.filter(name =>
                name.toLowerCase().includes(sourceNameValue.toLowerCase())
              );

              return (
                <FormItem className="relative">
                  <FormLabel>Name or Source</FormLabel>
                  <FormControl>
                    <ClearableInput
                      placeholder='e.g. "Sarah Chen", "@foodblogger", "NY Times"'
                      {...field}
                      value={sourceNameValue}
                      onChange={handleSourceNameChange}
                      onFocus={() => setShowSuggestions(sourceNameValue.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onClear={() => {
                        setSourceNameValue("");
                        field.onChange("");
                      }}
                    />
                  </FormControl>
                  {showSuggestions && filteredNames.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredNames.map((name) => (
                        <div
                          key={name}
                          className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                          onClick={() => handleSourceNameSelect(name)}
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Source Type */}
          <FormField
            control={form.control}
            name="source.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Type (optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Link to Original */}
          <FormField
            control={form.control}
            name="source.url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link to Original (optional)</FormLabel>
                <FormControl>
                  <ClearableInput
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    {...field}
                    value={field.value || ""}
                    onClear={() => form.setValue("source.url", "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Received */}
          <FormField
            control={form.control}
            name="source.date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Received (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="max-w-[200px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
