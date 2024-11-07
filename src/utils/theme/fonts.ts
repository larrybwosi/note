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