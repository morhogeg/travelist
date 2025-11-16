import { useCallback } from 'react';
import { haptics } from '@/utils/ios/haptics';

/**
 * Hook for using haptic feedback in components
 *
 * @example
 * const { light, medium, success } = useHaptics();
 *
 * <button onClick={() => { medium(); handleClick(); }}>
 *   Save
 * </button>
 */
export const useHaptics = () => {
  const light = useCallback(() => {
    haptics.light();
  }, []);

  const medium = useCallback(() => {
    haptics.medium();
  }, []);

  const heavy = useCallback(() => {
    haptics.heavy();
  }, []);

  const success = useCallback(() => {
    haptics.success();
  }, []);

  const warning = useCallback(() => {
    haptics.warning();
  }, []);

  const error = useCallback(() => {
    haptics.error();
  }, []);

  const selection = useCallback(() => {
    haptics.selection();
  }, []);

  const vibrate = useCallback((duration?: number) => {
    haptics.vibrate(duration);
  }, []);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    vibrate,
  };
};

/**
 * Hook for button haptics
 * Automatically triggers medium haptic on click
 */
export const useButtonHaptic = (onClick?: () => void) => {
  const { medium } = useHaptics();

  const handleClick = useCallback(() => {
    medium();
    onClick?.();
  }, [medium, onClick]);

  return handleClick;
};
