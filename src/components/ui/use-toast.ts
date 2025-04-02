
import { useToast, toast } from "@/hooks/use-toast";

// Enhance toast with default auto-dismiss after 3 seconds
const enhancedToast = {
  ...toast,
  // Override the default toast function
  toast: (props: Parameters<typeof toast>[0]) => {
    return toast({
      ...props,
      // Set duration to 3000ms (3 seconds) unless specified
      duration: props.duration || 3000,
    });
  }
};

export { useToast, enhancedToast as toast };
