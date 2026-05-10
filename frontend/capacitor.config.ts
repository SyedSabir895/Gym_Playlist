import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.NODE_ENV === 'development';

const config: CapacitorConfig = {
  appId: 'com.gym.videos',
  appName: 'ChestBuster',
  webDir: 'dist',
  // During development, point to your Vite dev server for live reload
  server: isDev
    ? {
        url: 'http://10.0.2.2:3000', // 10.0.2.2 = localhost from Android emulator
        cleartext: true,             // Allow HTTP (non-HTTPS) in dev
      }
    : undefined,
  android: {
    allowMixedContent: true,         // Allow HTTP API calls alongside HTTPS
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'automatic',
  },
  plugins: {
    GoogleAuth: {
      // Use your Web Application Client ID here — works for both web and Android
      clientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
      // @ts-ignore - plugin supports this but types might be outdated
      grantOfflineAccess: true,
    },
  },
};

export default config;

