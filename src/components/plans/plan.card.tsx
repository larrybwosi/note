import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface PlanCardProps {
  plan: {
    name: string;
    price: string;
    icon: React.ElementType;
    color: string;
    features: string[];
    description: string;
    popularityScore: number;
    recommended?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isSelected, onSelect }) => {
  const { name, price, icon: Icon, color, features, description, popularityScore, recommended } = plan;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        className={`
          p-6 rounded-2xl shadow-lg my-2
          ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900' : 'bg-white dark:bg-gray-800'}
        `}
        style={{
          borderWidth: 2,
          borderColor: isSelected ? color : 'transparent',
        }}
      >
        {recommended && (
          <View className="absolute -top-3 -right-3 bg-yellow-400 px-3 py-1 rounded-full">
            <Text className="text-xs font-rbold text-gray-900">Recommended</Text>
          </View>
        )}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon color={color} size={24} />
            </View>
            <Text className="text-xl font-rbold text-gray-900 dark:text-white">
              {name}
            </Text>
          </View>
          <View>
            <Text className="text-2xl font-rbold text-indigo-600 dark:text-indigo-400">
              {price}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">per month</Text>
          </View>
        </View>
        <Text className="text-gray-600 dark:text-gray-300 font-aregular mb-4">
          {description}
        </Text>
        <View className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-center">
              <Check size={16} color={color} className="mr-2" />
              <Text className="text-gray-600 dark:text-gray-300 font-aregular">
                {feature}
              </Text>
            </View>
          ))}
        </View>
        <View className="bg-gray-100 dark:bg-gray-700 rounded-full h-2 w-full">
          <View 
            className="bg-green-500 rounded-full h-2" 
            style={{ width: `${popularityScore}%` }} 
          />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {popularityScore}% of users choose this plan
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

