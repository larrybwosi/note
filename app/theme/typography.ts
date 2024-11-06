// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"

export const customFontsToLoad = {
  'roboto-regular': "https://cdn.sanity.io/files/mqczcmfz/production/56c5c0d38bde4c1f1549dda43db37b09c608aad3.ttf",
  'roboto-bold': "https://cdn.sanity.io/files/mqczcmfz/production/3f8e401d808f6ce84b542266726514ac8be73171.ttf",
  'roboto-medium': "https://cdn.sanity.io/files/mqczcmfz/production/3c6a09fcc6a454924c81af7dff94fc6d399ed79b.ttf",
  'roboto-thin': "https://cdn.sanity.io/files/mqczcmfz/production/58c733e22bceeaf9609ce578eca92ac303c6d92f.ttf",
  "Poppins-Bold": "https://cdn.sanity.io/files/mqczcmfz/production/875cf0cecd647bcf22e79d633d868c1b1ec98dfa.ttf",
  "Poppins-Medium": "https://cdn.sanity.io/files/mqczcmfz/production/283f21b44efbdbf276ba802be2d949a36bbc4233.ttf",
  "Archivo-Regular": "https://cdn.sanity.io/files/mqczcmfz/production/c14f15d27da595dcfe84fde32fdb75fc1e970e46.ttf",
  "Playfair-Regular": "https://cdn.sanity.io/files/mqczcmfz/production/96a2e660869a872971935d18105d64eadd693ddb.ttf",
  "Playfair-Bold": "https://cdn.sanity.io/files/mqczcmfz/production/fb74d7e889a2c24dc08d5b931c620d47e607d11a.ttf",
}

const fonts = {
  spaceGrotesk: {
    // Cross-platform Google font.
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

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
}
