import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { selectionHaptic } from "@/utils/ios/haptics";
import { cn } from "@/lib/utils";

interface SectionIndexProps {
  sections: string[]; // Array of country names
  onSectionSelect: (letter: string) => void;
  className?: string;
  scrollThreshold?: number; // How much to scroll before showing (default 150px)
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const SectionIndex: React.FC<SectionIndexProps> = ({
  sections,
  onSectionSelect,
  className,
  scrollThreshold = 150,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Track scroll position to show/hide the index
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  // Get available first letters from sections
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    sections.forEach((section) => {
      const firstLetter = section.charAt(0).toUpperCase();
      if (firstLetter && /[A-Z]/.test(firstLetter)) {
        letters.add(firstLetter);
      }
    });
    return letters;
  }, [sections]);

  const handleLetterSelect = useCallback(
    (letter: string) => {
      if (availableLetters.has(letter)) {
        // Only trigger haptic and callback if it's a new selection
        if (lastSelectedRef.current !== letter) {
          lastSelectedRef.current = letter;
          selectionHaptic();
          onSectionSelect(letter);
        }
      }
    },
    [availableLetters, onSectionSelect]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const y = touch.clientY - rect.top;
      const letterHeight = rect.height / ALPHABET.length;
      const index = Math.floor(y / letterHeight);

      if (index >= 0 && index < ALPHABET.length) {
        handleLetterSelect(ALPHABET[index]);
      }
    },
    [handleLetterSelect]
  );

  const handleTouchEnd = useCallback(() => {
    lastSelectedRef.current = null;
  }, []);

  // Don't render if no sections
  if (sections.length === 0) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "fixed right-1 top-1/2 -translate-y-1/2 z-40",
            "flex flex-col items-center",
            "py-2 px-1",
            "select-none touch-none",
            className
          )}
          style={{
            marginTop: "-2rem", // Offset to account for header
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {ALPHABET.map((letter) => {
            const isAvailable = availableLetters.has(letter);

            return (
              <motion.button
                key={letter}
                onClick={() => handleLetterSelect(letter)}
                disabled={!isAvailable}
                className={cn(
                  "w-5 h-[18px] text-[10px] font-semibold rounded-sm",
                  "flex items-center justify-center",
                  "ios26-transition-smooth",
                  isAvailable
                    ? "text-[#667eea] active:bg-[#667eea] active:text-white active:scale-150"
                    : "text-muted-foreground/25 cursor-default"
                )}
                whileTap={isAvailable ? { scale: 1.5 } : undefined}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {letter}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SectionIndex;
