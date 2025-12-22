import React from "react";
import { motion } from "framer-motion";
import { Plus, CheckCircle2, Circle, Trash2, Calendar, GripVertical, Edit2 } from "lucide-react";
import { ExportToMapsButton } from "@/components/maps/ExportToMapsButton";
import { Route, RouteDay, RoutePlaceReference } from "@/types/route";
import { RecommendationPlace } from "@/utils/recommendation/types";
import { Button } from "@/components/ui/button";
import { getCategoryColor, getCategoryIcon } from "@/components/recommendations/utils/category-data";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { lightHaptic, mediumHaptic } from "@/utils/ios/haptics";

interface DaySectionProps {
  route: Route;
  day: RouteDay;
  places: Map<string, RecommendationPlace>;
  onAddPlaces: () => void;
  onToggleVisited: (dayNumber: number, placeId: string, visited: boolean) => void;
  onRemovePlace: (dayNumber: number, placeId: string) => void;
  onReorderPlaces: (dayNumber: number, reorderedPlaces: RoutePlaceReference[]) => void;
  onRemoveDay: (dayNumber: number) => void;
  onPlaceClick: (placeId: string) => void;
  onEditDay: (dayNumber: number) => void;
}

interface SortablePlaceItemProps {
  placeRef: RoutePlaceReference;
  place: RecommendationPlace;
  index: number;
  dayNumber: number;
  onToggleVisited: (dayNumber: number, placeId: string, visited: boolean) => void;
  onRemovePlace: (dayNumber: number, placeId: string) => void;
  onPlaceClick: (placeId: string) => void;
  city?: string;
  country?: string;
}

const SortablePlaceItem: React.FC<SortablePlaceItemProps> = ({
  placeRef,
  place,
  index,
  dayNumber,
  onToggleVisited,
  onRemovePlace,
  onPlaceClick,
  city,
  country
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: placeRef.placeId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryColor = getCategoryColor(place.category);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 border-l-4 ${placeRef.visited ? 'bg-success/5' : 'bg-card'
        } ${isDragging ? 'shadow-lg scale-105' : ''} ios26-transition-smooth`}
      style={{
        ...style,
        borderLeftColor: categoryColor,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground ios26-transition-smooth"
          onTouchStart={() => lightHaptic()}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Order Number */}
        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {index + 1}
          </span>
        </div>

        {/* Place Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <div
              className="shrink-0 mt-0.5"
              style={{ color: categoryColor }}
            >
              {getCategoryIcon(place.category)}
            </div>
            <h3
              onClick={(e) => {
                e.stopPropagation();
                lightHaptic();
                onPlaceClick(placeRef.placeId);
              }}
              className={`font-semibold text-sm cursor-pointer hover:text-primary hover:underline ios26-transition-smooth ${placeRef.visited ? 'line-through text-muted-foreground' : ''
                }`}
            >
              {place.name}
            </h3>
          </div>

          {place.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 ml-6">
              {place.description}
            </p>
          )}

          {placeRef.notes && (
            <div className="mt-2 ml-6 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                📝 {placeRef.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ExportToMapsButton
            places={[{
              name: place.name,
              address: place.name, // Use name as address
              city: city,
              country: country
            }]}
            variant="ghost"
            size="icon"
            showText={false}
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            iconClassName="h-4 w-4"
          />

          <button
            onClick={() => onToggleVisited(dayNumber, placeRef.placeId, placeRef.visited)}
            className="ios26-transition-smooth"
          >
            {placeRef.visited ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={() => onRemovePlace(dayNumber, placeRef.placeId)}
            className="text-muted-foreground hover:text-destructive ios26-transition-smooth"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DaySection: React.FC<DaySectionProps> = ({
  route,
  day,
  places,
  onAddPlaces,
  onToggleVisited,
  onRemovePlace,
  onReorderPlaces,
  onRemoveDay,
  onPlaceClick,
  onEditDay,
}) => {
  const sortedPlaces = [...day.places].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedPlaces.findIndex((p) => p.placeId === active.id);
      const newIndex = sortedPlaces.findIndex((p) => p.placeId === over.id);

      const reorderedPlaces = arrayMove(sortedPlaces, oldIndex, newIndex);

      // Trigger medium haptic feedback on successful reorder
      mediumHaptic();

      onReorderPlaces(day.dayNumber, reorderedPlaces);
    }
  };

  const getDayLabel = () => {
    if (day.label) return day.label;
    if (route.days.length > 1) return `Day ${day.dayNumber}`;
    return "Places";
  };

  const getDayDate = () => {
    if (day.date) {
      return format(new Date(day.date), "EEEE, MMM d");
    }
    if (route.startDate && route.days.length > 1) {
      // Calculate date based on start date and day number
      const startDate = new Date(route.startDate);
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + (day.dayNumber - 1));
      return format(dayDate, "EEEE, MMM d");
    }
    return null;
  };

  const dayDate = getDayDate();

  return (
    <div className="pt-2">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {getDayLabel()}
          </h2>
          {dayDate && (
            <p className="text-xs text-muted-foreground mt-0.5">{dayDate}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Edit Day Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEditDay(day.dayNumber)}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          {route.days.length > 1 && sortedPlaces.length === 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemoveDay(day.dayNumber)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {sortedPlaces.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddPlaces}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Places List */}
      {sortedPlaces.length === 0 ? (
        <div className="text-center py-8 px-4">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-3">
            <Plus className="h-6 w-6 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">No places added yet</p>
          <Button
            size="sm"
            onClick={onAddPlaces}
            className="text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Places
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedPlaces.map((p) => p.placeId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {sortedPlaces.map((placeRef, index) => {
                // First try lookup by placeId
                let place = places.get(placeRef.placeId);

                // Fallback: search by placeName if ID lookup fails
                if (!place && placeRef.placeName) {
                  for (const p of places.values()) {
                    if (p.name.toLowerCase() === placeRef.placeName.toLowerCase()) {
                      place = p;
                      break;
                    }
                  }
                }

                if (!place) {
                  // Show visible error instead of hiding
                  return (
                    <div key={placeRef.placeId} className="rounded-xl p-3 bg-red-500/10 border border-red-500/30">
                      <p className="text-sm text-red-500">⚠️ Place not found</p>
                      <p className="text-xs text-red-400 mt-1">Name: {placeRef.placeName || 'Unknown'}</p>
                      <p className="text-xs text-red-400 break-all">ID: {placeRef.placeId}</p>
                    </div>
                  );
                }

                return (
                  <SortablePlaceItem
                    key={placeRef.placeId}
                    placeRef={placeRef}
                    place={place}
                    index={index}
                    dayNumber={day.dayNumber}
                    onToggleVisited={onToggleVisited}
                    onRemovePlace={onRemovePlace}
                    onPlaceClick={onPlaceClick}
                    city={route.city}
                    country={route.country}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default DaySection;
