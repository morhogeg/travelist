
import React from 'react';

interface MapErrorProps {
  error: string;
}

const MapError: React.FC<MapErrorProps> = ({ error }) => {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-muted-foreground mt-2">Please check your connection and try again.</p>
      </div>
    </div>
  );
};

export default MapError;
