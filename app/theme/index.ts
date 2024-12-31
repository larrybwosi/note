import type { StyleProp } from 'react-native';
import { colors as colorsLight } from './colors';
import { colors as colorsDark } from './colorsDark';
import { spacing as spacingLight } from './spacing';
import { spacing as spacingDark } from './spacingDark';
import { timing } from './timing';

// This supports "light" and "dark" themes by default. If undefined, it'll use the system theme
export type ThemeContexts = 'light' | 'dark' | undefined;

// Because we have two themes, we need to define the types for each of them.
// colorsLight and colorsDark should have the same keys, but different values.
export type Colors = typeof colorsLight | typeof colorsDark;
// The spacing type needs to take into account the different spacing values for light and dark themes.
export type Spacing = typeof spacingLight | typeof spacingDark;

// These two are consistent across themes.
export type Timing = typeof timing;

/**
 * Represents a function that returns a styled component based on the provided theme.
 * @template T The type of the style.
 * @param theme The theme object.
 * @returns The styled component.
 *
 * @example
 * const $container: ThemedStyle<ViewStyle> = (theme) => ({
 *   flex: 1,
 *   backgroundColor: theme.colors.background,
 *   justifyContent: "center",
 *   alignItems: "center",
 * })
 * // Then use in a component like so:
 * const Component = () => {
 *   const { themed } = useAppTheme()
 *   return <View style={themed($container)} />
 * }
 */
// Export the theme objects with backwards compatibility for the old theme structure.
export { colorsLight as colors };
export { colorsDark };
export { spacingLight as spacing };

export * from './styles';
export * from './timing';
