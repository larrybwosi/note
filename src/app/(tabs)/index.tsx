import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  FadeInDown,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import TodayCard from 'src/components/today.card';
import { observable, observe, computed, batch } from '@legendapp/state';
import { useObservable, observer, Memo, useComputed } from '@legendapp/state/react';
import { scheduleStore } from 'src/store/shedule/store';
import { ItemCard } from 'src/components/schedule.item';
import { FlashList } from '@shopify/flash-list';
import Progress from 'src/components/home.progress';
import QuickActionCard from 'src/components/home.quickactions';
import { currentTime } from '@legendapp/state/helpers/time';

const motivationalQuotes = observable([
  {
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs"
  }
]);

const quickActions = observable([
  { 
    icon: <Feather name="list" size={24} color="white" />, 
    title: 'Tasks', 
    count: '12 pending', 
    color: '#FF6B6B',
    description: 'Track and complete your daily goals'
  },
  { 
    icon: <Feather name="calendar" size={24} color="white" />, 
    title: 'Events', 
    count: '2 today', 
    color: '#4ECDC4',
    description: 'Stay on top of your schedule'
  },
  { 
    icon: <Feather name="activity" size={24} color="white" />, 
    title: 'Workouts', 
    count: '3 this week', 
    color: '#45B7D1',
    description: 'Keep your health goals on track'
  },
  { 
    icon: <Feather name="dollar-sign" size={24} color="white" />, 
    title: 'Expenses', 
    count: '$420 saved', 
    color: '#96CEB4',
    description: 'Monitor your financial progress'
  }
]);

const focusTips = observable([
  {
    icon: '🎯',
    title: 'Peak Focus Time',
    description: 'Your most productive hours are between 10:00 AM - 12:00 PM. Schedule important tasks during this window.'
  },
  {
    icon: '⚡',
    title: 'Energy Level',
    description: 'Current energy level is high. Perfect time to tackle challenging tasks!'
  },
  {
    icon: '🌟',
    title: 'Daily Streak',
    description: "You've maintained your productivity streak for 7 days! Keep it up!"
  }
]);

