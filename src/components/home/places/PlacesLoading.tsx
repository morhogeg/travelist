
import React from "react";

const PlacesLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse h-64"></div>
      ))}
    </div>
  );
};

export default PlacesLoading;
