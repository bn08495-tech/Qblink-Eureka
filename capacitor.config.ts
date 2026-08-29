import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qblink.app',
  appName: 'Qblink',
  webDir: 'dist',
  server: {
    url: 'https://qblink.vercel.app',
    cleartext: true,
  },
};

export default config;
