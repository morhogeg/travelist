import { toast as sonnerToast } from 'sonner';
import { haptics } from '@/utils/ios/haptics';

/**
 * Enhanced toast hook with automatic haptic feedback
 * Drop-in replacement for sonner's toast
 */

export const useToastWithHaptics = () => {
  return {
    success: (message: string | React.ReactNode, data?: any) => {
      haptics.success();
      return sonnerToast.success(message, data);
    },
    error: (message: string | React.ReactNode, data?: any) => {
      haptics.error();
      return sonnerToast.error(message, data);
    },
    warning: (message: string | React.ReactNode, data?: any) => {
      haptics.warning();
      return sonnerToast.warning(message, data);
    },
    info: (message: string | React.ReactNode, data?: any) => {
      haptics.light();
      return sonnerToast.info(message, data);
    },
    message: (message: string | React.ReactNode, data?: any) => {
      haptics.light();
      return sonnerToast(message, data);
    },
    loading: (message: string | React.ReactNode, data?: any) => {
      return sonnerToast.loading(message, data);
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
  success: (message: string | React.ReactNode, data?: any) => {
    haptics.success();
    return sonnerToast.success(message, data);
  },
  error: (message: string | React.ReactNode, data?: any) => {
    haptics.error();
    return sonnerToast.error(message, data);
  },
  warning: (message: string | React.ReactNode, data?: any) => {
    haptics.warning();
    return sonnerToast.warning(message, data);
  },
  info: (message: string | React.ReactNode, data?: any) => {
    haptics.light();
    return sonnerToast.info(message, data);
  },
  message: (message: string | React.ReactNode, data?: any) => {
    haptics.light();
    return sonnerToast(message, data);
  },
  loading: (message: string | React.ReactNode, data?: any) => {
    return sonnerToast.loading(message, data);
  },
  dismiss: (id?: number | string) => {
    return sonnerToast.dismiss(id);
  },
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
};
