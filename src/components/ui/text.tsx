// components/ThemedText.tsx
import { useTheme } from '@react-navigation/native';
import { Text } from 'react-native';
import { useFont } from 'src/utils/theme/fonts';

import { FontFamily, FontSizes, FontWeight } from 'src/utils/theme/ts';

type ThemedTextProps = {
  children: React.ReactNode;
  className?: string;
  size?: keyof FontSizes;
  family?: string;
  weight?: FontWeight;
  font?: FontFamily; // Direct font family override
};

export const ThemedText = ({ 
  children, 
  className = '',
  size,
  family,
  weight,
  font,
}: ThemedTextProps) => {
  const { colors,dark } = useTheme();
  const fontFamily = useFont({ family, weight });
  const effectiveFontFamily = font ?? fontFamily;
  const fontSize = size ? theme.fontSizes[size] : theme.fontSizes[theme.defaultFontSize];
  
  return (
    <Text
      className={`${className} font-${effectiveFontFamily}`}
      style={{
        color: colors.text,
        fontSize: fontSize.size,
        lineHeight: fontSize.lineHeight,
      }}
    >
      {children}
    </Text>
  );
};