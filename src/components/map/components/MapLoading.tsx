
import React from 'react';
import { Loader2 } from 'lucide-react';

const MapLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
};

export default MapLoading;
