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

  const hasAnySource = () => {
    const source = form.getValues("source");
    return source?.name || source?.type || source?.url || source?.date;
  };

  const clearAllSource = () => {
    form.setValue("source", undefined);
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
          {/* Name */}
          <FormField
            control={form.control}
            name="source.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name or Source</FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g. "Sarah Chen", "@foodblogger", "NY Times"'
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
                  <Input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    {...field}
                    value={field.value || ""}
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
