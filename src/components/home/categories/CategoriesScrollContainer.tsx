import React, { useRef, useState, useEffect } from "react";

interface CategoriesScrollContainerProps {
  children: React.ReactNode;
}

const CategoriesScrollContainer: React.FC<CategoriesScrollContainerProps> = ({ children }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftFade(scrollLeft > 5);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  return (
    <div className="relative w-full">
      {/* Left Fade Mask */}
      {showLeftFade && (
        <div
          className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, var(--background), transparent)',
          }}
        />
      )}

      <div
        ref={scrollContainerRef}
        className="px-1 overflow-x-auto scrollbar-hide scroll-smooth flex w-full"
      >
        {children}
      </div>

      {/* Right Fade Mask */}
      {showRightFade && (
        <div
          className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, var(--background), transparent)',
          }}
        />
      )}
    </div>
  );
};

export default CategoriesScrollContainer;
