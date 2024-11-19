import { useEffect } from 'react';
import { enableReactNativeComponents } from "@legendapp/state/config/enableReactNativeComponents";
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colorScheme as colorSchemeNW } from 'nativewind';
import { SplashScreen, Stack } from 'expo-router';
import { ViewStyle } from 'react-native';
import { useFonts } from 'expo-font';
import ModalProvider from 'src/components/modals/provider';
import { customFontsToLoad } from '@/theme';
import './global.css';

import { initializeNotifications } from 'src/utils/notifications';

// bf94542d-923b-4506-8a8b-b8a2baac45ca

SplashScreen.preventAutoHideAsync();

enableReactNativeComponents();
enableReactTracking({
  warnUnobserved: true,
  auto: true,
});


export default function Root() {
  const [loaded, fontError] = useFonts(customFontsToLoad);

  // setInterval(checkOverdueTasks, 60 * 60 * 1000);

  useEffect(() => {
    if (fontError) throw fontError;
    if (loaded) {
      SplashScreen.hideAsync();
    }
    initializeNotifications();
  }, [loaded, fontError]);

  if (!loaded) {
    return null;
  }
  const theme = colorSchemeNW.get();

  return (
    <GestureHandlerRootView style={$root}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <ModalProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="create.schedule" options={{ headerShown: false }} />
              <Stack.Screen name="create.transaction" options={{ headerShown: false }} />
              <Stack.Screen name="create.profile" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="create.note" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="ai.schedule" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="ai.transaction" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="finance_setup" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="other" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
          </ModalProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const $root: ViewStyle = { flex: 1 };
