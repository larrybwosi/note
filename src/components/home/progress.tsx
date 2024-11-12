import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons'; 

const progressData = [
  {
    title: 'Daily Tasks',
    progress: 0.7,
    color: '#FF6B6B',
    description: '7 of 10 tasks completed today',
    icon: 'checkmark-done-outline',
  },
  {
    title: 'Workout Goals',
    progress: 0.5,
    color: '#45B7D1',
    description: '30 mins of 60 mins target achieved',
    icon: 'fitness-outline',
  },
  {
    title: 'Savings Target',
    progress: 0.3,
    color: '#96CEB4',
    description: '$420 saved of $1,400 monthly goal',
    icon: 'wallet-outline',
  },
];

const ProgressBar = ({ progress, color }:any) => {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withSpring(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
  }));

  return (
    <View className="h-3 bg-gray-200 rounded-full w-full mt-2 overflow-hidden">
      <Animated.View
        style={[{ backgroundColor: color }, animatedStyle]}
        className="h-full rounded-full shadow-md"
      />
    </View>
  );
};

const Progress = () => {
  return (
    <View className="px-6 mt-8">
      <Text className="text-2xl font-rbold mb-2 text-gray-800 dark:text-white">
        Your Progress Journey
      </Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-4 font-aregular">
        Keep pushing forward!
      </Text>
      {progressData.map((item, index) => (
        <Animated.View
          key={item.title}
          entering={FadeInRight.delay(index * 200).springify()}
          className="dark:bg-gray-900/50 dark:border-gray-800 bg-white p-5 rounded-2xl mb-4 shadow-lg border border-gray-100"
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Ionicons name={item.icon as any} size={24} color={item.color} className="mr-3" />
              <Text className="text-lg font-rbold text-gray-800 dark:text-white">
                {item.title}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <Text className="text-gray-600 dark:text-gray-300 font-rmedium">
                {Math.round(item.progress * 100)}%
              </Text>
            </View>
          </View>
          <Text className="text-sm mb-3 text-gray-500 dark:text-gray-400">
            {item.description}
          </Text>
          <ProgressBar progress={item.progress} color={item.color} />
        </Animated.View>
      ))}
    </View>
  );
};

export default Progress;
