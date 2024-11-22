import { Calendar1, ChevronRight, Settings2 } from 'lucide-react-native';
import { observer, useComputed } from '@legendapp/state/react';
import { currentTime } from '@legendapp/state/helpers/time';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  FadeIn,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useEffect, useCallback } from 'react';
import { colorScheme } from 'nativewind';

import { useProfile } from 'src/store/profile/actions';
import TodayCard from 'src/components/home/today.card';
import Progress from 'src/components/home/progress';

import {
  MOTIVATIONAL_QUOTES,
  homeState,
} from 'src/components/home/data';
import { WaterReminderSection } from 'src/components/home/water.reminder';
import { FocusInsightsSection } from 'src/components/home/focus';
import { View } from 'react-native';

const gradientConfigs = {
  dark: {
    morning: ['#3B82F6', '#2563EB', '#1E40AF', '#1E3A8A'],
    afternoon: ['#10B981', '#059669', '#047857', '#065F46'],
    evening: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
  },
  light: {
    morning: ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
    afternoon: ['#34D399', '#10B981', '#059669', '#047857'],
    evening: ['#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9'],
  },
};

interface HeaderSectionProps {
  timeOfDay: string;
  name: string;
  greeting: string;
  quote: { quote: string; author: string };
  scrollY: SharedValue<number>;
}

const HeaderSection = ({ timeOfDay, name, greeting, quote, scrollY }: HeaderSectionProps) => {
  const welcomeScale = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={[welcomeScale, { 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 6 
    }]} className="space-y-4">
      <Animated.View entering={FadeIn.duration(800)} className="flex-row items-center gap-2">
        <Text className="text-white text-3xl font-rbold">
          Good {timeOfDay}, {name}!
        </Text>
        <Text className="text-3xl ml-2">✨</Text>
      </Animated.View>
      <Animated.Text
        entering={FadeIn.duration(1000).delay(300)}
        className="text-gray-100 text-base font-aregular"
      >
        {greeting}
      </Animated.Text>
      <Animated.View
        entering={SlideInRight.duration(600).delay(400)}
        exiting={SlideOutRight}
        className="bg-white/30 p-5 rounded-3xl border border-white/20"
      >
        <Text className="text-white text-lg font-rmedium leading-7">
          "{quote.quote}"
        </Text>
        <Text className="text-white/80 text-sm font-aregular text-right mt-2">
          - {quote.author}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const HomeScreen = observer(() => {
  const isDark = colorScheme.get() === 'dark';
  const { personalInfo: { name } } = useProfile();
  
  const scrollY = useSharedValue(0);

  const timeOfDay = useComputed(() => {
    const hour = currentTime.get().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  });

  const headerGradient = isDark
    ? gradientConfigs.dark[timeOfDay.get() as keyof typeof gradientConfigs.dark]
    : gradientConfigs.light[timeOfDay.get() as keyof typeof gradientConfigs.light];

  const getGreeting = useComputed(() => {
    const greetings = [
      `Ready to crush another day? You're on fire! 🔥`,
      `${homeState.achievements.tasksCompleted.get()} tasks done yesterday. Let's keep the momentum! ⚡`,
      `You're building great habits! ${homeState.achievements.waterStreak.get()} day water streak 💧`,
      `Your focus time is up by 20% this week! 🎯`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  const dailyQuote = useComputed(() => {
    const quotes = MOTIVATIONAL_QUOTES;
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const generatedSchedule = [
    { time: '09:00', activity: 'Deep Work', duration: 120 },
    { time: '11:00', activity: 'Break', duration: 30 },
    { time: '11:30', activity: 'Meeting', duration: 60 },
    { time: '12:30', activity: 'Exercise', duration: 45 },
  ];

  useEffect(() => {
    const timeInterval = setInterval(() => {
      currentTime.set(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const onScroll = useCallback(
    (event: any) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  return (
    <ScrollView
      className="flex-1 mb-6 dark:bg-gray-900 bg-gray-50 h-full"
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <LinearGradient
        colors={headerGradient}
        className="px-2 pt-16 pb-12"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            },
            android: {
              elevation: 8,
            }
          })
        }}
      >
        <HeaderSection
          timeOfDay={timeOfDay.get()}
          name={name}
          greeting={getGreeting.get()}
          quote={dailyQuote.get()}
          scrollY={scrollY}
        />
      </LinearGradient>
      <View className="px-1 space-y-8 mt-8 gap-1">
        <Animated.View entering={FadeIn.duration(800).delay(300)}>
          <WaterReminderSection />
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(800).delay(400)}>
          <TodayCard />
        </Animated.View>

        <Animated.View entering={FadeIn.duration(800).delay(600)}>
          <View className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border dark:border-gray-800 border-gray-100">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-amedium dark:text-gray-50 text-gray-900">Your Schedule</Text>
              <View className="flex-row items-center space-x-4">
                <Calendar1 color="#8b5cf6" size={22} />
                <Text className="text-gray-600 font-aregular dark:text-gray-50">Today</Text>
                <ChevronRight color="#9ca3af" size={22} />
              </View>
            </View>

            <View className="space-y-4">
              {generatedSchedule.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900
                   rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                  style={{
                    ...Platform.select({
                      ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      },
                      android: {
                        elevation: 3,
                      }
                    })
                  }}
                >
                  <Text className="w-20 text-gray-600 dark:text-gray-50 font-amedium">{item.time}</Text>
                  <View className="flex-1">
                    <Text className="text-gray-900 dark:text-gray-50 font-rmedium text-lg">{item.activity}</Text>
                    <Text className="text-gray-500 dark:text-gray-50 font-rregular">{item.duration} minutes</Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-purple-100 p-2 rounded-full"
                    style={{
                      shadowColor: '#8b5cf6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                    }}
                  >
                    <Settings2 color="#8b5cf6" size={22} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(800).delay(700)}>
          <Progress />
        </Animated.View>
        
        <Animated.View entering={FadeIn.duration(800).delay(800)}>
          <FocusInsightsSection />
        </Animated.View>
      </View>
    </ScrollView>
  );
});

export default HomeScreen;