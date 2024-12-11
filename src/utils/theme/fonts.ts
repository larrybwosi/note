import { FontFamily, FontWeight } from "./ts";
import { useMemo } from 'react';

export const fontWeightToFamily: Record<FontWeight, Partial<Record<string, FontFamily>>> = {
  thin: {
    poppins: 'pthin',
    roboto: 'rthin',
  },
  extralight: {
    poppins: 'pextralight',
  },
  light: {
    poppins: 'plight',
  },
  regular: {
    poppins: 'pregular',
    roboto: 'rregular',
    archivo: 'aregular',
    playfair: 'plregular',
  },
  medium: {
    poppins: 'pmedium',
    roboto: 'rmedium',
  },
  semibold: {
    poppins: 'psemibold',
  },
  bold: {
    poppins: 'pbold',
    roboto: 'rbold',
  },
  extrabold: {
    poppins: 'pextrabold',
  },
  black: {
    poppins: 'pblack',
  },
};

type UseFontProps = {
  family?: string;
  weight?: FontWeight;
};

export const useFont = ({ family = 'roboto', weight = 'regular' }: UseFontProps = {}) => {
  return useMemo(() => {
    const fontFamily = fontWeightToFamily[weight]?.[family] ?? 'rregular';
    return fontFamily;
  }, [family, weight]);
};


export const customFontsToLoad = {
  'roboto-regular': require('../../../assets/fonts/Roboto-Regular.ttf'),
  'roboto-bold':require('../../../assets/fonts/Roboto-Bold.ttf'),
  'roboto-medium':require('../../../assets/fonts/Roboto-Medium.ttf'),
  'roboto-thin':require('../../../assets/fonts/Roboto-Thin.ttf'),
  'Archivo-Regular':require('../../../assets/fonts/Archivo-Regular.ttf'),
  'Archivo-Medium':require('../../../assets/fonts/Archivo-SemiBold.ttf'),
  'Archivo-Bold':require('../../../assets/fonts/Archivo-Black.ttf'),
  'Playfair-Regular':require('../../../assets/fonts/Playfair-Regular.ttf'),
  'Playfair-Bold':require('../../../assets/fonts/Playfair-Bold.ttf'),
};