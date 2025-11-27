import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface ClearableInputProps extends React.ComponentProps<"input"> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const ClearableInput = React.forwardRef<HTMLInputElement, ClearableInputProps>(
  ({ className, value, onChange, onClear, showClearButton = true, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else if (onChange) {
        // Create a synthetic event to clear the input
        const syntheticEvent = {
          target: { value: "" },
          currentTarget: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn("pr-8", className)}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showClearButton && hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        )}
      </div>
    );
  }
);

ClearableInput.displayName = "ClearableInput";

export { ClearableInput };
