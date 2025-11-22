
import React, { useRef } from "react";

interface CategoriesScrollContainerProps {
  children: React.ReactNode;
}

const CategoriesScrollContainer: React.FC<CategoriesScrollContainerProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="px-4 overflow-x-auto scrollbar-hide scroll-smooth flex space-x-2 w-full"
      >
        {children}
      </div>
    </div>
  );
};

export default CategoriesScrollContainer;
