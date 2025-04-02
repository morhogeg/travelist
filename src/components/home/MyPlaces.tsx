
import React from "react";
import { usePlaces } from "@/hooks/use-places";
import PlaceCard from "./places/PlaceCard";
import PlacesLoading from "./places/PlacesLoading";
import EmptyPlaces from "./places/EmptyPlaces";

const MyPlaces: React.FC = () => {
  const { places, loading, handlePlaceClick, handleAddToCity, handleDeletePlace } = usePlaces();

  if (loading) {
    return (
      <section className="px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">My Places</h2>
        <PlacesLoading />
      </section>
    );
  }

  if (places.length === 0) {
    return (
      <section className="px-6 py-6">
        <h2 className="text-xl font-semibold mb-4">My Places</h2>
        <EmptyPlaces />
      </section>
    );
  }

  return (
    <section className="px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">My Places</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {places.map((place, index) => (
          <PlaceCard
            key={place.id}
            place={place}
            index={index}
            onPlaceClick={handlePlaceClick}
            onAddToCity={handleAddToCity}
            onDeletePlace={handleDeletePlace}
          />
        ))}
      </div>
    </section>
  );
};

export default MyPlaces;
