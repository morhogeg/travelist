
import React from "react";
import LocationCard from "../ui/LocationCard";

const featuredLocations = [
  {
    id: "1",
    name: "Amalfi Coast",
    location: "Salerno, Italy",
    image: "https://images.unsplash.com/photo-1533587851505-d119d2007e46?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Beaches",
  },
  {
    id: "2",
    name: "Kyoto Temples",
    location: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Cultural",
  },
  {
    id: "3",
    name: "Santorini Views",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Islands",
  },
];

const FeaturedLocations = () => {
  return (
    <section className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Featured Destinations</h2>
        <button className="text-sm font-medium text-primary">See All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredLocations.map((location, index) => (
          <LocationCard
            key={location.id}
            {...location}
            delay={index}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedLocations;
