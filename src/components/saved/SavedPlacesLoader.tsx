
import React from "react";

const SavedPlacesLoader: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-48 animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default SavedPlacesLoader;
