import { useEffect } from 'react';
import { enableReactNativeComponents } from "@legendapp/state/config/enableReactNativeComponents";
// import { enableReactTracking } from '@legendapp/state/config/enableReactTracking';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import { colorScheme } from 'nativewind';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar, ViewStyle } from 'react-native';
import { useFonts } from 'expo-font';
import 'react-native-url-polyfill/auto';
// import * as Updates from 'expo-updates';
import './global.css';

import ErrorBoundary from 'src/lib/error';
import AuthProvider from 'src/utils/auth.provider';
import { FeedbackModalProvider } from 'src/components/ui/feedback';

Sentry.init({
	dsn: 'https://057dd094b79aa98c59f138fbdfacc62d@o4508136465956864.ingest.de.sentry.io/4508878482636880',
	spotlight: __DEV__,
});

SplashScreen.preventAutoHideAsync();

enableReactNativeComponents();
// enableReactTracking({
// 	warnMissingUse: true,
// });

const customFontsToLoad = {
	'roboto-regular': require('../../assets/fonts/Roboto-Regular.ttf'),
	'roboto-bold': require('../../assets/fonts/Roboto-Bold.ttf'),
	'roboto-medium': require('../../assets/fonts/Roboto-Medium.ttf'),
	'roboto-thin': require('../../assets/fonts/Roboto-Thin.ttf'),
	'Archivo-Regular': require('../../assets/fonts/Archivo-Regular.ttf'),
	'Archivo-Medium': require('../../assets/fonts/Archivo-SemiBold.ttf'),
	'Archivo-Bold': require('../../assets/fonts/Archivo-Black.ttf'),
 };

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
// () => Updates.reloadAsync();
  return (
		<GestureHandlerRootView style={$root}>
			<StatusBar hidden backgroundColor={'gray'} />
			<ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
				<ErrorBoundary onReset={() => {}}>
					<KeyboardProvider>
						<FeedbackModalProvider>
							{/* <AuthProvider> */}
								<Stack>
									<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
									<Stack.Screen
										name="create.transactions"
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
										name="settings"
										options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
									/>
									<Stack.Screen
										name="create-edit-budget"
										options={{ headerShown: false, presentation: 'modal', statusBarHidden: true }}
									/>
								</Stack>
							{/* </AuthProvider> */}
						</FeedbackModalProvider>
					</KeyboardProvider>
				</ErrorBoundary>
			</ThemeProvider>
		</GestureHandlerRootView>
	);
}

export default Sentry.wrap(Root);
const $root: ViewStyle = { flex: 1 };
