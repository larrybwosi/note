import { useEffect } from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';

// Enhanced progress data with more realistic and engaging content
const progressData = [
  {
    title: 'Daily Tasks',
    progress: 0.8,
    color: '#FF6B6B',
    description: '12 of 15 tasks completed today',
    icon: 'checkmark-done-outline',
    details: {
      completed: ['Team meeting', 'Project review', 'Email responses'],
      pending: ['Final report', 'Client call'],
      streak: 5,
    },
    trend: 'up',
  },
  {
    title: 'Fitness Goals',
    progress: 0.65,
    color: '#45B7D1',
    description: '6,500 of 10,000 steps',
    icon: 'fitness-outline',
    details: {
      calories: 420,
      duration: '45 mins',
      activities: ['Running', 'Yoga'],
      streak: 3,
    },
    trend: 'up',
  },
  {
    title: 'Monthly Budget',
    progress: 0.7,
    color: '#96CEB4',
    description: '$1,400 saved of $2,000 target',
    icon: 'wallet-outline',
    details: {
      saved: 1400,
      target: 2000,
      categories: ['Groceries', 'Transport', 'Entertainment'],
      trend: '+15%',
    },
    trend: 'up',
  },
  {
    title: 'Learning Goals',
    progress: 0.45,
    color: '#FFB347',
    description: '3 of 7 chapters completed',
    icon: 'book-outline',
    details: {
      course: 'React Native Advanced',
      timeSpent: '2.5 hours',
      nextMilestone: 'Animation Module',
      streak: 8,
    },
    trend: 'same',
  },
];

interface ProgressBarProps {
  progress: number;
  color: string;
  animate?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, animate = true }) => {
  const widthAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    if (animate) {
      widthAnim.value = 0;
      widthAnim.value = withDelay(300, withSpring(progress, {
        damping: 15,
        stiffness: 90,
      }));
    } else {
      widthAnim.value = progress;
    }
  }, [progress]);

  // Pulse animation when reaching 100%
  useEffect(() => {
    if (progress >= 1) {
      scaleAnim.value = withSequence(
        withSpring(1.1, { damping: 2, stiffness: 80 }),
        withSpring(1, { damping: 15, stiffness: 90 })
      );
    }
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value * 100}%`,
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-full mt-2 overflow-hidden">
      <Animated.View
        style={[{ backgroundColor: color }, animatedStyle]}
        className="h-full rounded-full shadow-sm"
      />
    </View>
  );
};

const TrendIndicator = ({ trend }: { trend: string }) => {
  const iconName = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'remove';
  const color = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : '#6B7280';
  
  return (
    <View className={`flex-row items-center ${Platform.select({ ios: 'py-0.5', android: 'py-1' })}`}>
      <Ionicons name={iconName} size={16} color={color} />
      <Text style={{ color }} className="ml-1 text-xs font-rmedium">
        {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
      </Text>
    </View>
  );
};

const ProgressCard = ({ item, index }: { item: any; index: number }) => {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 150).springify()}
      className="dark:bg-gray-800 bg-white p-5 rounded-2xl mb-4 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-abold text-gray-800 dark:text-white">
              {item.title}
            </Text>
            <TrendIndicator trend={item.trend} />
          </View>
        </View>
        <View className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
          <Text className="text-gray-600 dark:text-gray-300 font-amedium">
            {Math.round(item.progress * 100)}%
          </Text>
        </View>
      </View>
      
      <Text className="text-sm mb-3 font-aregular text-gray-500 dark:text-gray-400">
        {item.description}
      </Text>
      
      <ProgressBar progress={item.progress} color={item.color} />
      
      {/* Additional Details Section */}
      <View className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        {item.details.streak && (
          <View className="flex-row items-center">
            <Ionicons name="flame" size={16} color="#FF6B6B" />
            <Text className="ml-2 text-sm text-gray-600 font-aregular dark:text-gray-300">
              {item.details.streak} day streak
            </Text>
          </View>
        )}
        
        {item.details.timeSpent && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Time invested: {item.details.timeSpent}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const Progress = () => {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Animated.View 
        entering={FadeIn.delay(200).springify()}
        className="px-6 pt-8"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-rbold text-gray-800 dark:text-white">
              Progress Dashboard
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mt-1 font-aregular">
              You're making great progress! 🎯
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons name="options-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {progressData.map((item, index) => (
          <ProgressCard key={item.title} item={item} index={index} />
        ))}
      </Animated.View>
    </View>
  );
};

export default Progress;