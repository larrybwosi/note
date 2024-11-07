import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface FocusTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string[];
}

interface FocusInsightsSectionProps {
  focusTips: FocusTip[];
  isDark: boolean;
}

const FocusTipCard = React.memo(({ icon, title, description, gradient }: FocusTip) => (
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

export const FocusInsightsSection = React.memo(({ focusTips, isDark }: FocusInsightsSectionProps) => {
  return (
    <View className={`px-6 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Text
        className={`text-3xl font-rbold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
      >
        Today's Insights
      </Text>
      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6 text-base`}>
        Maximize your potential with these personalized tips
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingRight: 24 }}
      >
        {focusTips.map((tip, index) => (
          <View key={index} style={{ width: 280 }} className="mr-4">
            <FocusTipCard {...tip} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
});
