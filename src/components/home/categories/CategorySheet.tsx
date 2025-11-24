import React from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategoryItem } from "./category-utils";

interface CategorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  activeCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategories,
  onCategoryToggle,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryToggle(categoryId);
    // Don't auto-close - allow multi-select
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-center text-xl font-semibold">
            Filter by Category
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-2 gap-3 pb-6">
          {categories.map((category) => {
            const isActive = activeCategories.includes(category.id);
            return (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-3 min-h-14 py-3 px-4 rounded-2xl text-base font-semibold ios26-transition-spring ${
                  isActive
                    ? "text-white"
                    : "liquid-glass-clear bg-neutral-100/40 dark:bg-neutral-800/40 text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        boxShadow: "0 4px 16px rgba(102, 126, 234, 0.25)",
                      }
                    : {
                        border: "none",
                        boxShadow: "none",
                      }
                }
              >
                <span className={`text-xl ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {category.icon}
                </span>
                <span className="flex-1 text-left">{category.label}</span>
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategorySheet;
