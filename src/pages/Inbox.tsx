import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SourcePill from "@/components/ui/SourcePill";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  addInboxItem,
  deleteInboxItem,
  getInboxItems,
  markImported,
  parseInboxItem,
} from "@/utils/inbox/inbox-store";
import { InboxItem, InboxParsedPlace, InboxStatus } from "@/types/inbox";
import { Loader2, Inbox as InboxIcon, Trash2, MapPin, Edit3, ExternalLink, RefreshCw, ClipboardPaste, Plus, Users, Instagram, Music, Youtube, BookOpen, FileText, Globe } from "lucide-react";
import { storeRecommendation } from "@/utils/recommendation-parser";
import { v4 as uuidv4 } from "uuid";
import { categories as categoryPills } from "@/components/recommendations/utils/category-data";
import CategoryPill from "@/components/ui/CategoryPill";
import { getRecommendations } from "@/utils/recommendation/recommendation-manager";
import { FilterButton } from "@/components/home/filters";
import { importSharedInbox } from "@/utils/inbox/shared-import";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusStyles: Record<InboxStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200 border border-blue-200/70",
  processing: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 border border-amber-200/70",
  needs_info: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200 border border-red-200/70",
  draft_ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200 border border-emerald-200/70",
  imported: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200 border border-purple-200/70",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200 border border-red-200/70",
};

