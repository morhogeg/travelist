import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearableInput } from "@/components/ui/clearable-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Inbox as InboxIcon, Trash2, MapPin, Edit3, ExternalLink, RefreshCw, ClipboardPaste } from "lucide-react";
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
          title: "Clipboard not available",
          description: "Your browser doesn't support clipboard access. Try copying text and using the Share Extension instead.",
          variant: "destructive",
        });
        return;
      }

      const text = await navigator.clipboard.readText();

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
        title: "Paste failed",
        description: err?.message || "Could not read from clipboard. Make sure you've granted permission.",
        variant: "destructive",
      });
    } finally {
      setIsPasting(false);
    }
  };

  useEffect(() => {
    void importFromShareExtension();
    setItems(getInboxItems());
    const handler = () => setItems(getInboxItems());
    window.addEventListener("inboxUpdated", handler);
    const handleVisibility = () => {
      if (!document.hidden) void importFromShareExtension();
    };
    window.addEventListener("focus", importFromShareExtension);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("inboxUpdated", handler);
      window.removeEventListener("focus", importFromShareExtension);
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
    setEditablePlaces(item.parsedPlaces.length ? [item.parsedPlaces[0]] : [placeholderPlace]);

    // Auto-parse on open if we don't have structured data yet
    if (!item.parsedPlaces.length) {
      const updated = await triggerParse(item.id, true);
      if (updated) {
        setSelectedItem(updated);
        setEditablePlaces(updated.parsedPlaces.length ? [updated.parsedPlaces[0]] : [placeholderPlace]);
      }
    }
  };

  const handleUpdatePlace = (index: number, field: keyof InboxParsedPlace, value: string) => {
    setEditablePlaces((prev) => prev.map((place, i) => i === index ? { ...place, [field]: value } : place));
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
    }
  };

  const handleSaveAsCard = async () => {
    if (!selectedItem) return;
    const place = editablePlaces[0];
    if (!place.name || !place.city || !place.country) {
      toast({ title: "Missing details", description: "Add name, city, and country before saving.", variant: "destructive" });
      return;
    }

    const address =
      selectedItem.displayTitle ||
      [place.name, place.city, place.country].filter(Boolean).join(", ") ||
      selectedItem.rawText;

    const recId = uuidv4();
    const newRecommendation = {
      id: recId,
      city: place.city.trim(),
      country: place.country.trim(),
      location: address,
      categories: [place.category || "general"],
      places: [
        {
          name: place.name.trim(),
          category: place.category || "general",
          description: place.description?.trim(),
          context: {
            ...(place.description?.trim() ? { specificTip: place.description.trim() } : {}),
            ...(address ? { address } : {}),
          },
        },
      ],
      rawText: selectedItem.rawText,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRecommendation);
    markImported(selectedItem.id);
    // Remove from inbox after saving as a card
    deleteInboxItem(selectedItem.id);
    setItems(getInboxItems());
    setSelectedItem(null);
    toast({ title: "Saved to list", description: `${place.name} added to your cards and removed from Inbox.` });
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
              onClick={handlePasteFromClipboard}
              disabled={isPasting}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
              aria-label="Paste from clipboard"
              title="Paste URL or text from clipboard"
            >
              {isPasting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ClipboardPaste className="h-5 w-5" />
              )}
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

          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="liquid-glass-clear border border-white/30 rounded-2xl p-4 shadow-lg space-y-3 cursor-pointer"
              onClick={() => handleOpenItem(item)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status, () => handleOpenItem(item))}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.receivedAt).toLocaleString()}
                    </span>
                    {item.error && (
                      <span className="text-[11px] text-destructive font-medium">
                        {item.error}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold leading-6 break-words">
                    {item.displayTitle || item.rawText}
                  </p>

                </div>

                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {(item.error || item.status === "needs_info") && (
                    <button
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/10 ios26-transition-smooth"
                      onClick={() => triggerParse(item.id)}
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? "Parsing…" : "Retry AI Parse"}
                    </button>
                  )}
                  <button
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    onClick={() => handleOpenLink(item)}
                    aria-label="Open link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="p-1 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => setItemToDelete(item)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Drawer open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DrawerContent className="max-h-[85vh] px-4">
            <DrawerHeader className="pb-2 space-y-2 text-center items-center">
              {selectedItem && getLink(selectedItem) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="mx-auto text-foreground"
                  onClick={() => handleOpenLink(selectedItem)}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open link
                </Button>
              ) : null}
              <p className="text-sm text-muted-foreground break-all">
                {selectedItem?.displayTitle || selectedItem?.rawText}
              </p>
            </DrawerHeader>

            <div className="space-y-4 pb-4">
              <div className="space-y-3">
                <ClearableInput
                  placeholder="Name"
                  value={editablePlaces[0]?.name || ""}
                  onChange={(e) => handleUpdatePlace(0, "name", e.target.value)}
                  className="text-base"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="relative">
                    <ClearableInput
                      placeholder="City"
                      value={editablePlaces[0]?.city || ""}
                      onChange={(e) => handleUpdatePlace(0, "city", e.target.value)}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 100)}
                      className="text-base"
                    />
                    {showCitySuggestions && filterOptions(recommendationCities, editablePlaces[0]?.city).length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                        {filterOptions(recommendationCities, editablePlaces[0]?.city).map((city) => (
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
                      value={editablePlaces[0]?.country || ""}
                      onChange={(e) => handleUpdatePlace(0, "country", e.target.value)}
                      onFocus={() => setShowCountrySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 100)}
                      className="text-base"
                    />
                    {showCountrySuggestions && filterOptions(recommendationCountries, editablePlaces[0]?.country).length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                        {filterOptions(recommendationCountries, editablePlaces[0]?.country).map((country) => (
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
                      isActive={editablePlaces[0]?.category === cat.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdatePlace(0, "category", cat.id);
                      }}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Description or tip"
                  value={editablePlaces[0]?.description || ""}
                  onChange={(e) => handleUpdatePlace(0, "description", e.target.value)}
                  className="text-base"
                />
              </div>
            </div>

            <DrawerFooter>
              <Button
                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                onClick={handleSaveAsCard}
                disabled={!selectedItem}
              >
                Save as Card
              </Button>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>Close</Button>
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
