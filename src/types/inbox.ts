export type InboxStatus =
  | "new"
  | "processing"
  | "needs_info"
  | "draft_ready"
  | "imported"
  | "failed";

export type InboxParsedPlace = {
  id?: string;
  name: string;
  category?: string;
  city?: string;
  country?: string;
  description?: string;
  confidence?: number;
  sourceName?: string; // Who/where the recommendation came from
  sourceType?: 'friend' | 'instagram' | 'tiktok' | 'article' | 'other'; // Type of source
  sourceUrl?: string; // Optional URL for Instagram/TikTok/Article sources
};

export type InboxItem = {
  id: string;
  rawText: string;
  url?: string;
  displayTitle?: string;
  displayHost?: string;
  sourceApp?: string;
  inputType?: 'url' | 'text'; // Track whether this is a URL share or freeform text
  receivedAt: string;
  status: InboxStatus;
  parsedPlaces: InboxParsedPlace[];
  error?: string;
};

