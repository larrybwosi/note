import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  count: string;
  color: string;
  description: string;
  route?: string;
}

interface QuickActionsSectionProps {
  quickActions: QuickAction[];
  isDark: boolean;
}

const RenderQuickAction = React.memo(({ item, index }: { item: QuickAction; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).springify()}
    className="w-[250px] mr-4"
  >
    <TouchableOpacity
      className={`dark:bg-gray-900 dark:border-gray-800 bg-white border-gray-100 p-6 rounded-3xl shadow-lg flex-1 mx-2 mb-4 border`}
      style={{ borderLeftWidth: 4, transform: [{ scale: 1 }] }}
    >
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: item.color }}
      >
        {item.icon}
      </View>

      <Text className={`dark:text-white text-gray-800 text-xl font-rbold mb-2`}>{item.title}</Text>
      <Text className={`dark:text-gray-400 text-gray-500 text-sm mb-3 font-aregular`}>{item.count}</Text>
      <Text className={`dark:text-gray-500 text-gray-600 text-xs leading-relaxed font-aregular`}>
        {item.description}
      </Text>
    </TouchableOpacity>
  </Animated.View>
));
RenderQuickAction.displayName = 'RenderQuickAction';

const QuickActionsSection = memo(({ quickActions}: QuickActionsSectionProps) => {
  return (
    <View className="px-4 mt-2">
      <Text
        className='text-3xl font-rbold mb-2 dark:text-white text-gray-800 px-2'
      >
        Quick Actions
      </Text>
      <Text className='dark:text-gray-400 text-gray-500 text-lg mb-6 px-2'>
        Your path to excellence
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={270}
        contentContainerStyle={{ paddingLeft: 8 }}
      >
        {quickActions.map((item, index) => (
          <RenderQuickAction key={index} item={item} index={index} />
        ))}
      </ScrollView>
    </View>
  );
});

QuickActionsSection.displayName = 'QuickActionsSection';

export default QuickActionsSection