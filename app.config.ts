import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Note',
  slug: 'Note',
  scheme: 'note',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/images/app-icon-all.png',
  splash: {
    image: './assets/images/splash-logo-all.png',
    resizeMode: 'contain',
    backgroundColor: '#191015',
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  jsEngine: 'hermes',
  assetBundlePatterns: ['**/*'],
  android: {
    icon: './assets/images/app-icon-android-legacy.png',
    package: 'com.note',
    adaptiveIcon: {
      foregroundImage: './assets/images/app-icon-android-adaptive-foreground.png',
      backgroundImage: './assets/images/app-icon-android-adaptive-background.png',
    },
    splash: {
      image: './assets/images/splash-logo-android-universal.png',
      resizeMode: 'contain',
      backgroundColor: '#191015',
    },
  },
  ios: {
    icon: './assets/images/app-icon-ios.png',
    supportsTablet: true,
    bundleIdentifier: 'com.note',
    splash: {
      image: './assets/images/splash-logo-ios-mobile.png',
      tabletImage: './assets/images/splash-logo-ios-tablet.png',
      resizeMode: 'contain',
      backgroundColor: '#191015',
    },
  },
  web: {
    favicon: './assets/images/app-icon-web-favicon.png',
    splash: {
      image: './assets/images/splash-logo-web.png',
      resizeMode: 'contain',
      backgroundColor: '#191015',
    },
    bundler: 'metro',
  },
  plugins: [
    'expo-font',
    'expo-location',
    "expo-secure-store"
  ],
  experiments: {
    tsconfigPaths: true,
  },
  extra: {
    eas: {
      projectId: 'bf94542d-923b-4506-8a8b-b8a2baac45ca',
    },
  },
};

export default config;
