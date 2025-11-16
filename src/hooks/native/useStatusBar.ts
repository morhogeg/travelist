import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface UseStatusBarOptions {
  style?: 'light' | 'dark';
  backgroundColor?: string;
  hide?: boolean;
  overlay?: boolean;
}

/**
 * Hook for controlling iOS status bar appearance
 *
 * @example
 * // Light content (for dark backgrounds)
 * useStatusBar({ style: 'light' });
 *
 * @example
 * // Dark content (for light backgrounds)
 * useStatusBar({ style: 'dark' });
 *
 * @example
 * // Hide status bar
 * useStatusBar({ hide: true });
 */
export const useStatusBar = (options: UseStatusBarOptions = {}) => {
  const {
    style = 'dark',
    backgroundColor,
    hide = false,
    overlay = true,
  } = options;

  useEffect(() => {
    // Only run on iOS platform
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return;
    }

    const setupStatusBar = async () => {
      try {
        if (hide) {
          await StatusBar.hide();
        } else {
          await StatusBar.show();

          // Set style (light text or dark text)
          const statusBarStyle: Style = style === 'light' ? Style.Dark : Style.Light;
          await StatusBar.setStyle({ style: statusBarStyle });

          // Set overlay (allows content to flow under status bar)
          if (overlay) {
            await StatusBar.setOverlaysWebView({ overlay: true });
          }

          // Set background color if provided
          if (backgroundColor) {
            await StatusBar.setBackgroundColor({ color: backgroundColor });
          }
        }
      } catch (error) {
        console.error('Error setting status bar:', error);
      }
    };

    setupStatusBar();
  }, [style, backgroundColor, hide, overlay]);

  return {
    show: async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.show();
      }
    },
    hide: async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.hide();
      }
    },
    setStyle: async (newStyle: 'light' | 'dark') => {
      if (Capacitor.isNativePlatform()) {
        const statusBarStyle: Style = newStyle === 'light' ? Style.Dark : Style.Light;
        await StatusBar.setStyle({ style: statusBarStyle });
      }
    },
  };
};

/**
 * Hook to automatically set status bar based on theme
 */
export const useStatusBarTheme = (theme: 'light' | 'dark') => {
  // For dark theme, use light text
  // For light theme, use dark text
  const statusBarStyle = theme === 'dark' ? 'light' : 'dark';

  return useStatusBar({ style: statusBarStyle });
};
