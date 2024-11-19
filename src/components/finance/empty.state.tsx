import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  BounceIn,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet, ChartBar, Target, Sparkles, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';


const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay, 
  isDark 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  delay: number,
  isDark: boolean 
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, {
      damping: 15,
      mass: 0.8,
      stiffness: 120
    }) }]
  }));

  return (
    <Animated.View
      entering={FadeIn
        .duration(800)
        .delay(delay)}
      style={animatedStyle}
      className="flex-row items-center bg-white/10 dark:bg-gray-800/30 rounded-xl p-4 mb-3"
    >
      <View className={`
        w-12 h-12 rounded-full items-center justify-center mr-4
        ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}
      `}>
        <Icon size={24} color={isDark ? "#60A5FA" : "#3B82F6"} />
      </View>
      <View className="flex-1">
        <Text className="font-rmedium text-base text-gray-800 dark:text-gray-100">
          {title}
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          {description}
        </Text>
      </View>
    </Animated.View>
  );
};


const EmptyState = ({ isDark }: { isDark: boolean }) => {
  const buttonScale = useSharedValue(1);
  const walletRotate = useSharedValue(0);
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(buttonScale.value, {
      damping: 15,
      mass: 0.8,
      stiffness: 120
    }) }]
  }));

  const walletStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: buttonScale.value },
      { rotate: `${walletRotate.value}deg` }
    ]
  }));


  const gradientColors = isDark 
    ? ['#1E3A8A', '#1F2937', '#111827']
    : ['#DBEAFE', '#EBF4FF', '#E1EFFE'];

  return (
    <Animated.View 
      entering={FadeIn
        .duration(600)
      }
      exiting={FadeOut.duration(300)}
      className="flex-1 items-center justify-center py-8 px-4"
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-8 rounded-3xl items-center mb-4 w-full max-w-md shadow-lg"
      >
        <Animated.View
          entering={BounceIn
            .duration(1000)
          }
          style={walletStyle}
          className={`
            p-5 rounded-full mb-6
            ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}
          `}
        >
          <Wallet size={72} color={isDark ? "#60A5FA" : "#3B82F6"} />
        </Animated.View>

        <View className="mb-8">
          <Text className="text-gray-800 dark:text-gray-100 text-center font-rbold text-3xl mb-2">
            Start Your Financial Journey
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 text-center font-rregular text-lg">
            Take control of your finances today
          </Text>
        </View>

        <View className="w-full mb-8">
          <FeatureCard
            icon={ChartBar}
            title="Track Expenses"
            description="Monitor your spending patterns with detailed analytics"
            delay={200}
            isDark={isDark}
          />
          <FeatureCard
            icon={Target}
            title="Set Budgets"
            description="Create custom budgets for different categories"
            delay={400}
            isDark={isDark}
          />
          <FeatureCard
            icon={Sparkles}
            title="Achieve Goals"
            description="Set and track your financial goals with ease"
            delay={600}
            isDark={isDark}
          />
        </View>

        <Animated.View style={buttonStyle} className="w-full">
          <TouchableOpacity
            onPress={() => router.navigate(`/create.transaction`)}
            className={`
              flex-row items-center justify-center space-x-2
              ${isDark ? 'bg-blue-600' : 'bg-blue-500'}
              px-8 py-4 rounded-xl shadow-lg
            `}
            activeOpacity={0.9}
          >
            <Text className="text-white font-rmedium text-lg">
              Add First Transaction
            </Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

export default EmptyState;