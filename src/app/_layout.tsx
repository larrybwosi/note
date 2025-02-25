import { useEffect } from 'react';
import { enableReactNativeComponents } from "@legendapp/state/config/enableReactNativeComponents";
import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller'
import * as Sentry from '@sentry/react-native';
import { colorScheme } from 'nativewind';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar, ViewStyle } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-url-polyfill/auto';
import ModalProvider from 'src/components/modals/provider';
import './global.css';

import { customFontsToLoad } from 'src/utils/theme/fonts';
import GlobalProvider from 'src/lib/global.context';
import ErrorBoundary from 'src/lib/error';
import { SafeAreaProvider } from 'react-native-safe-area-context';

Sentry.init({
	dsn: 'https://057dd094b79aa98c59f138fbdfacc62d@o4508136465956864.ingest.de.sentry.io/4508878482636880',

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: __DEV__,
});

// bf94542d-923b-4506-8a8b-b8a2baac45ca

SplashScreen.preventAutoHideAsync();

enableReactNativeComponents();
// enableReactTracking({
// 	warnMissingUse: true,
// });


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
			<StatusBar hidden backgroundColor={'gray'} />
			<ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
				<ErrorBoundary onRetry={() => {}} onHomePress={() => router.navigate('/')}>
					<SafeAreaProvider>
						<GlobalProvider>
							<ModalProvider>
								<KeyboardProvider>
									<Stack>
										<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
										<Stack.Screen name="plans" options={{ headerShown: false }} />
										<Stack.Screen
											name="create.transactions"
											options={{ headerShown: false, presentation: 'modal' }}
										/>
										<Stack.Screen
											name="setup"
											options={{ headerShown: false, presentation: 'modal' }}
										/>
										<Stack.Screen
											name="budget.planner"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="splash"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="signup"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="login"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="transactions"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="categories"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="profile_update"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="ai.create.transaction"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="categoryId"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
										<Stack.Screen
											name="settings"
											options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
										/>
									</Stack>
								</KeyboardProvider>
							</ModalProvider>
						</GlobalProvider>
					</SafeAreaProvider>
				</ErrorBoundary>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

export default Sentry.wrap(Root);
const $root: ViewStyle = { flex: 1 };
