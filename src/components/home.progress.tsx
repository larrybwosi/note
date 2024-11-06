import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const progressData = [
  {
    title: 'Daily Tasks',
    progress: 0.7,
    color: '#FF6B6B',
    description: '7 of 10 tasks completed today',
  },
  {
    title: 'Workout Goals',
    progress: 0.5,
    color: '#45B7D1',
    description: '30 mins of 60 mins target achieved',
  },
  {
    title: 'Savings Target',
    progress: 0.3,
    color: '#96CEB4',
    description: '$420 saved of $1,400 monthly goal',
  },
];

const ProgressBar = ({ progress, color }: any) => {
  const widthAnim = useSharedValue(0);

  useEffect(() => {
    widthAnim.value = withSpring(progress);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
  }));

  return (
    <View className={`h-3 dark:bg-gray-800 bg-gray-100 rounded-full w-full mt-2`}>
      <Animated.View
        className="h-full rounded-full"
        style={[{ backgroundColor: color }, animatedStyle]}
      />
    </View>
  );
};
const Progress = () => {
  return (
    <View className="px-6 mt-8">
      <Text className={`text-2xl font-rbold mb-2 dark:text-white text-gray-800`}>
        Your Progress Journey
      </Text>
      <Text className={`dark:text-gray-400 text-gray-500 mb-4 font-aregular`}>
        Getting better every day
      </Text>
      {progressData.map((item, index) => (
        <Animated.View
          key={item.title}
          entering={FadeInRight.delay(index * 200).springify()}
          className={`dark:bg-gray-900/50 dark:border-gray-800 bg-white/10 
            p-5 rounded-xl mb-4 shadow-lg border border-gray-100`}
        >
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`dark:text-white text-gray-800 font-rbold text-lg`}>{item.title}</Text>
            <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              <Text className={`dark:text-gray-300 text-gray-600 font-rmedium`}>
                {Math.round(item.progress * 100)}%
              </Text>
            </View>
          </View>
          <Text className={`dark:text-gray-400 text-gray-500 text-sm mb-3`}>
            {item.description}
          </Text>
          <ProgressBar progress={item.progress} color={item.color} />
        </Animated.View>
      ))}
    </View>
  );
};

export default Progress;
