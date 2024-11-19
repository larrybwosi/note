import { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Menu } from 'lucide-react-native';

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

const RenderQuickAction = memo(({ item, index }: { item: QuickAction; index: number }) => (
  <Animated.View
    entering={FadeInDown.delay(index * 100).springify()}
    className="w-[250px] mr-4"
  >
    <TouchableOpacity
      className="flex-1 mx-2 mb-4"
      style={{ transform: [{ scale: 1 }] }}
    >
      <LinearGradient
        colors={[item.color, '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="dark:bg-gray-900 bg-white p-6 rounded-3xl shadow-lg border dark:border-gray-800 border-gray-100"
        style={{
          borderLeftWidth: 4,
          borderBottomLeftRadius: 40,
          borderTopRightRadius: 40,
        }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: item.color }}
        >
          {item.icon}
        </View>

        <Text className="dark:text-white text-gray-800 text-xl font-rbold mb-2">{item.title}</Text>
        <Text className="dark:text-gray-400 text-gray-500 text-sm mb-3 font-aregular">{item.count}</Text>
        <Text className="dark:text-gray-500 text-gray-600 text-xs leading-relaxed font-aregular">
          {item.description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
));
RenderQuickAction.displayName = 'RenderQuickAction';

const QuickActionsSection = memo(({ quickActions, isDark }: QuickActionsSectionProps) => {
  return (
    <View className={`px-4 mt-2 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={`text-3xl font-rbold ${isDark ? 'text-white' : 'text-gray-800'} px-2`}
        >
          Quick Actions 
        </Text>
        <Menu
          size={24}
          color={isDark ? '#fff' : '#4a5568'}
          className="mr-2"
        />
      </View>
      <Text className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-lg mb-6 px-2`}>
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

export default QuickActionsSection;