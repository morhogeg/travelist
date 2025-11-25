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
          <SheetTitle className="text-center text-base font-semibold">
            Filter by Category
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-2 pb-4">
          {categories.map((category) => {
            const isActive = activeCategories.includes(category.id);
            return (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex items-center gap-2 min-h-11 py-2.5 px-3 rounded-xl text-sm font-medium ios26-transition-spring ${
                  isActive
                    ? "text-white"
                    : "liquid-glass-clear bg-neutral-100/40 dark:bg-neutral-800/40 text-foreground hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60"
                }`}
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        boxShadow: "none",
                      }
                    : {
                        border: "none",
                        boxShadow: "none",
                      }
                }
              >
                <span className={`text-base ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {category.icon}
                </span>
                <span className="flex-1 text-left">{category.label}</span>
              </motion.button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategorySheet;
