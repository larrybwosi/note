import { useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import { Slot, SplashScreen, Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// @mst replace-next-line
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { customFontsToLoad } from "@/theme"
import { colorScheme as colorSchemeNW } from "nativewind"
// bf94542d-923b-4506-8a8b-b8a2baac45ca
SplashScreen.preventAutoHideAsync()
import './global.css'
import { enableReactTracking } from "@legendapp/state/config/enableReactTracking"
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native"
enableReactTracking({
  warnUnobserved: true,
})

export default function Root() {
  const [loaded, fontError] = useFonts(customFontsToLoad)

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }
  const theme = colorSchemeNW.get()

  return (
    <GestureHandlerRootView style={$root}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

const $root: ViewStyle = { flex: 1 }
