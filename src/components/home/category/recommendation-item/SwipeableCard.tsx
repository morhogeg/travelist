import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { Trash2, FolderPlus } from "lucide-react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onDeleteTrigger: () => void;
  onAddTrigger?: () => void;
}

const SWIPE_THRESHOLD = 80;
const BUTTON_WIDTH = 80;

type OpenSide = 'none' | 'add' | 'delete';

const SwipeableCard: React.FC<SwipeableCardProps> = ({ children, onDeleteTrigger, onAddTrigger }) => {
  const [openSide, setOpenSide] = useState<OpenSide>('none');
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Transform for the delete button (right side, revealed by swiping left)
  const deleteOpacity = useTransform(x, [-BUTTON_WIDTH, -20, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-BUTTON_WIDTH, -20, 0], [1, 0.8, 0.8]);

  // Transform for the add button (left side, revealed by swiping right)
  const addOpacity = useTransform(x, [0, 20, BUTTON_WIDTH], [0, 0.5, 1]);
  const addScale = useTransform(x, [0, 20, BUTTON_WIDTH], [0.8, 0.8, 1]);

  const resetPosition = useCallback(() => {
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    setOpenSide('none');
  }, [x]);

  // Close when clicking outside
  useEffect(() => {
    if (openSide === 'none') return;

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
  }, [openSide, resetPosition]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe RIGHT (reveals Add button on left)
    if ((offset > SWIPE_THRESHOLD || velocity > 500) && onAddTrigger) {
      animate(x, BUTTON_WIDTH, { type: "spring", stiffness: 300, damping: 30 });
      setOpenSide('add');
    }
    // Swipe LEFT (reveals Delete button on right)
    else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      animate(x, -BUTTON_WIDTH, { type: "spring", stiffness: 300, damping: 30 });
      setOpenSide('delete');
    }
    // Snap back to center
    else {
      resetPosition();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTrigger();
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTrigger?.();
    resetPosition();
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Add button background (left side) - revealed by swiping right */}
      {onAddTrigger && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center rounded-l-2xl"
          style={{
            width: BUTTON_WIDTH,
            opacity: addOpacity,
            scale: addScale,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <button
            onClick={handleAddClick}
            className="flex flex-col items-center justify-center w-full h-full text-white active:opacity-80 transition-opacity"
            aria-label="Add to collection"
          >
            <FolderPlus className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Add</span>
          </button>
        </motion.div>
      )}

      {/* Delete button background (right side) - revealed by swiping left */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-destructive rounded-r-2xl"
        style={{
          width: BUTTON_WIDTH,
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
        dragConstraints={{ left: -BUTTON_WIDTH, right: onAddTrigger ? BUTTON_WIDTH : 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative bg-background rounded-2xl"
        onClick={() => {
          // If card is swiped open and user taps the card itself, close it
          if (openSide !== 'none') {
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
