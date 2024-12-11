import React from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  color = '#3B82F6',
  showPercentage = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const animatedWidth = useAnimatedStyle(() => {
    return {
      width: withTiming(`${percentage}%`, { duration: 600 }),
    };
  });

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </Text>
      )}
      <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <Animated.View
          style={[animatedWidth, { backgroundColor: color }]}
          className="h-full rounded-full"
        />
      </View>
      {showPercentage && (
        <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
          {percentage.toFixed(0)}%
        </Text>
      )}
    </View>
  );
};
