import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { enhancedFocusTips } from './data';

interface FocusTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string[];
}

const FocusTipCard = memo(({ icon, title, description, gradient }: FocusTip) => (
  <Animated.View
    entering={FadeInDown.springify()}
    className="mb-4 overflow-hidden rounded-2xl shadow-lg"
  >
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="p-4"
    >
      <View className="flex-row items-center mb-2">
        <View className="bg-white/20 p-2 rounded-full mr-3">
          {icon}
        </View>
        <Text className="text-white font-rbold text-lg">{title}</Text>
      </View>
      <Text className="text-white/90 font-rregular text-sm leading-5">
        {description}
      </Text>
    </LinearGradient>
  </Animated.View>
));

export const FocusInsightsSection = memo(() => {
  return (
    <View className={`px-3 py-8 dark:bg-gray-900 bg-gray-50`}>
      <Text
        className={`text-3xl font-amedium mb-2 dark:text-white text-gray-800`}
      >
        Today's Insights
      </Text>
      <Text className={`dark:text-gray-400 text-gray-600 font-aregular mb-6 text-base`}>
        Maximize your potential with these personalized tips
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {enhancedFocusTips.map((tip, index) => (
          <View key={index} style={{ width: 280 }} className="mr-4">
            <FocusTipCard {...tip} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});
