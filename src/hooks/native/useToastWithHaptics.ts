import { toast as sonnerToast } from 'sonner';
import { haptics } from '@/utils/ios/haptics';

/**
 * Enhanced toast hook with automatic haptic feedback
 * Drop-in replacement for sonner's toast
 */

export const useToastWithHaptics = () => {
  return {
    success: (message: string | React.ReactNode, data?: unknown) => {
      haptics.success();
      return sonnerToast.success(message, data as any);
    },
    error: (message: string | React.ReactNode, data?: unknown) => {
      haptics.error();
      return sonnerToast.error(message, data as any);
    },
    warning: (message: string | React.ReactNode, data?: unknown) => {
      haptics.warning();
      return sonnerToast.warning(message, data as any);
    },
    info: (message: string | React.ReactNode, data?: unknown) => {
      haptics.light();
      return sonnerToast.info(message, data as any);
    },
    message: (message: string | React.ReactNode, data?: unknown) => {
      haptics.light();
      return sonnerToast(message, data as any);
    },
    loading: (message: string | React.ReactNode, data?: unknown) => {
      return sonnerToast.loading(message, data as any);
    },
    dismiss: (id?: number | string) => {
      return sonnerToast.dismiss(id);
    },
  };
};

/**
 * Standalone toast function with haptics
 * Import this instead of 'sonner' for automatic haptic feedback
 */
export const toast = {
  success: (message: string | React.ReactNode, data?: unknown) => {
    haptics.success();
    return sonnerToast.success(message, data as any);
  },
  error: (message: string | React.ReactNode, data?: unknown) => {
    haptics.error();
    return sonnerToast.error(message, data as any);
  },
  warning: (message: string | React.ReactNode, data?: unknown) => {
    haptics.warning();
    return sonnerToast.warning(message, data as any);
  },
  info: (message: string | React.ReactNode, data?: unknown) => {
    haptics.light();
    return sonnerToast.info(message, data as any);
  },
  message: (message: string | React.ReactNode, data?: unknown) => {
    haptics.light();
    return sonnerToast(message, data as any);
  },
  loading: (message: string | React.ReactNode, data?: unknown) => {
    return sonnerToast.loading(message, data as any);
  },
  dismiss: (id?: number | string) => {
    return sonnerToast.dismiss(id);
  },
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
};
