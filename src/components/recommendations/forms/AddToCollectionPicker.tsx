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
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-2">
      <Label className="block">Add to Collection</Label>
      <div className="flex flex-wrap gap-2">
        {collections.map((collection) => (
          <Button
            key={collection.id}
            variant={selected === collection.id ? "default" : "outline"}
            onClick={() => handleSelect(collection.id)}
            className="text-sm"
          >
            {collection.name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="New collection name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button onClick={handleCreateNew}>Create</Button>
      </div>
    </div>
  );
};

export default AddToCollectionPicker;