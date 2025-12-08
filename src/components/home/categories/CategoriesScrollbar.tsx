// FILE: src/components/home/categories/CategoriesScrollbar.tsx

import React, { useState, useEffect } from "react";
import { Compass, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryIcon } from "@/components/recommendations/utils/category-data";
import CategoryList from "./CategoryList";
import CategoriesScrollContainer from "./CategoriesScrollContainer";
import CategorySheet from "./CategorySheet";
import { useUserCategories, dispatchCategorySelectedEvent } from "./category-utils";
import type { CategoryItem } from "./category-utils";

interface CategoriesScrollbarProps {
  onSheetOpenChange?: (isOpen: boolean) => void;
}

const CategoriesScrollbar: React.FC<CategoriesScrollbarProps> = ({ onSheetOpenChange }) => {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const userCategories = useUserCategories();

  // Notify parent when sheet open state changes
  useEffect(() => {
    onSheetOpenChange?.(isSheetOpen);
  }, [isSheetOpen, onSheetOpenChange]);

  const allCategories: CategoryItem[] = [
    { id: "all", label: "All", icon: <Compass className="h-4 w-4" /> },
    ...userCategories.map(cat => ({
      ...cat,
      icon: getCategoryIcon(cat.id),
    })),
  ];

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === "all") {
      setActiveCategories([]);
      dispatchCategorySelectedEvent("all");
      return;
    }

    setActiveCategories(prev => {
      const updated = prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId];

      dispatchCategorySelectedEvent(updated.length === 0 ? "all" : updated);
      return updated;
    });
  };

  const resolvedActive = activeCategories.length === 0 ? ["all"] : activeCategories;

  // Show first 3 categories + always visible "More" button for better discoverability
  const visibleCategories = allCategories.slice(0, 3);
  const hiddenCount = allCategories.length - 3;
  const hasMoreCategories = hiddenCount > 0;

  return (
    <>
      <div
        className="sticky left-0 right-0 z-30 bg-background/90 backdrop-blur-xl w-full top-0"
        style={{
          position: "-webkit-sticky",
          top: "max(env(safe-area-inset-top, 0px), 0px)",
        }}
      >
        <CategoriesScrollContainer>
          <div className="flex gap-2.5 py-2 pl-0 pr-1 -ml-1">
            <CategoryList
              categories={visibleCategories}
              activeCategories={resolvedActive}
              onCategoryToggle={handleCategoryToggle}
            />
            {hasMoreCategories && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsSheetOpen(true)}
                className="flex items-center gap-1.5 min-h-11 py-2.5 px-2 text-[13px] font-semibold ios26-transition-spring text-foreground whitespace-nowrap outline-none select-none"
                style={{
                  border: "none",
                  boxShadow: "none",
                  background: "transparent",
                  paddingRight: 6,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span>{hiddenCount} More</span>
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </CategoriesScrollContainer>
      </div>

      <CategorySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        categories={allCategories}
        activeCategories={resolvedActive}
        onCategoryToggle={handleCategoryToggle}
      />
    </>
  );
};

export default CategoriesScrollbar;
