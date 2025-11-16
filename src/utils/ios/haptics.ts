import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Haptics utility for iOS-style tactile feedback
 * Only works on native iOS platform
 */

const isHapticsAvailable = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

/**
 * Light impact - for UI element selection
 * Use for: toggle switches, segmented controls, pickers
 */
export const lightHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Medium impact - for normal interactions
 * Use for: button presses, card taps, navigation
 */
export const mediumHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Heavy impact - for significant actions
 * Use for: deletions, confirmations, important actions
 */
export const heavyHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Success notification
 * Use for: successful saves, completions, positive confirmations
 */
export const successHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Warning notification
 * Use for: warnings, cautions, alerts
 */
export const warningHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Error notification
 * Use for: errors, failed actions, invalid inputs
 */
export const errorHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.notification({ type: NotificationType.Error });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Selection changed haptic
 * Use for: scrolling through options, changing selections
 */
export const selectionHaptic = async () => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.selectionChanged();
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

/**
 * Vibrate for a specific duration (fallback for Android)
 * @param duration - Duration in milliseconds
 */
export const vibratePattern = async (duration: number = 200) => {
  if (!isHapticsAvailable()) return;
  try {
    await Haptics.vibrate({ duration });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

// Convenience exports
export const haptics = {
  light: lightHaptic,
  medium: mediumHaptic,
  heavy: heavyHaptic,
  success: successHaptic,
  warning: warningHaptic,
  error: errorHaptic,
  selection: selectionHaptic,
  vibrate: vibratePattern,
};
