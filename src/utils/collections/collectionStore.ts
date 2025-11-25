export interface Collection {
  id: string;
  name: string;
  placeIds: string[];
  createdAt: string;
}

const STORAGE_KEY = "travelist-collections";

// Generate a unique ID
function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback if crypto.randomUUID() is not available
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Fetch all collections
export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save all collections
function saveCollections(collections: Collection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

// Create a new collection
export function addCollection(name: string): Collection {
  const collections = getCollections();
  const newCollection: Collection = {
    id: generateId(),
    name,
    placeIds: [],
    createdAt: new Date().toISOString(),
  };
  const updated = [...collections, newCollection];
  saveCollections(updated);
  return newCollection;
}

// Add a place to a collection (if not already added)
export function addPlaceToCollection(collectionId: string, placeId: string) {
  const collections = getCollections();
  const updated = collections.map((col) => {
    if (col.id === collectionId && !col.placeIds.includes(placeId)) {
      return { ...col, placeIds: [...col.placeIds, placeId] };
    }
    return col;
  });
  saveCollections(updated);
}

// Remove a place from a collection
export function removePlaceFromCollection(collectionId: string, placeId: string) {
  const collections = getCollections();
  const updated = collections.map((col) => {
    if (col.id === collectionId) {
      return { ...col, placeIds: col.placeIds.filter((id) => id !== placeId) };
    }
    return col;
  });
  saveCollections(updated);
}

// Find which collection contains a given place ID (returns first match)
export function findCollectionIdByPlaceId(placeId: string): string | undefined {
  const collections = getCollections();
  for (const col of collections) {
    if (col.placeIds?.includes(placeId)) return col.id;
  }
}

// Get all collections that contain a given place ID
export function getCollectionsByPlaceId(placeId: string): Collection[] {
  const collections = getCollections();
  return collections.filter((col) => col.placeIds?.includes(placeId));
}

// Check if a place is in a specific collection
export function isPlaceInCollection(collectionId: string, placeId: string): boolean {
  const collections = getCollections();
  const collection = collections.find((col) => col.id === collectionId);
  return collection?.placeIds?.includes(placeId) ?? false;
}