import { Text, TextInput, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProfile } from 'src/store/profile/actions';
import { CalendarDays } from 'lucide-react-native';
import { useObservable } from '@legendapp/state/react';

type Profile = {
  personalInfo: {
    name: string;
    email: string;
    dateOfBirth: string;
    height: string;
    weight: string;
    phone?: string;
    address?: string;
    gender?: string;
    preferredLanguage?: string;
  };
  healthMetrics: {
    waterIntake: { daily: { goal: string; current: string } };
    sleep: { averageHours: string; goal: string };
    exercise: { weeklyGoal: string; weeklyProgress: string };
  };
  productivityMetrics: {
    focusTime: { daily: { goal: string; current: string } };
    habits: { name: string; frequency: 'daily' | 'weekly'; completed: boolean }[];
  };
};

const ProfileSetupPage: React.FC = () => {
  const showDatePicker$ = useObservable(false);
  const submitScale$ = useSharedValue(1);
  const scrollProgress$ = useSharedValue(0);
  const {
    personalInfo,
    healthMetrics,
    productivityMetrics,
    updatePersonalInfo,
    updateSchedule,
    addWaterIntake,
    updateSleep,
    updateExercise,
    updateFocusTime,
  } = useProfile();

  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(submitScale$.value) }],
  }));

  const handleDateChange = (event: Event, selectedDate?: Date) => {
    showDatePicker$.set(false);
    if (selectedDate) {
      updatePersonalInfo('dateOfBirth', selectedDate.toISOString().split('T')[0]);
    }
  };

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

  const renderInput = (
    label: string,
    value: string | number,
    onChangeText: (value: string | number) => void,
    required: boolean = false,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default',
    description?: string
  ) => (
    <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-6">
      <Text className="text-sm font-rregular text-gray-600 dark:text-gray-300 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      {description && (
        <Text className="text-xs font-rregular text-gray-500 dark:text-gray-400 mb-2">
          {description}
        </Text>
      )}
      <TextInput
        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-800 dark:text-gray-200 font-rregular"
        value={String(value)}
        onChangeText={(text) => onChangeText(keyboardType === 'numeric' ? Number(text) : text)}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#A0AEC0"
      />
    </Animated.View>
  );

  const renderSection = (
    title: string,
    children: React.ReactNode,
    description: string,
    delay: number = 0
  ) => (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-8 shadow-lg"
    >
      <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100 mb-3">{title}</Text>
      <Text className="text-sm font-rregular text-gray-600 dark:text-gray-300 mb-6">
        {description}
      </Text>
      {children}
    </Animated.View>
  );
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <AnimatedLinearGradient colors={['#1E40AF', '#3B82F6', '#60A5FA']} className="flex-1">
        <ScrollView
          className="flex-1 px-2 py-10 mt-8"
          onScroll={({ nativeEvent }) => {
            const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
            scrollProgress$.value =
              contentOffset.y / (contentSize.height - layoutMeasurement.height);
          }}
          scrollEventThrottle={16}
        >
          <Animated.Text
            entering={FadeInDown.springify()}
            className="text-3xl font-rbold text-white text-center mb-4"
          >
            Create Your Profile
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(150).springify()}
            className="text-lg font-rregular text-white text-center mb-8 px-4"
          >
            Welcome to your personal wellness journey! We'll help you create a profile that's
            perfectly tailored to your needs. Take a moment to fill in the details below - this
            information will help us provide you with the most personalized experience possible.
          </Animated.Text>

          {renderSection(
            'Personal Information',
            <>
              {renderInput(
                'Name',
                personalInfo.name,
                (text) => updatePersonalInfo('name', text as string),
                true,
                'default',
                'Your name helps us personalize your experience throughout the app.'
              )}
              {renderInput(
                'Email',
                personalInfo.email,
                (text) => updatePersonalInfo('email', text as string),
                true,
                'email-address',
                "We'll use this to send important updates and progress reports."
              )}

              <Animated.View entering={FadeInUp.delay(450).springify()} className="mb-6">
                <Text className="text-sm font-rregular text-gray-600 dark:text-gray-300 mb-1">
                  Date of Birth <Text className="text-red-500">*</Text>
                </Text>
                <Text className="text-xs font-rregular text-gray-500 dark:text-gray-400 mb-2">
                  This helps us customize age-appropriate wellness recommendations.
                </Text>
                <TouchableOpacity
                  onPress={() => showDatePicker$.set(true)}
                  className="flex-row justify-between items-center w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl"
                >
                  <Text className="text-gray-800 dark:text-gray-200 font-rregular">
                    {personalInfo.dateOfBirth || 'Select Date of Birth'}
                  </Text>
                  <CalendarDays size={24} color="#4A5568" />
                </TouchableOpacity>
              </Animated.View>

              {showDatePicker$.get() && (
                <DateTimePicker
                  value={personalInfo.dateOfBirth ? new Date(personalInfo.dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {renderInput(
                'Height (cm)',
                personalInfo.height,
                (value) => updatePersonalInfo('height', value as number),
                true,
                'numeric',
                'Used to calculate personalized fitness and health metrics.'
              )}
              {renderInput(
                'Weight (kg)',
                personalInfo.weight,
                (value) => updatePersonalInfo('weight', value as number),
                true,
                'numeric',
                'Helps us track your wellness journey and set appropriate goals.'
              )}
            </>,
            'Tell us about yourself so we can personalize your wellness journey. This information helps us create the most effective experience for you.',
            300
          )}

          {renderSection(
            'Health Metrics',
            <>
              {renderInput(
                'Daily Water Intake Goal (ml)',
                healthMetrics.waterIntake.daily.goal,
                (value) => addWaterIntake(value as number),
                false,
                'numeric',
                'Staying hydrated is crucial for overall health. Set a realistic daily water intake goal.'
              )}
              {renderInput(
                'Average Sleep Hours',
                healthMetrics.sleep.averageHours,
                (value) => updateSleep(value as number),
                false,
                'numeric',
                'Understanding your current sleep patterns helps us suggest better sleep habits.'
              )}
              {renderInput(
                'Weekly Exercise Goal (minutes)',
                healthMetrics.exercise.weeklyGoal,
                (value) => updateExercise(value as number),
                false,
                'numeric',
                'Set an achievable exercise goal that matches your fitness level.'
              )}
            </>,
            'Set your health goals and track your progress. These metrics will help you maintain a balanced, healthy lifestyle.',
            600
          )}

          {renderSection(
            'Productivity Metrics',
            <>
              {renderInput(
                'Daily Focus Time Goal (minutes)',
                productivityMetrics.focusTime.daily.goal,
                (value) => updateFocusTime(value as number),
                false,
                'numeric',
                'Set aside dedicated time for deep work and important tasks.'
              )}
            </>,
            'Enhance your daily productivity by setting realistic focus time goals and building healthy work habits.',
            750
          )}

          <AnimatedTouchableOpacity
            className="bg-emerald-500 py-4 px-8 rounded-xl self-center mb-10 shadow-lg"
            style={submitButtonStyle}
            onPressIn={() => {
              submitScale$.value = withSequence(withSpring(0.95), withSpring(1));
            }}
            onPressOut={() => {
              submitScale$.value = withSpring(1);
            }}
          >
            <Text className="text-white font-rbold text-lg">Complete Profile Setup</Text>
          </AnimatedTouchableOpacity>
        </ScrollView>
      </AnimatedLinearGradient>
    </SafeAreaView>
  );
};

export default ProfileSetupPage;
