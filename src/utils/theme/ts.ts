export type FontFamily = 
  | 'courier' 
  | 'sansSerif' 
  | 'monospace' 
  | 'roboto'
  | 'pthin' 
  | 'pextralight' 
  | 'plight' 
  | 'pregular'
  | 'pmedium' 
  | 'psemibold' 
  | 'pbold' 
  | 'pextrabold'
  | 'pblack' 
  | 'rthin' 
  | 'rregular' 
  | 'rmedium' 
  | 'rbold'
  | 'aregular'
  | 'plregular';

export type FontWeight = 
  | 'thin'
  | 'extralight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

export type FontSize = {
  size: number;
  lineHeight: number;
};

export type FontSizes = {
  xs: FontSize;
  sm: FontSize;
  base: FontSize;
  lg: FontSize;
  xl: FontSize;
  '2xl': FontSize;
  '3xl': FontSize;
  '4xl': FontSize;
};


export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
};

export type ThemeConfig = {
  colors: ThemeColors;
  defaultFont: FontFamily;
  defaultFontSize: keyof FontSizes;
  fontSizes: FontSizes;
  isDarkMode: boolean;
};
