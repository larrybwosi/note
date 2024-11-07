import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

interface HeaderSectionProps {
  timeOfDay: string;
  name: string;
  greeting: string;
  quote: { quote: string; author: string };
  scrollY: Animated.SharedValue<number>;
}

export const HeaderSection = React.memo(({ timeOfDay, name, greeting, quote, scrollY }: HeaderSectionProps) => {
  const welcomeScale = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={welcomeScale} className="space-y-3">
      <Text className="text-white text-3xl font-rbold">
        Good {timeOfDay}, {name}! ✨
      </Text>
      <Text className="text-gray-100 text-base font-aregular">{greeting}</Text>
      <View className="mt-4 bg-white/10 p-4 rounded-2xl backdrop-blur-lg">
        <Text className="text-white font-rmedium">{quote.quote}</Text>
        <Text className="text-gray-200 mt-2 font-plregular">- {quote.author}</Text>
      </View>
    </Animated.View>
  );
});