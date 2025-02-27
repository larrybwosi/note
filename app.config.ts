import { ExpoConfig } from 'expo/config';
import { withSentry } from '@sentry/react-native/expo';

const config: ExpoConfig = {
  name: 'Dealio',
  slug: 'Note',
  scheme: 'dealio',
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
  plugins: [
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './assets/images/app-icon-ios.png',
        color: '#ffffff',
        defaultChannel: 'default',
        sounds: [
          './assets/sounds/not1.wav',
        ],
        enableBackgroundRemoteNotifications: true,
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

export default withSentry(config, {
	url: 'https://sentry.io/',
	project: 'finance',
	organization: 'clevery'
});