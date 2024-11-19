import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideInUp,
} from 'react-native-reanimated';
import { 
  Calendar,
  Clock,
  Sparkles,
  Send,
  Lightbulb,
  ArrowRight,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Coffee,
  Briefcase,
  Book,
  Dumbbell,
  Music
} from 'lucide-react-native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const AIScheduleGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const buttonScale = useSharedValue(1);
  const inputScale = useSharedValue(1);
  const sparkleRotation = useSharedValue(0);
  const gradientProgress = useSharedValue(0);

  const examplePrompts = [
    "Create a productive workday schedule",
    "Plan a relaxing weekend routine",
    "Organize a balanced study timetable",
    "Design a fitness and meal plan",
    "Schedule a family-friendly vacation day",
  ];

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(76, 102, 159, ${gradientProgress.value})`,
  }));

  useEffect(() => {
    sparkleRotation.value = withRepeat(
      withSequence(
        withSpring(10),
        withSpring(-10),
        withSpring(0)
      ),
      -1,
      true
    );

    gradientProgress.value = withRepeat(
      withSequence(
        withSpring(0.7),
        withSpring(1)
      ),
      -1,
      true
    );
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    buttonScale.value = withSequence(
      withSpring(0.9),
      withSpring(1.1),
      withSpring(1)
    );

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockSchedule = [
        { time: '08:00', activity: 'Wake up and morning routine', icon: Coffee },
        { time: '09:00', activity: 'Work on important tasks', icon: Briefcase },
        { time: '12:00', activity: 'Lunch break and short walk', icon: Coffee },
        { time: '13:00', activity: 'Continue work or study', icon: Book },
        { time: '16:00', activity: 'Exercise or gym session', icon: Dumbbell },
        { time: '18:00', activity: 'Dinner and relaxation', icon: Music },
        { time: '22:00', activity: 'Wind down and prepare for bed', icon: Coffee },
      ];
      setSchedule(mockSchedule);
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ScheduleCard = ({ schedule }) => (
    <Animated.View 
      entering={SlideInUp.duration(500).delay(200)}
      className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <Text className="text-2xl font-rbold text-gray-900 dark:text-gray-100 mb-4">
        Your AI-Generated Schedule
      </Text>
      <ScrollView className="max-h-96">
        {schedule.map((item, index) => (
          <Animated.View
            key={index}
            entering={SlideInRight.delay(index * 100)}
            className="flex-row items-center mb-4"
          >
            <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
              <item.icon size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-lg text-gray-800 dark:text-gray-200 font-rmedium">{item.time}</Text>
              <Text className="text-gray-600 dark:text-gray-400 font-rregular">{item.activity}</Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AnimatedLinearGradient
        colors={['#6366F1', '#4F46E5', '#4338CA']}
        style={gradientAnimatedStyle}
        className="px-6 py-12 rounded-b-3xl"
      >
        <Animated.View style={sparkleAnimatedStyle} className="mb-4">
          <Sparkles size={32} color="#FFD700" />
        </Animated.View>
        <Text className="text-4xl font-rbold text-white mb-2">
          AI Schedule Wizard
        </Text>
        <Text className="text-lg font-rregular text-gray-200">
          Describe your ideal day, and let AI craft the perfect schedule for you!
        </Text>
      </AnimatedLinearGradient>

      <View className="px-6 py-8">
        <Animated.View style={inputAnimatedStyle}>
          <TextInput
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[140px] rounded-xl p-4 text-lg font-rregular shadow-sm"
            placeholder="E.g., 'Create a productive workday schedule with breaks'"
            placeholderTextColor="#9CA3AF"
            value={prompt}
            onChangeText={setPrompt}
            onFocus={() => {
              inputScale.value = withSpring(1.02);
            }}
            onBlur={() => {
              inputScale.value = withSpring(1);
            }}
            multiline
          />
        </Animated.View>

        <Animated.View style={buttonAnimatedStyle} className="mt-6">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-600 rounded-xl p-4 flex-row items-center justify-center"
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <RefreshCcw size={24} color="white" className="animate-spin mr-2" />
                <Text className="text-white font-rmedium text-lg">Generating Schedule...</Text>
              </View>
            ) : (
              <>
                <Calendar size={24} color="white" />
                <Text className="text-white font-rmedium text-lg ml-2">Generate Schedule</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {schedule ? (
          <ScheduleCard schedule={schedule} />
        ) : (
          <>
            <View className="mt-12">
              <Text className="text-xl font-rbold text-gray-900 dark:text-gray-100 mb-4">
                Popular Schedule Ideas
              </Text>
              {examplePrompts.map((examplePrompt, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(index * 100)}
                >
                  <TouchableOpacity
                    onPress={() => setPrompt(examplePrompt)}
                    className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
                  >
                    <View className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center mr-4">
                      <Clock size={20} color="#6366F1" />
                    </View>
                    <Text className="flex-1 text-gray-800 dark:text-gray-200 font-rmedium">
                      {examplePrompt}
                    </Text>
                    <ArrowRight size={20} color="#6366F1" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <Animated.View
              entering={FadeIn.delay(1000)}
              className="mt-8 bg-yellow-100 dark:bg-yellow-900 rounded-xl p-4 flex-row items-start"
            >
              <Lightbulb size={24} color="#FFA000" className="mr-3 mt-1" />
              <Text className="flex-1 text-yellow-800 dark:text-yellow-100 font-rregular">
                <Text className="font-rmedium">Pro Tip:</Text> Include specific activities, time preferences, and goals in your prompt for a more personalized schedule.
              </Text>
            </Animated.View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default AIScheduleGenerator;