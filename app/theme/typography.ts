// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from 'react-native';

export const customFontsToLoad = {
  'roboto-regular': require('../../assets/fonts/Roboto-Regular.ttf'),
  'roboto-bold':require('../../assets/fonts/Roboto-Bold.ttf'),
  'roboto-medium':require('../../assets/fonts/Roboto-Medium.ttf'),
  'roboto-thin':require('../../assets/fonts/Roboto-Thin.ttf'),
  'Archivo-Regular':require('../../assets/fonts/Archivo-Regular.ttf'),
  'Archivo-Medium':require('../../assets/fonts/Archivo-SemiBold.ttf'),
  'Archivo-Bold':require('../../assets/fonts/Archivo-Black.ttf'),
  'Playfair-Regular':require('../../assets/fonts/Playfair-Regular.ttf'),
  'Playfair-Bold':require('../../assets/fonts/Playfair-Bold.ttf'),
};

const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    light: 'spaceGroteskLight',
    normal: 'spaceGroteskRegular',
    medium: 'spaceGroteskMedium',
    semiBold: 'spaceGroteskSemiBold',
    bold: 'spaceGroteskBold',
  },
  helveticaNeue: {
    // iOS only font.
    thin: 'HelveticaNeue-Thin',
    light: 'HelveticaNeue-Light',
    normal: 'Helvetica Neue',
    medium: 'HelveticaNeue-Medium',
  },
  courier: {
    // iOS only font.
    normal: 'Courier',
  },
  sansSerif: {
    // Android only font.
    thin: 'sans-serif-thin',
    light: 'sans-serif-light',
    normal: 'sans-serif',
    medium: 'sans-serif-medium',
  },
  monospace: {
    // Android only font.
    normal: 'monospace',
  },
};

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.spaceGrotesk,
  /**
   * An alternate font used for perhaps titles and stuff.
   */
  secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
};
