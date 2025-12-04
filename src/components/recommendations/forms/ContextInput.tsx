import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lightbulb, X } from "lucide-react";
import { RecommendationContext } from "@/utils/recommendation/types";

const OCCASION_TAGS = [
  "Date night",
  "Family-friendly",
  "Solo travel",
  "Group dinner",
  "Business lunch",
  "Late night",
  "Brunch",
  "Special occasion",
  "Quick bite",
  "Weekend activity",
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High Priority", emoji: "🔥" },
  { value: "medium", label: "Medium Priority", emoji: "⭐" },
  { value: "low", label: "Low Priority", emoji: "💭" },
];

interface ContextInputProps {
  form: UseFormReturn<any>;
  initialContext?: RecommendationContext;
}

export const ContextInput: React.FC<ContextInputProps> = ({
  form,
  initialContext,
}) => {
  const [isOpen, setIsOpen] = useState(!!initialContext);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialContext?.occasionTags || []
  );

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    form.setValue("context.occasionTags", newTags.length > 0 ? newTags : undefined);
  };

  const hasAnyContext = () => {
    const context = form.getValues("context");
    return (
      context?.specificTip ||
      context?.occasionTags?.length > 0 ||
      context?.bestTime ||
      context?.priceRange ||
      context?.visitPriority ||
      context?.personalNote
    );
  };

  const clearAllContext = () => {
    form.setValue("context", undefined);
    setSelectedTags([]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              <span>Add tips & context</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {hasAnyContext() && !isOpen && (
                <Badge variant="secondary" className="ml-2">
                  Added
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>

          {hasAnyContext() && isOpen && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllContext}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Specific Tip */}
          <FormField
            control={form.control}
            name="context.specificTip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specific Tip</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='e.g. "Order the uni don" or "Ask for table by window"'
                    className="min-h-[60px] resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Occasion Tags */}
          <div className="space-y-2">
            <FormLabel>Occasion Tags (optional)</FormLabel>
            <div className="flex flex-wrap gap-2">
              {OCCASION_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer hover:opacity-80 transition-opacity ${
                    selectedTags.includes(tag)
                      ? "bg-[#667eea] text-white border-[#667eea]"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Best Time */}
          <FormField
            control={form.control}
            name="context.bestTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Best Time to Visit (optional)</FormLabel>
                <FormControl>
                  <ClearableInput
                    placeholder='e.g. "Sunset", "Lunch only", "Weekdays"'
                    {...field}
                    value={field.value || ""}
                    onClear={() => form.setValue("context.bestTime", "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Range & Visit Priority in a row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Price Range */}
            <FormField
              control={form.control}
              name="context.priceRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Range</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="$">$ - Budget</SelectItem>
                      <SelectItem value="$$">$$ - Moderate</SelectItem>
                      <SelectItem value="$$$">$$$ - Expensive</SelectItem>
                      <SelectItem value="$$$$">$$$$ - Very Expensive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visit Priority */}
            <FormField
              control={form.control}
              name="context.visitPriority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Personal Note */}
          <FormField
            control={form.control}
            name="context.personalNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Personal Note (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add your own thoughts and memories..."
                    className="min-h-[80px] resize-none"
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
