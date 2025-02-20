import { useEffect } from 'react';
import { enableReactNativeComponents } from "@legendapp/state/config/enableReactNativeComponents";
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { colorScheme } from 'nativewind';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar, ViewStyle } from 'react-native';
import { useFonts } from 'expo-font';
import * as Sentry from '@sentry/react-native';
import 'react-native-url-polyfill/auto';
import ModalProvider from 'src/components/modals/provider';
import './global.css';

import { customFontsToLoad } from 'src/utils/theme/fonts';
import GlobalProvider from 'src/lib/global.context';
import ErrorBoundary from 'src/lib/error';

// bf94542d-923b-4506-8a8b-b8a2baac45ca

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: false,
  tracesSampleRate: 1.0,
});

enableReactNativeComponents();
enableReactTracking({
  warnUnobserved: true,
  auto: true,
});


function Root() {
  const [loaded, fontError] = useFonts(customFontsToLoad);

  useEffect(() => {
    if (fontError) throw fontError;
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError]);

  if (!loaded) {
    return null;
  }
  const theme = colorScheme.get();

  return (
    <GestureHandlerRootView style={$root}>
      <StatusBar hidden backgroundColor={'gray'}/>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <ErrorBoundary onRetry={() => {}} onHomePress={() => router.navigate('/')}>
          <GlobalProvider>
            <ModalProvider>
              <KeyboardProvider>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="plans" options={{ headerShown: false }} />
                  <Stack.Screen name="create.transactions" options={{ headerShown: false, presentation: 'modal' }} />
                  <Stack.Screen name="setup" options={{ headerShown: false, presentation: 'modal' }} />
                  <Stack.Screen name="budget.planner" options={{ headerShown: false, presentation: 'modal' }} />
                  <Stack.Screen name="splash" options={{ headerShown: false, presentation: 'modal', statusBarHidden:true }} />
                  <Stack.Screen name="signup" options={{ headerShown: false, presentation: 'modal', statusBarHidden:true }} />
                  <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal', statusBarHidden:true }} />
                  <Stack.Screen name="ai.create.transaction" options={{ headerShown: false, presentation: 'modal', statusBarHidden:true }} />
                </Stack>
              </KeyboardProvider>
            </ModalProvider>
          </GlobalProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(Root);
const $root: ViewStyle = { flex: 1 };
