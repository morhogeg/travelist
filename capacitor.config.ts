import type { CapacitorConfig } from '@capacitor/cli';

// Load dev or prod config based on NODE_ENV
// Use: npm run cap:dev or npm run cap:prod
const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'com.travelist.app',
  appName: 'Travelist',
  webDir: 'dist',
  // Live reload enabled - changes auto-update in simulator!
  ...(isDev && {
    server: {
      url: 'http://192.168.0.108:5173',
      cleartext: true
    }
  }),
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
