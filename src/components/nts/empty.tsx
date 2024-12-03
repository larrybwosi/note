import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useComputed } from '@legendapp/state/react';
import { NotebookPen } from 'lucide-react-native';
import { colorScheme } from 'nativewind';

import { categories, themes } from 'src/store/notes/data';

interface ChipProps {
  label: 'all' | string;
  colorScheme: {
    gradient: [string, string];
  };
}

const Chip: React.FC<ChipProps> = ({ label, colorScheme }) => (
  <LinearGradient
    colors={label === 'all' ? ['#CBD5E1', '#94A3B8'] : colorScheme.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
  >
    <Text className='capitalize font-amedium text-sm text-gray-200'>
      {label}
    </Text>
  </LinearGradient>
);
export const EmptyState: React.FC = () => {
  const theme = useComputed(() => themes[colorScheme.get()!]);
  return (
    <Animated.View 
      entering={FadeInDown}
      className="items-center px-6 pt-10"
    >
      <NotebookPen size={80} color={theme.get().secondary} />
      <Text className={`text-2xl font-amedium mt-6 mb-3 dark:text-white text-gray-800`}>
        Start Your Journey
      </Text>
      <Text className={`text-center font-aregular text-base mb-6 leading-6 dark:text-white text-gray-600`}>
        Create your first note by tapping the + button below.
        Organize your thoughts across different categories:
      </Text>
      <View className="flex-row flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Chip key={category.id} label={category.name} colorScheme={category.colorScheme || { gradient: ['#CBD5E1', '#94A3B8'] }} />
        ))}
      </View>
    </Animated.View>
  );
};

