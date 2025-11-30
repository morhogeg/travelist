import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelist.app',
  appName: 'Travelist',
  webDir: 'dist',
  packageClassList: [
    'AppPlugin',
    'HapticsPlugin',
    'KeyboardPlugin',
    'SharePlugin',
    'SplashScreenPlugin',
    'StatusBarPlugin',
    'SharedInboxPlugin',
  ],
  // NO live reload for production
  server: {
    iosScheme: 'travelist',
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
