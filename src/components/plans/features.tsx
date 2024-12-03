import { View, Text } from 'react-native';
import { Check, LucideIcon } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

interface Feature {
  icon: LucideIcon;
  text: string;
}

interface FeatureListProps {
  features: Feature[] | string[];
}

export const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  const renderFeature = (feature: Feature | string, index: number) => {
    if (typeof feature === 'string') {
      return (
        <Animated.View
          key={index}
          entering={FadeInLeft.duration(600).delay(index * 100).springify()}
          className="flex-row items-center"
        >
          <View className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mr-4">
            <Check size={16} color="#10B981" />
          </View>
          <Text className="text-gray-700 dark:text-gray-300 font-aregular text-lg">
            {feature}
          </Text>
        </Animated.View>
      );
    }

    const Icon = feature.icon;
    return (
      <Animated.View
        key={index}
        entering={FadeInLeft.duration(600).delay(index * 100).springify()}
        className="flex-row items-center"
      >
        <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-4">
          <Icon size={20} color="#6366F1" />
        </View>
        <Text className="flex-1 text-gray-700 dark:text-gray-300 font-aregular text-lg">
          {feature.text}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View className="space-y-6">
      {features.map((feature, index) => renderFeature(feature, index))}
    </View>
  );
};
