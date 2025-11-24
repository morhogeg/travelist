import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteDay } from "@/types/route";
import { mediumHaptic } from "@/utils/ios/haptics";
import { Calendar } from "lucide-react";

interface EditDayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  day: RouteDay | null;
  onSave: (dayNumber: number, label: string, date: string) => void;
}

const EditDayDrawer: React.FC<EditDayDrawerProps> = ({
  isOpen,
  onClose,
  day,
  onSave,
}) => {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (day && isOpen) {
      setLabel(day.label || "");
      setDate(day.date || "");
    } else if (!isOpen) {
      // Reset when closing
      setLabel("");
      setDate("");
    }
  }, [day, isOpen]);

  const handleSave = () => {
    if (!day) return;

    mediumHaptic();
    onSave(day.dayNumber, label, date);
    onClose();
  };

  if (!day) return null;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Day {day.dayNumber}</DrawerTitle>
        </DrawerHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Day Label */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Day Label (Optional)
            </label>
            <Input
              placeholder={`Day ${day.dayNumber}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Custom name like "Museum Day" or "Beach Day"
            </p>
          </div>

          {/* Day Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Specific Date (Optional)
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Override the calculated date for this day
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSave}
            className="text-white font-semibold pointer-events-auto"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Save Changes
          </Button>

          <DrawerClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditDayDrawer;
