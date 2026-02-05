import React, { useEffect, useState } from "react";
import { getCollections, addCollection } from "@/utils/collections/collectionStore";
import { Collection } from "@/utils/collections/collectionStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddToCollectionPickerProps {
  onSelect: (collectionId: string | null) => void;
  defaultCollectionId?: string | null;
}

const AddToCollectionPicker: React.FC<AddToCollectionPickerProps> = ({
  onSelect,
  defaultCollectionId = null,
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState<string | null>(defaultCollectionId);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setCollections(getCollections());
  }, []);

  const handleCreateNew = () => {
    if (!newName.trim()) return;
    const newCollection = addCollection(newName.trim());
    setCollections([...collections, newCollection]);
    setSelected(newCollection.id);
    onSelect(newCollection.id);
    setNewName("");
  };

  const handleSelect = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    onSelect(next);
  };

  return (
    <div className="space-y-2">
      <Label className="block">Add to Collection</Label>
      <div className="flex flex-wrap gap-2">
        {collections.map((collection) => {
          const isSelected = selected === collection.id;
          return (
            <button
              key={collection.id}
              type="button"
              onClick={() => handleSelect(collection.id)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all outline-none border focus:outline-none focus-visible:outline-none ${isSelected
                  ? "border-transparent"
                  : "text-foreground border-border hover:bg-neutral-100/5 dark:hover:bg-neutral-800/40"
                }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'transparent',
                color: isSelected ? '#fff' : 'inherit',
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {collection.name}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="New collection name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button
          type="button"
          onClick={handleCreateNew}
          className="text-white font-bold rounded-full px-5 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px -2px rgba(102, 126, 234, 0.4)'
          }}
        >
          Create
        </Button>
      </div>
    </div>
  );
};

export default AddToCollectionPicker;
