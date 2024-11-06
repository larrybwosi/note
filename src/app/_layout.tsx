import { useEffect } from "react"
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { colorScheme as colorSchemeNW } from "nativewind"
import { SplashScreen, Stack } from "expo-router"
import { ViewStyle } from "react-native"
import { useFonts } from "expo-font"
// @mst replace-next-line
import { initializeNotifications } from "src/store/shedule/notifications"
import { customFontsToLoad } from "@/theme"
import './global.css'
import ModalProvider from "src/components/modals/provider"
// bf94542d-923b-4506-8a8b-b8a2baac45ca


SplashScreen.preventAutoHideAsync()
enableReactTracking({
  warnUnobserved: true,
})

export default function Root() {
  const [loaded, fontError] = useFonts(customFontsToLoad)


// setInterval(checkOverdueTasks, 60 * 60 * 1000);

  useEffect(() => {
    if (fontError) throw fontError
    if (loaded) {
      SplashScreen.hideAsync()
    }
    initializeNotifications()
  }, [loaded,fontError])

  if (!loaded) {
    return null
  }
  const theme = colorSchemeNW.get()

  return (
    <GestureHandlerRootView style={$root}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <ModalProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </ModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

const $root: ViewStyle = { flex: 1 }
