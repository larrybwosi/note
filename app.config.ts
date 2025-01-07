import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Note',
  slug: 'Note',
  scheme: 'note',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
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
  plugins: [
    'expo-font',
    'expo-location',
    [
      'expo-notifications',
      {
        icon: './assets/images/app-icon-ios.png',
        color: '#ffffff',
        defaultChannel: 'default',
        sounds: [
          './assets/sounds/not1.wav',
          './assets/sounds/not2.wav',
          './assets/sounds/not3.wav',
          './assets/sounds/not4.wav',
        ],
        enableBackgroundRemoteNotifications: false,
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'dealio',
        organization: 'clevery',
      },
    ],
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