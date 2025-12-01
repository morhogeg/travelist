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
};

export type InboxItem = {
  id: string;
  rawText: string;
  url?: string;
  displayTitle?: string;
  displayHost?: string;
  sourceApp?: string;
  receivedAt: string;
  status: InboxStatus;
  parsedPlaces: InboxParsedPlace[];
  error?: string;
};
