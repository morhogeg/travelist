import React from "react";
import { EnrichedCollection } from "@/utils/collections/collectionHelpers";
import CollectionCard from "./CollectionCard";

interface CollectionSectionProps {
  title: string;
  collections: EnrichedCollection[];
  icon: React.ComponentType<{ className?: string }>;
  onDelete: (collectionId: string, collectionName: string) => void;
  onClick: (collectionId: string) => void;
}

const CollectionSection: React.FC<CollectionSectionProps> = ({
  title,
  collections,
  icon: Icon,
  onDelete,
  onClick,
}) => {
  if (collections.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-xs text-muted-foreground">({collections.length})</span>
      </div>
      <div className="space-y-2">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onDelete={() => onDelete(collection.id, collection.name)}
            onClick={() => onClick(collection.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CollectionSection;
