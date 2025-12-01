import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  addInboxItem,
  deleteInboxItem,
  getInboxItems,
  markImported,
  parseInboxItem,
  saveManualPlaces,
  updateInboxItem,
} from "@/utils/inbox/inbox-store";
import { InboxItem, InboxParsedPlace, InboxStatus } from "@/types/inbox";
import { Loader2, Inbox as InboxIcon, Sparkles, Trash2, RefreshCw, MapPin, CheckCircle2, Edit3, Plus, ExternalLink } from "lucide-react";
import { storeRecommendation } from "@/utils/recommendation-parser";
import { v4 as uuidv4 } from "uuid";
import { mediumHaptic } from "@/utils/ios/haptics";

const statusStyles: Record<InboxStatus, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200 border border-blue-200/70",
  processing: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 border border-amber-200/70",
  needs_info: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 border border-amber-200/70",
  draft_ready: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200 border border-emerald-200/70",
  imported: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200 border border-purple-200/70",
  failed: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200 border border-red-200/70",
};

const InboxPage: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [newText, setNewText] = useState("");
  const [isSavingText, setIsSavingText] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [editablePlaces, setEditablePlaces] = useState<InboxParsedPlace[]>([]);

  useEffect(() => {
    setItems(getInboxItems());
    const handler = () => setItems(getInboxItems());
    window.addEventListener("inboxUpdated", handler);
    return () => window.removeEventListener("inboxUpdated", handler);
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }, [items]);

  const handleAddText = async () => {
    if (!newText.trim()) {
      toast({ title: "Add some text first", description: "Paste a note or share text to store in your inbox.", variant: "destructive" });
      return;
    }

    setIsSavingText(true);
    mediumHaptic();
    const item = addInboxItem(newText, "share");
    setNewText("");
    setItems(getInboxItems());
    await triggerParse(item.id, true);
    setIsSavingText(false);
  };

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
  };

  const handleDelete = (id: string) => {
    deleteInboxItem(id);
    setItems(getInboxItems());
  };

  const handleOpenItem = (item: InboxItem) => {
    setSelectedItem(item);
    setEditablePlaces(item.parsedPlaces.length ? item.parsedPlaces : [{
      name: "",
      category: "general",
      city: "",
      country: "",
      description: "",
    }]);
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

  const handleOpenLink = (item: InboxItem) => {
    const link = getLink(item);
    if (link) {
      window.open(link, "_blank");
    } else {
      toast({ title: "No link found", description: "This inbox item has no URL to open.", variant: "destructive" });
    }
  };

  const handleSavePlaceEdits = () => {
    if (!selectedItem) return;
    const cleaned = editablePlaces.map((p) => ({
      ...p,
      name: p.name.trim(),
      city: p.city?.trim(),
      country: p.country?.trim(),
      category: p.category?.trim() || "general",
      description: p.description?.trim(),
    }));
    const updated = saveManualPlaces(selectedItem.id, cleaned);
    if (updated) {
      setItems(getInboxItems());
      setSelectedItem(updated);
      toast({ title: "Saved", description: "Inbox draft updated." });
    }
  };

  const handleSaveAsCard = async (place: InboxParsedPlace) => {
    if (!selectedItem) return;
    if (!place.name || !place.city || !place.country) {
      toast({ title: "Missing details", description: "Add name, city, and country before saving.", variant: "destructive" });
      return;
    }

    const recId = uuidv4();
    const newRecommendation = {
      id: recId,
      city: place.city.trim(),
      country: place.country.trim(),
      categories: [place.category || "general"],
      places: [
        {
          name: place.name.trim(),
          category: place.category || "general",
          description: place.description,
          source: place.source,
        },
      ],
      rawText: selectedItem.rawText,
      dateAdded: new Date().toISOString(),
    };

    await storeRecommendation(newRecommendation);
    markImported(selectedItem.id);
    setItems(getInboxItems());
    toast({ title: "Saved to list", description: `${place.name} added to your cards.` });
  };

  const renderStatusBadge = (status: InboxStatus) => (
    <Badge className={cn("text-xs font-semibold", statusStyles[status])}>
      {status.replace("_", " ")}
    </Badge>
  );

  return (
    <Layout>
      <div className="px-4 pt-6 pb-24 space-y-6">
        <div className="liquid-glass-clear rounded-3xl p-5 border border-white/40 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-1">Inbox</p>
              <h1 className="text-2xl font-extrabold">Shared recommendations</h1>
              <p className="text-sm text-muted-foreground mt-1">Paste texts from friends. We’ll parse them into draft cards.</p>
            </div>
            <div className="hidden sm:block text-[#667eea]">
              <InboxIcon className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="liquid-glass-clear rounded-2xl border border-white/30 p-4 space-y-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#667eea]" />
            <p className="text-sm font-semibold">Quick add</p>
          </div>
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={`e.g. "Eat at Nanarella when you're in Rome"`}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleAddText}
            disabled={isSavingText}
            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
          >
            {isSavingText ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Save to Inbox & Parse
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Items ({sortedItems.length})</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">Ready: {sortedItems.filter((i) => i.status === "draft_ready").length}</Badge>
              <Badge variant="outline" className="text-xs">Needs info: {sortedItems.filter((i) => i.status === "needs_info").length}</Badge>
            </div>
          </div>

          {sortedItems.length === 0 && (
            <div className="liquid-glass-clear border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
              No shared items yet. Paste a message to get started.
            </div>
          )}

          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="liquid-glass-clear border border-white/25 rounded-2xl p-4 shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.receivedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {getHost(item) && (
                      <Badge variant="outline" className="text-[11px]">
                        {getHost(item)}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">source: {item.sourceApp || "share"}</span>
                  </div>
                  <p className="text-sm leading-snug line-clamp-2 break-all">
                    {item.displayTitle || item.rawText}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{item.parsedPlaces.length ? `${item.parsedPlaces.length} parsed` : "Awaiting parse"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenLink(item)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenItem(item)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => triggerParse(item.id)}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Drawer open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="flex items-center gap-2">
                <InboxIcon className="h-5 w-5 text-[#667eea]" />
                {selectedItem ? "Inbox item" : ""}
              </DrawerTitle>
              <div className="flex items-center gap-2">
                {selectedItem && getHost(selectedItem) ? (
                  <Badge variant="outline" className="text-[11px]">
                    {getHost(selectedItem)}
                  </Badge>
                ) : null}
                {selectedItem?.url ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenLink(selectedItem)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open link
                  </Button>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground break-all line-clamp-2 overflow-hidden">
                {selectedItem?.displayTitle || selectedItem?.rawText}
              </p>
            </DrawerHeader>

            <div className="px-4 space-y-4 pb-4">
              {editablePlaces.map((place, index) => (
                <div key={index} className="liquid-glass-clear rounded-xl border border-white/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Place {index + 1}</p>
                    {place.confidence && (
                      <Badge variant="outline" className="text-[11px]">
                        Confidence {(place.confidence * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>
                  <Input
                    placeholder="Name"
                    value={place.name}
                    onChange={(e) => handleUpdatePlace(index, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Category (food, nightlife, attractions...)"
                    value={place.category || ""}
                    onChange={(e) => handleUpdatePlace(index, "category", e.target.value)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="City"
                      value={place.city || ""}
                      onChange={(e) => handleUpdatePlace(index, "city", e.target.value)}
                    />
                    <Input
                      placeholder="Country"
                      value={place.country || ""}
                      onChange={(e) => handleUpdatePlace(index, "country", e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Description or tip"
                    value={place.description || ""}
                    onChange={(e) => handleUpdatePlace(index, "description", e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveAsCard(place)}
                      className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 border-none"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Save as card
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DrawerFooter>
              <Button
                variant="outline"
                onClick={handleSavePlaceEdits}
                disabled={!selectedItem}
              >
                Save edits
              </Button>
              <Button
                variant="ghost"
                onClick={() => selectedItem && triggerParse(selectedItem.id)}
                disabled={!selectedItem || processingId === selectedItem?.id}
              >
                {processingId === selectedItem?.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Re-run AI parse
              </Button>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>Close</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </Layout>
  );
};

export default InboxPage;
