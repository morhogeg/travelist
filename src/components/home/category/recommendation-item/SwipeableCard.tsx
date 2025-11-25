import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDeleteTrigger: () => void;
}

const DELETE_THRESHOLD = 80;
const DELETE_BUTTON_WIDTH = 80;

const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onDeleteTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Transform for the delete button opacity and scale
  const deleteOpacity = useTransform(x, [-DELETE_BUTTON_WIDTH, -20, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-DELETE_BUTTON_WIDTH, -20, 0], [1, 0.8, 0.8]);

  const resetPosition = useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    setIsOpen(false);
  }, [x]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        resetPosition();
      }
    };

    // Use a small delay to avoid immediate trigger from the swipe
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, resetPosition]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // If swiped far enough or fast enough to the left, snap to show delete
    if (offset < -DELETE_THRESHOLD || velocity < -500) {
      animate(x, -DELETE_BUTTON_WIDTH, { type: "spring", stiffness: 300, damping: 30 });
      setIsOpen(true);
    } else {
      // Snap back
      resetPosition();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTrigger();
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Delete button background */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive rounded-r-2xl"
        style={{
          width: DELETE_BUTTON_WIDTH,
          opacity: deleteOpacity,
          scale: deleteScale,
        }}
      >
        <button
          onClick={handleDeleteClick}
          className="flex flex-col items-center justify-center w-full h-full text-white active:bg-destructive/80 transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Delete</span>
        </button>
      </motion.div>

      {/* Swipeable content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -DELETE_BUTTON_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative bg-background rounded-2xl"
        onClick={() => {
          // If card is swiped open and user taps the card itself, close it
          if (isOpen) {
            resetPosition();
          }
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