const InboxPage: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [editablePlaces, setEditablePlaces] = useState<InboxParsedPlace[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterCountries, setFilterCountries] = useState<string[]>([]);
  const [filterCities, setFilterCities] = useState<string[]>([]);
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<InboxItem | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isPasting, setIsPasting] = useState(false);
  const [showTextInputDrawer, setShowTextInputDrawer] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [selectedPlaceIndex, setSelectedPlaceIndex] = useState(0);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<number>>(new Set());

  const recommendationCities = useMemo(() => {
    const recs = getRecommendations();
    const cities = recs
      .map((r) => r.city?.trim())
      .filter(Boolean) as string[];
    return Array.from(new Set(cities)).sort();
  }, []);

  const recommendationCountries = useMemo(() => {
    const recs = getRecommendations();
    const countries = recs
      .map((r) => r.country?.trim())
      .filter(Boolean) as string[];
    return Array.from(new Set(countries)).sort();
  }, []);

  const existingFriendNames = useMemo(() => {
    const recs = getRecommendations();
    const friendNames: string[] = [];
    recs.forEach(rec => {
      rec.places?.forEach(place => {
        if (place.source?.type === 'friend' && place.source.name) {
          friendNames.push(place.source.name);
        }
      });
    });
    return Array.from(new Set(friendNames)).sort();
  }, []);

  const getSourceLabel = (item: InboxItem) => {
    const text = item.rawText.toLowerCase();
    if (text.includes("google.com/maps") || text.includes("goo.gl/maps")) return "Google Maps";
    if (text.includes("instagram.com")) return "Instagram";
    if (text.includes("tiktok.com")) return "TikTok";
    if (item.sourceApp && item.sourceApp.toLowerCase().includes("instagram")) return "Instagram";
    if (item.sourceApp && item.sourceApp.toLowerCase().includes("google")) return "Google Maps";
    return "Friend";
  };

  const availableCountries = useMemo(() => {
    const countries = items.flatMap((item) =>
      item.parsedPlaces.map((p) => p.country).filter(Boolean) as string[]
    );
    return Array.from(new Set(countries)).sort();
  }, [items]);

  const availableCities = useMemo(() => {
    const cities = items.flatMap((item) =>
      item.parsedPlaces.map((p) => p.city).filter(Boolean) as string[]
    );
    return Array.from(new Set(cities)).sort();
  }, [items]);

  const availableSources = useMemo(() => {
    const sources = items.map((item) => getSourceLabel(item)).filter(Boolean) as string[];
    return Array.from(new Set(sources)).sort();
  }, [items]);

  const importFromShareExtension = async () => {
    try {
      setIsImporting(true);
      const imported = await importSharedInbox();
      if (imported > 0) {
        setItems(getInboxItems());
      } else {
        console.log("[Inbox] No new shared items found");
      }
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err?.message || "Could not pull items from the share sheet. Make sure the app build includes SharedInboxPlugin.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true);

      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        toast({
          title: "Use Share Extension",
          description: "On iOS, use the Share button in Safari or other apps to send places here.",
          variant: "destructive",
        });
        return;
      }

      let text: string;
      try {
        text = await navigator.clipboard.readText();
      } catch (clipboardErr: any) {
        // iOS often blocks clipboard access in WebViews
        console.warn("[Inbox] Clipboard access denied:", clipboardErr?.message);
        toast({
          title: "Use Share Extension",
          description: "Paste isn't available on iOS. Instead, tap Share in Safari or Google Maps, then choose Travelist.",
        });
        return;
      }

      if (!text || !text.trim()) {
        toast({
          title: "Clipboard empty",
          description: "Copy a URL or text to your clipboard first, then tap paste.",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicates
      const existingItems = getInboxItems();
      const isDuplicate = existingItems.some(
        (item) => item.rawText.trim().toLowerCase() === text.trim().toLowerCase()
      );

      if (isDuplicate) {
        toast({
          title: "Already in Inbox",
          description: "This item is already in your Inbox.",
        });
        return;
      }

      // Add to inbox
      const newItem = addInboxItem(text.trim(), "clipboard-paste");
      setItems(getInboxItems());

      toast({
        title: "Added to Inbox",
        description: "Item pasted from clipboard. Tap to review and save.",
      });

      // Auto-parse in background
      triggerParse(newItem.id, true);
    } catch (err: any) {
      console.error("[Inbox] Clipboard paste failed", err);
      toast({
        title: "Use Share Extension",
        description: "Paste isn't available. Use the Share button in Safari or Google Maps instead.",
      });
    } finally {
      setIsPasting(false);
    }
  };

  const handleAddTextSubmit = () => {
    if (!textInput.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter or paste some text first.",
        variant: "destructive",
      });
      return;
    }

    const newItem = addInboxItem(textInput.trim(), "manual-text-input");
    setItems(getInboxItems());
    setShowTextInputDrawer(false);
    setTextInput("");

    toast({
      title: "Added to Inbox",
      description: "Text added. Tap to review and save.",
    });

    // Auto-parse in background
    triggerParse(newItem.id, true);
  };


  useEffect(() => {
    // Initial import on mount
    void importFromShareExtension();
    setItems(getInboxItems());

    // Listen for internal updates (e.g. from other components)
    const handler = () => setItems(getInboxItems());
    window.addEventListener("inboxUpdated", handler);

    // Import when app comes to foreground
    const handleVisibility = () => {
      if (!document.hidden) {
        void importFromShareExtension();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("inboxUpdated", handler);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [items]);

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      const cities = item.parsedPlaces.map((p) => p.city).filter(Boolean) as string[];
      const countries = item.parsedPlaces.map((p) => p.country).filter(Boolean) as string[];
      const sourceLabel = getSourceLabel(item);

      if (filterCities.length && !filterCities.some((c) => cities.includes(c))) return false;
      if (filterCountries.length && !filterCountries.some((c) => countries.includes(c))) return false;
      if (filterSources.length && !filterSources.includes(sourceLabel)) return false;

      return true;
    });
  }, [sortedItems, filterCities, filterCountries, filterSources]);

  const triggerParse = async (id: string, silent = false) => {
    setProcessingId(id);
    const updated = await parseInboxItem(id);
    setItems(getInboxItems());
    setProcessingId(null);

    if (!silent && updated) {
      if (updated.status === "draft_ready") {
        toast({ title: "Ready to save", description: "We found a place and added city/country.", variant: "default" });
      } else if (updated.status === "needs_info") {
        toast({ title: "Needs more info", description: "Add city/country, then save as a card." });
      } else if (updated.status === "failed") {
        toast({ title: "Parse failed", description: updated.error || "Could not parse the text.", variant: "destructive" });
      }
    }
    return updated;
  };

  const handleDelete = (id: string) => {
    deleteInboxItem(id);
    setItems(getInboxItems());
  };

  const handleOpenItem = async (item: InboxItem) => {
    setSelectedItem(item);

    // Auto-parse on open if we don't have structured data yet
    if (!item.parsedPlaces.length) {
      const updated = await triggerParse(item.id, true);
      if (updated && updated.parsedPlaces.length > 0) {
        setEditablePlaces(updated.parsedPlaces);
        setSelectedPlaceIndex(0);
        // Auto-select all places by default
        setSelectedPlaceIds(new Set(updated.parsedPlaces.map((_, i) => i)));
        setSelectedItem(updated);
      } else {
        setEditablePlaces([placeholderPlace]);
        setSelectedPlaceIndex(0);
        setSelectedPlaceIds(new Set([0]));
      }
    } else {
      setEditablePlaces(item.parsedPlaces);
      setSelectedPlaceIndex(0);
      // Auto-select all places by default
      setSelectedPlaceIds(new Set(item.parsedPlaces.map((_, i) => i)));
    }
  };

  const handleUpdatePlace = (index: number, field: keyof InboxParsedPlace, value: string) => {
    setEditablePlaces((prev) => prev.map((place, i) => i === index ? { ...place, [field]: value } : place));
  };

  const handleUpdateSource = (sourceName: string, sourceType: 'friend' | 'instagram' | 'tiktok' | 'article' | 'other', sourceUrl?: string) => {
    setEditablePlaces((prev) => prev.map((place, i) => i === 0 ? { ...place, sourceName, sourceType, sourceUrl } : place));
  };

  const getHost = (item: InboxItem) => {
    if (item.displayHost) return item.displayHost;
    try {
      const urlMatch = item.rawText.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return "";
      return new URL(urlMatch[0]).host.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  const getLink = (item: InboxItem) => {
    if (item.url) return item.url;
    const match = item.rawText.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : "";
  };

  const filterOptions = (options: string[], query?: string) => {
    if (!query) return [];
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q)).slice(0, 5);
  };

  const formatStatusLabel = (status: InboxStatus) => {
    if (status === "draft_ready") return "Ready for Review";
    if (status === "imported") return "Saved";
    return status.replace("_", " ");
  };

  const findCountryForCity = (city?: string) => {
    if (!city) return "";
    const recs = getRecommendations();
    const match = recs.find(
      (r) => r.city && r.city.toLowerCase().trim() === city.toLowerCase().trim()
    );
    return match?.country || "";
  };

  const handleOpenLink = (item: InboxItem) => {
    const link = getLink(item);
    if (link) {
      window.open(link, "_blank");
    } else {
      toast({ title: "No link found", description: "This inbox item has no URL to open.", variant: "destructive" });
      toast({ title: "No link found", description: "This inbox item has no URL to open.", variant: "destructive" });
    }
  };

  const handleSaveAsCard = async () => {
    if (!selectedItem) return;

    const currentPlace = editablePlaces[selectedPlaceIndex];

    if (!currentPlace.name || !currentPlace.city || !currentPlace.country) {
      toast({
        title: "Missing details",
        description: "Add name, city, and country before saving.",
        variant: "destructive"
      });
      return;
    }

    const address =
      selectedItem.displayTitle ||
      [currentPlace.name, currentPlace.city, currentPlace.country].filter(Boolean).join(", ") ||
      selectedItem.rawText;

    const recId = uuidv4();
    const newRecommendation = {
      id: recId,
      city: currentPlace.city!.trim(),
      country: currentPlace.country!.trim(),
      location: address,
      categories: [currentPlace.category || "general"],
      places: [
        {
          name: currentPlace.name.trim(),
          category: currentPlace.category || "general",
          description: currentPlace.description?.trim(),
          source: currentPlace.sourceName && currentPlace.sourceType ? {
            type: currentPlace.sourceType,
            name: currentPlace.sourceName,
            url: currentPlace.sourceUrl,
          } : undefined,
          context: {
            ...(currentPlace.description?.trim() ? { specificTip: currentPlace.description.trim() } : {}),
            ...(address ? { address } : {}),
          },
        },
      ],
      rawText: selectedItem.rawText,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRecommendation);

    // Remove saved place from editablePlaces
    const updatedPlaces = editablePlaces.filter((_, i) => i !== selectedPlaceIndex);

    if (updatedPlaces.length === 0) {
      // All places saved, remove inbox item
      markImported(selectedItem.id);
      deleteInboxItem(selectedItem.id);
      setItems(getInboxItems());
      setSelectedItem(null);
    } else {
      // Update item with remaining places
      setEditablePlaces(updatedPlaces);
      // Adjust selected index if needed
      if (selectedPlaceIndex >= updatedPlaces.length) {
        setSelectedPlaceIndex(updatedPlaces.length - 1);
      }
      // Update the inbox item
      const updatedItem = { ...selectedItem, parsedPlaces: updatedPlaces };
      setSelectedItem(updatedItem);
      // Update in storage
      const items = getInboxItems();
      const itemIndex = items.findIndex(i => i.id === selectedItem.id);
      if (itemIndex !== -1) {
        items[itemIndex] = updatedItem;
        setItems([...items]);
      }
    }

    toast({
      title: "Saved to list",
      description: `${currentPlace.name} added to your cards.${updatedPlaces.length > 0 ? ` ${updatedPlaces.length} place(s) remaining.` : ''}`
    });
  };

  const placeholderPlace: InboxParsedPlace = {
    name: "",
    category: "general",
    city: "",
    country: "",
    description: "",
  };

  const renderStatusBadge = (status: InboxStatus, onClick?: () => void) => {
    const label = formatStatusLabel(status);
    if (status === "draft_ready") {
      return (
        <button
          onClick={onClick}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm transition-all"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
          aria-label="Review this shared item"
        >
          <span>{label}</span>
        </button>
      );
    }
    return (
      <Badge className={cn("text-xs font-semibold capitalize", statusStyles[status])}>
        {label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="px-4 pt-3 pb-24 space-y-6">
        <div className="relative flex items-center justify-center mb-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.01em] bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Inbox
          </h1>
          <div className="absolute right-0 flex items-center gap-2">
            <button
              onClick={() => setShowTextInputDrawer(true)}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Add text"
              title="Add text recommendation"
            >
              <Plus className="h-5 w-5" />
            </button>
            <FilterButton
              activeCount={filterCities.length + filterCountries.length + filterSources.length}
              onClick={() => setFilterDrawerOpen(true)}
            />
          </div>
        </div>

        <div className="space-y-3">

          {filteredItems.length === 0 && (
            <div className="liquid-glass-clear border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
              Share places from apps like Google Maps or Instagram, then open the app to find them here.
            </div>
          )}

          {filteredItems.map((item) => {
            const placeName = item.parsedPlaces[0]?.name || item.displayTitle || '';
            const location = item.parsedPlaces[0]?.city
              ? `${item.parsedPlaces[0]?.city}${item.parsedPlaces[0]?.country ? `, ${item.parsedPlaces[0]?.country}` : ''}`
              : '';
            const isReady = item.status === 'draft_ready';
            const needsAction = item.status === 'needs_info' || item.error;

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                onClick={() => handleOpenItem(item)}
              >
                {/* Gradient border effect */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl",
                  "bg-white/5"
                )} />

                {/* Card content */}
                <div className="relative liquid-glass-clear border border-white/10 rounded-2xl p-4">
                  {/* Top row: Status + Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isReady ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Ready
                        </span>
                      ) : needsAction ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Needs Info
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-400">
                          {item.status === 'processing' ? 'Processing...' : 'New'}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      {needsAction && (
                        <button
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium text-purple-400 hover:bg-purple-500/20 transition-colors"
                          onClick={() => triggerParse(item.id)}
                          disabled={processingId === item.id}
                        >
                          {processingId === item.id ? "..." : "Retry"}
                        </button>
                      )}
                      <button
                        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        onClick={() => handleOpenLink(item)}
                        aria-label="Open link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1.5 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => setItemToDelete(item)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Place name - prominent */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-foreground leading-tight">
                      {placeName || item.rawText.slice(0, 50)}
                    </h3>
                    {item.parsedPlaces.length > 1 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                        {item.parsedPlaces.length}
                      </span>
                    )}
                  </div>

                  {/* Location + timestamp */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {location && (
                      <>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location}
                        </span>
                        <span>·</span>
                      </>
                    )}
                    <span>{new Date(item.receivedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Drawer open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DrawerContent className="max-h-[88vh] px-4 overflow-x-hidden overscroll-contain no-tap-highlight" style={{ touchAction: 'pan-y' }}>
            <DrawerHeader className="pb-0 pt-2 flex flex-col items-center justify-center space-y-0">
              <div
                className={cn(
                  "text-[13.5px] text-muted-foreground break-all flex items-center gap-1.5 justify-center w-full mt-0.5 opacity-90 transition-opacity active:opacity-60 select-none no-tap-highlight",
                  selectedItem && getLink(selectedItem) ? "cursor-pointer hover:text-primary" : ""
                )}
                style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
                onClick={() => selectedItem && getLink(selectedItem) && handleOpenLink(selectedItem)}
              >
                <span className="truncate max-w-[260px] font-medium">
                  {selectedItem?.displayTitle || selectedItem?.rawText}
                </span>
                {selectedItem && getLink(selectedItem) && (
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                {selectedItem?.parsedPlaces && selectedItem.parsedPlaces.length > 1 && (
                  <span className="px-1.5 py-0 rounded-full text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 whitespace-nowrap flex-shrink-0">
                    {selectedItem.parsedPlaces.length}
                  </span>
                )}
              </div>

              {/* Place tabs if multiple places */}
              {editablePlaces.length > 1 && (
                <div className="w-full space-y-1 pt-1">
                  <p className="text-[10px] text-muted-foreground text-center">
                    {selectedPlaceIds.size}/{editablePlaces.length} selected
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {editablePlaces.map((place, index) => {
                      const isSelected = selectedPlaceIds.has(index);
                      const isActive = selectedPlaceIndex === index;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedPlaceIndex(index)}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                            isActive
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              const newSet = new Set(selectedPlaceIds);
                              if (e.target.checked) {
                                newSet.add(index);
                              } else {
                                newSet.delete(index);
                              }
                              setSelectedPlaceIds(newSet);
                            }}
                            className="h-3 w-3 rounded"
                          />
                          <span>{place.name || `P${index + 1}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </DrawerHeader>

            <div className="space-y-2.5 pb-2">
              <div className="space-y-2">
                <ClearableInput
                  placeholder="Name"
                  value={editablePlaces[selectedPlaceIndex]?.name || ""}
                  onChange={(e) => handleUpdatePlace(selectedPlaceIndex, "name", e.target.value)}
                  className="text-base h-11"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <ClearableInput
                      placeholder="City"
                      value={editablePlaces[selectedPlaceIndex]?.city || ""}
                      onChange={(e) => handleUpdatePlace(0, "city", e.target.value)}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 100)}
                      className="text-base h-11"
                    />
                    {showCitySuggestions && filterOptions(recommendationCities, editablePlaces[selectedPlaceIndex]?.city).length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                        {filterOptions(recommendationCities, editablePlaces[selectedPlaceIndex]?.city).map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-lg"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              handleUpdatePlace(0, "city", city);
                              const autoCountry = findCountryForCity(city);
                              if (autoCountry) {
                                handleUpdatePlace(0, "country", autoCountry);
                              }
                              setShowCitySuggestions(false);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <ClearableInput
                      placeholder="Country"
                      value={editablePlaces[selectedPlaceIndex]?.country || ""}
                      onChange={(e) => handleUpdatePlace(0, "country", e.target.value)}
                      onFocus={() => setShowCountrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 100)}
                      className="text-base h-11"
                    />
                    {showCountrySuggestions && filterOptions(recommendationCountries, editablePlaces[selectedPlaceIndex]?.country).length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                        {filterOptions(recommendationCountries, editablePlaces[selectedPlaceIndex]?.country).map((country) => (
                          <button
                            key={country}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-lg"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              handleUpdatePlace(0, "country", country);
                              setShowCountrySuggestions(false);
                            }}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryPills.map((cat) => (
                    <CategoryPill
                      key={cat.id}
                      label={cat.label}
                      icon={cat.icon}
                      isActive={editablePlaces[selectedPlaceIndex]?.category === cat.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdatePlace(0, "category", cat.id);
                      }}
                    />
                  ))}
                </div>

                {/* Source selection */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">Source</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'friend', label: 'Friend', icon: <Users className="h-4 w-4" /> },
                      { id: 'instagram', label: 'Instagram', icon: <Instagram className="h-4 w-4" />, linkable: true },
                      { id: 'tiktok', label: 'TikTok', icon: <Music className="h-4 w-4" />, linkable: true },
                      { id: 'youtube', label: 'YouTube', icon: <Youtube className="h-4 w-4" />, linkable: true },
                      { id: 'blog', label: 'Blog', icon: <BookOpen className="h-4 w-4" />, linkable: true },
                      { id: 'article', label: 'Article', icon: <FileText className="h-4 w-4" />, linkable: true },
                      { id: 'other', label: 'Other', icon: <Globe className="h-4 w-4" /> },
                    ].map((source) => (
                      <SourcePill
                        key={source.id}
                        label={source.label}
                        icon={source.icon}
                        isActive={editablePlaces[selectedPlaceIndex]?.sourceType === source.id}
                        onClick={() => {
                          const currentType = editablePlaces[selectedPlaceIndex]?.sourceType;
                          const currentName = editablePlaces[selectedPlaceIndex]?.sourceName;

                          if (source.id === 'friend') {
                            // For friend, keep existing name if already set, else prompt for name
                            handleUpdateSource(
                              currentName && currentType === 'friend' ? currentName : 'Friend',
                              'friend'
                            );
                          } else {
                            // For non-friend sources, use the label as the name
                            handleUpdateSource(source.label, source.id as any);
                          }
                        }}
                      />
                    ))}
                  </div>
                  {editablePlaces[selectedPlaceIndex]?.sourceType === 'friend' && (
                    <div className="space-y-2 mt-2">
                      {existingFriendNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {existingFriendNames.map((friendName) => (
                            <button
                              key={friendName}
                              onClick={() => handleUpdateSource(friendName, 'friend')}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {friendName}
                            </button>
                          ))}
                        </div>
                      )}
                      <Input
                        placeholder="Friend's name..."
                        value={editablePlaces[selectedPlaceIndex]?.sourceName || ''}
                        onChange={(e) => handleUpdateSource(e.target.value, 'friend')}
                        className="text-sm h-10"
                      />
                    </div>
                  )}
                  {/* URL field for linkable sources */}
                  {(editablePlaces[selectedPlaceIndex]?.sourceType === 'instagram' ||
                    editablePlaces[selectedPlaceIndex]?.sourceType === 'tiktok' ||
                    editablePlaces[selectedPlaceIndex]?.sourceType === 'article') && (
                      <Input
                        placeholder="Source URL (optional)"
                        value={editablePlaces[selectedPlaceIndex]?.sourceUrl || ''}
                        onChange={(e) => handleUpdateSource(
                          editablePlaces[selectedPlaceIndex]?.sourceName || editablePlaces[selectedPlaceIndex]?.sourceType || '',
                          editablePlaces[selectedPlaceIndex]?.sourceType as any,
                          e.target.value
                        )}
                        className="text-sm mt-2 h-10"
                        type="url"
                      />
                    )}
                </div>

                <Textarea
                  placeholder="Description or tip"
                  value={editablePlaces[selectedPlaceIndex]?.description || ""}
                  onChange={(e) => {
                    handleUpdatePlace(0, "description", e.target.value);
                    // Simple auto-resize logic
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="text-base min-h-[44px] max-h-[120px] resize-none overflow-hidden py-2"
                  rows={1}
                />
              </div>
            </div>

            <DrawerFooter className="pt-0 pb-3">
              <Button
                className="w-full text-white font-bold rounded-full py-6 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 16px -4px rgba(102, 126, 234, 0.4)'
                }}
                onClick={handleSaveAsCard}
                disabled={!selectedItem}
              >
                Save {editablePlaces[selectedPlaceIndex]?.name || 'Place'} as Card
              </Button>
              <Button variant="ghost" className="h-8 text-muted-foreground text-xs" onClick={() => setSelectedItem(null)}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Filter Drawer */}
        <Drawer open={filterDrawerOpen} onOpenChange={(open) => setFilterDrawerOpen(open)}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle>Inbox Filters</DrawerTitle>
              <DrawerDescription>Filter by city/country from parsed items.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-6 pb-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold">Countries</p>
                <div className="flex flex-wrap gap-2">
                  {availableCountries.length === 0 && (
                    <p className="text-xs text-muted-foreground">No countries yet</p>
                  )}
                  {availableCountries.map((country) => (
                    <button
                      key={country}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        filterCountries.includes(country)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "border-border text-foreground hover:bg-muted/20 dark:hover:bg-muted/30"
                      )}
                      onClick={() => {
                        setFilterCountries((prev) =>
                          prev.includes(country)
                            ? prev.filter((c) => c !== country)
                            : [...prev, country]
                        );
                      }}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Cities</p>
                <div className="flex flex-wrap gap-2">
                  {availableCities.length === 0 && (
                    <p className="text-xs text-muted-foreground">No cities yet</p>
                  )}
                  {availableCities.map((city) => (
                    <button
                      key={city}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        filterCities.includes(city)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "border-border text-foreground hover:bg-muted/20 dark:hover:bg-muted/30"
                      )}
                      onClick={() => {
                        setFilterCities((prev) =>
                          prev.includes(city)
                            ? prev.filter((c) => c !== city)
                            : [...prev, city]
                        );
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {availableSources.length === 0 && (
                    <p className="text-xs text-muted-foreground">No sources yet</p>
                  )}
                  {availableSources.map((source) => (
                    <button
                      key={source}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        filterSources.includes(source)
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "border-border text-foreground hover:bg-muted/20 dark:hover:bg-muted/30"
                      )}
                      onClick={() => {
                        setFilterSources((prev) =>
                          prev.includes(source)
                            ? prev.filter((s) => s !== source)
                            : [...prev, source]
                        );
                      }}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Text Input Drawer */}
        <Drawer open={showTextInputDrawer} onOpenChange={(open) => !open && setShowTextInputDrawer(false)}>
          <DrawerContent className="max-h-[85vh] px-4">
            <DrawerHeader className="pb-2">
              <DrawerTitle>Add Text Recommendation</DrawerTitle>
              <DrawerDescription>
                Paste or type a place recommendation from Instagram, WhatsApp, or anywhere else.
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 pb-4">
              <Textarea
                placeholder="Example: Found this amazing café in Barcelona! ☕ Café Federal on Carrer del Parlament - amazing brunch spot. Highly recommend the shakshuka! 🍳"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] text-base"
                autoFocus
              />
            </div>

            <DrawerFooter>
              <Button
                className="w-full text-white font-bold rounded-full py-6 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 16px -4px rgba(102, 126, 234, 0.4)'
                }}
                onClick={handleAddTextSubmit}
                disabled={!textInput.trim()}
              >
                Add to Inbox
              </Button>
              <Button variant="ghost" onClick={() => {
                setShowTextInputDrawer(false);
                setTextInput("");
              }}>
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete inbox item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the shared item from your Inbox. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={() => {
                  if (itemToDelete) {
                    handleDelete(itemToDelete.id);
                    setItemToDelete(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default InboxPage;
