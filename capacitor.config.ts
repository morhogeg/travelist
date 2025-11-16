import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.travelist.app',
  appName: 'Travelist',
  webDir: 'dist',
  server: {
    // LIVE RELOAD - For development only
    // Comment out these lines before building for production/App Store
    url: 'http://192.168.0.108:5174',
    cleartext: true
  }
};

export default config;
