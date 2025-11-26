import React from "react";
import { CategoryBreakdown } from "@/utils/collections/collectionHelpers";

interface CategoryDotsProps {
  categories: CategoryBreakdown[];
  maxVisible?: number;
}

const CategoryDots: React.FC<CategoryDotsProps> = ({
  categories,
  maxVisible = 4,
}) => {
  if (categories.length === 0) return null;

  const visible = categories.slice(0, maxVisible);
  const remaining = categories.length - maxVisible;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {visible.map((cat) => (
        <div key={cat.category} className="flex items-center gap-1.5">
          {/* Colored dot */}
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: cat.color }}
          />
          {/* Count */}
          <span className="text-xs text-muted-foreground">{cat.count}</span>
        </div>
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining} more</span>
      )}
    </div>
  );
};

export default CategoryDots;
