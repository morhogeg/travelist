/**
 * ParsePreviewSheet - Shows AI-parsed recommendations for user review before saving
 */

import React, { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ClearableInput } from "@/components/ui/clearable-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, MapPin, Loader2, Utensils, Bed, Eye, ShoppingBag, Music, Palmtree, Lightbulb } from "lucide-react";
import { categories, getCategoryColor } from "./utils/category-data";
import type { ParsedPlace } from "@/services/ai/providers/openrouter-parser";
import { getExistingSourceNames } from "@/utils/recommendation-parser";

// Icon map for categories
const categoryIcons: Record<string, React.ReactNode> = {
  food: <Utensils className="h-4 w-4" />,
  lodging: <Bed className="h-4 w-4" />,
  attractions: <Eye className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  nightlife: <Music className="h-4 w-4" />,
  outdoors: <Palmtree className="h-4 w-4" />,
  general: <MapPin className="h-4 w-4" />,
};

interface ParsePreviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  parsedPlaces: ParsedPlace[];
  onUpdatePlace: (index: number, updates: Partial<ParsedPlace>) => void;
  onRemovePlace: (index: number) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  city: string;
  country: string;
}

export const ParsePreviewSheet: React.FC<ParsePreviewSheetProps> = ({
  isOpen,
  onClose,
  parsedPlaces,
  onUpdatePlace,
  onRemovePlace,
  onConfirm,
  isLoading = false,
  city,
  country,
}) => {
  const [existingFriends, setExistingFriends] = useState<string[]>([]);
  const [originalSourceNames, setOriginalSourceNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (isOpen) {
      setExistingFriends(getExistingSourceNames());
      // Store original source names when preview opens
      const originals: Record<number, string> = {};
      parsedPlaces.forEach((place, index) => {
        if (place.source?.name) {
          originals[index] = place.source.name;
        }
      });
      setOriginalSourceNames(originals);
    }
  }, [isOpen, parsedPlaces.length]);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-background dark:bg-background text-foreground dark:text-foreground border-t border-border transition-all duration-300 ease-in-out" style={{ height: 'auto', minHeight: '40vh', maxHeight: '85vh' }}>
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b border-border pb-3 shrink-0">
            <DrawerTitle className="text-center">Review Recommendation</DrawerTitle>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {city}, {country}
            </p>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {parsedPlaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No places detected</p>
                <p className="text-sm mt-1">Try entering text like "eat at Luigi's Pizza"</p>
              </div>
            ) : (
              parsedPlaces.map((place, index) => (
                <div
                  key={index}
                  className="relative rounded-xl border border-border bg-card p-4 space-y-3"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: getCategoryColor(place.category),
                  }}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => onRemovePlace(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {/* Place name - editable */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Place Name
                    </label>
                    <ClearableInput
                      value={place.name}
                      onChange={(e) => onUpdatePlace(index, { name: e.target.value })}
                      className="font-medium"
                      placeholder="Enter place name"
                      onClear={() => onUpdatePlace(index, { name: "" })}
                    />
                  </div>

                  {/* Category selector */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Category
                    </label>
                    <Select
                      value={place.category}
                      onValueChange={(value) => onUpdatePlace(index, { category: value as any })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span style={{ color: cat.color }}>
                                {categoryIcons[cat.id]}
                              </span>
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tip - editable */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      Tip (optional)
                    </label>
                    <ClearableInput
                      value={place.description || ""}
                      onChange={(e) => onUpdatePlace(index, { description: e.target.value })}
                      placeholder="e.g., Try the falafel"
                      className="text-sm"
                      onClear={() => onUpdatePlace(index, { description: "" })}
                    />
                  </div>

                  {/* Source - editable */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Source
                      </label>
                      <Select
                        value={place.source?.type || "none"}
                        onValueChange={(value) => {
                          if (value === "none") {
                            onUpdatePlace(index, { source: undefined });
                          } else {
                            onUpdatePlace(index, {
                              source: {
                                type: value as any,
                                name: place.source?.name || ""
                              }
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {place.source?.type === 'friend' && (
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Name
                        </label>
                        <ClearableInput
                          value={place.source.name || ""}
                          onChange={(e) => onUpdatePlace(index, {
                            source: { ...place.source!, name: e.target.value }
                          })}
                          placeholder="e.g., Sarah"
                          className="text-sm"
                          onClear={() => onUpdatePlace(index, {
                            source: { ...place.source!, name: "" }
                          })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Friend name suggestions */}
                  {place.source?.type === 'friend' && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {/* Show original AI-extracted name if user changed it */}
                      {originalSourceNames[index] &&
                        originalSourceNames[index].toLowerCase() !== place.source?.name?.toLowerCase() && (
                          <>
                            <span className="text-[10px] text-muted-foreground">Original:</span>
                            <button
                              type="button"
                              onClick={() => onUpdatePlace(index, {
                                source: { ...place.source!, name: originalSourceNames[index] }
                              })}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
                            >
                              {originalSourceNames[index]}
                            </button>
                          </>
                        )}
                      {/* Show existing friends */}
                      {existingFriends.length > 0 && (
                        <>
                          <span className="text-[10px] text-muted-foreground ml-1">Existing:</span>
                          {existingFriends
                            .filter(name =>
                              name.toLowerCase() !== place.source?.name?.toLowerCase() &&
                              name.toLowerCase() !== originalSourceNames[index]?.toLowerCase()
                            )
                            .slice(0, 4)
                            .map(name => (
                              <button
                                key={name}
                                type="button"
                                onClick={() => onUpdatePlace(index, {
                                  source: { ...place.source!, name }
                                })}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                              >
                                {name}
                              </button>
                            ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Original text reference */}
                  <div className="text-xs text-muted-foreground italic pt-1 border-t border-border/50">
                    Original: "{place.originalText}"
                  </div>

                  {/* Confidence indicator */}
                  {place.confidence < 0.8 && (
                    <div className="text-xs text-amber-500 dark:text-amber-400">
                      Low confidence - please verify
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <DrawerFooter className="border-t border-border pt-4 flex-row gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={parsedPlaces.length === 0 || isLoading}
              className="flex-1 text-white font-bold rounded-full py-6 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 8px 16px -4px rgba(102, 126, 234, 0.4)'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                `Save ${parsedPlaces.length} Place${parsedPlaces.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
