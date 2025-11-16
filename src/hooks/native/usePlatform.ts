import { Capacitor } from '@capacitor/core';

/**
 * Hook for detecting the current platform
 */
export const usePlatform = () => {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  return {
    platform,
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  };
};