const state$ = observable({
  nextWaterTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  userName: "Alex",
  achievements: {
    tasksCompleted: 7,
    waterStreak: 5,
    focusTime: 120,
  }
});

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const renderCount = ++useRef(0).current;
  console.log('renderCount', renderCount);
  
  const pulseAnim = useSharedValue(1);
  const welcomeScale = useSharedValue(0.8);
  const scrollY = useSharedValue(0);

  const welcomeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: welcomeScale.value }],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0], Extrapolation.CLAMP),
  }));

  const headerBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP),
  }));
  
  const items = useComputed(() => scheduleStore.items.get());

  const headerGradient = isDark 
    ? ['#1DB954', '#155e75', '#121212'] 
    : ['#4a90e2', '#357abd', '#2c6aa0'];

  const timeOfDay = computed(() => {
    const hour = currentTime.get().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  });

  const getGreeting = computed(() => {
    const greetings = [
      `Ready to crush another day? You're on fire! 🔥`,
      `${state$.achievements.tasksCompleted.get()} tasks done yesterday. Let's keep the momentum! ⚡`,
      `You're building great habits! ${state$.achievements.waterStreak.get()} day water streak 💧`,
      `Your focus time is up by 20% this week! 🎯`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const dailyQuote = computed(() => {
  const quotes = motivationalQuotes.get();
  return quotes[Math.floor(Math.random() * quotes.length)];
});

  const waterReminderStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const getTimeUntilNextWater = computed(() => {
    const diff = state$.nextWaterTime.get().getTime() - currentTime.get().getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} min` : "Now";
  });

  useEffect(() => {
    const timeInterval = setInterval(() => {
      currentTime.set(new Date());
    }, 60000);

    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );

    welcomeScale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );

    return () => clearInterval(timeInterval);
  }, []);

  const FocusTipCard = observer(({ icon, title, description }: any) => (
    <View className={`dark:bg-gray-900 dark:border-gray-800 bg-gray-50 border-gray-100 
      p-4 rounded-xl mb-3 border`}>
      <View className="flex-row items-center mb-2">
        <Text className="text-2xl mr-2">{icon}</Text>
        <Text className={`dark:text-white text-gray-800 font-plregular`}>
          {title}
        </Text>
      </View>
      <Text className={`dark:text-gray-400 text-gray-600 leading-relaxed font-rregular text-sm`}>
        {description}
      </Text>
    </View>
  ));

  return (
    <View className={`flex-1 ${isDark ? 'dark:bg-gray-900' : 'bg-gray-50'}`}>
      <Animated.View 
        className={`absolute top-0 left-0 right-0 h-24 z-50 ${
          isDark ? 'dark:bg-gray-900/80' : 'bg-white/80'
        }`} 
        style={headerBlurStyle} 
      />
      
      <ScrollView 
        className="flex-1"
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={headerGradient}
          className="px-6 pt-16 pb-10 rounded-b-3xl"
        >
          <Animated.View style={welcomeAnimStyle} className="space-y-3">
            <Text className="text-white text-3xl font-rbold">
              Good {timeOfDay.get()}, {state$.userName.get()}! ✨
            </Text>
            <Text className="text-gray-100 text-base font-aregular">
              {getGreeting.get()}
            </Text>
            <View className={`mt-4 bg-white/10 p-4 rounded-2xl backdrop-blur-lg`}>
              <Text className="text-white font-rmedium">
                {dailyQuote.get().quote}
              </Text>
              <Text className="text-gray-200 mt-2 font-plregular">
                - {dailyQuote.get().author}
              </Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <Animated.View 
          style={waterReminderStyle}
          className="mx-6 mt-6"
        >
          <TouchableOpacity className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">💧</Text>
                <View>
                  <Text className="text-blue-500 font-rbold">Water Reminder</Text>
                  <Text className="text-gray-500 dark:text-gray-400">Next in: {getTimeUntilNextWater.get()}</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-xl"
                onPress={() => {
                  batch(() => {
                    state$.nextWaterTime.set(new Date(Date.now() + 2 * 60 * 60 * 1000));
                    state$.achievements.waterStreak.set(state$.achievements.waterStreak.get() + 1);
                  });
                }}
              >
                <Text className="text-white font-rmedium">Log</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <TodayCard/>

        {/* Quick Actions Section */}
        <View className="px-4 mt-8">
          <Text className={`text-3xl font-rbold mb-2 ${isDark ? 'dark:text-white' : 'text-gray-800'} px-2`}>
            Quick Actions
          </Text>
          <Text className={`${isDark ? 'dark:text-gray-400' : 'text-gray-500'} text-lg mb-6 px-2`}>
            Your path to excellence
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pl-2"
            decelerationRate="fast"
            snapToInterval={270}
          >
            {quickActions.get().map((action, index) => (
              <Memo>
                {() => (
                  <Animated.View 
                    entering={FadeInDown.delay(index * 100).springify()}
                    className="w-[250px]"
                  >
                    <QuickActionCard {...action} />
                  </Animated.View>
                )}
              </Memo>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Tasks and Events */}
        <View className="px-4 mt-3">
          <Text className={`text-3xl font-rbold mb-2 ${isDark ? 'dark:text-white' : 'text-gray-800'} px-2`}>
            Upcoming Tasks & Events
          </Text>
          <Text className={`${isDark ? 'dark:text-gray-400' : 'text-gray-500'} text-lg mb-6 px-2`}>
            Your next steps
          </Text>
          <FlashList
            data={items.get()}
            renderItem={({ item }) => (
              <ItemCard
                key={item.id}
                item={item}
                onComplete={() => {}}
                handlePostpone={() => {}}
                theme={isDark ? 'dark' : 'light'}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={100}
          />
        </View>
        
        {/* Enhanced Progress Section */}
        <Progress/>

        {/* Enhanced Focus Insights */}
        <View className="px-6 mt-8 mb-8 dark:bg-gray-900">
          <Text className={`text-2xl font-rbold mb-2 ${isDark ? 'dark:text-white' : 'text-gray-800'}`}>
            Today's Insights
          </Text>
          <Text className={`${isDark ? 'dark:text-gray-400' : 'text-gray-500'} mb-4`}>
            Maximize your potential
          </Text>
          <Animated.View 
            entering={FadeInDown.delay(800).springify()}
            className={`${isDark ? 'dark:bg-gray-900/50' : 'bg-white/10'} p-5 rounded-xl shadow-lg`}
          >
            {focusTips.get().map((tip, index) => (
              <Memo key={index}>
                {() => <FocusTipCard {...tip} />}
              </Memo>
            ))}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
});

export default HomeScreen;