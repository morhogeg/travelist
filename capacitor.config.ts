import type { CapacitorConfig } from '@capacitor/cli';

// Load dev or prod config based on NODE_ENV
// Use: npm run cap:dev or npm run cap:prod
const isDev = process.env.NODE_ENV !== 'production';

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
  server: process.env.USE_DEV_SERVER === 'true' ? {
    url: 'http://localhost:5173',
    cleartext: true,
    iosScheme: 'travelist'
  } : undefined,
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      backgroundColor: '#000000',
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
