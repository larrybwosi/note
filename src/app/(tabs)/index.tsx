import { observer, useComputed } from '@legendapp/state/react';
import { currentTime } from '@legendapp/state/helpers/time';
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useCallback, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { batch } from '@legendapp/state';
import { Text, View, ScrollView, TextInput, Pressable, Keyboard } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

import { scheduleStore } from 'src/store/shedule/store';
import { useProfile } from 'src/store/profile/actions';
import Progress from 'src/components/home/progress';
import TodayCard from 'src/components/today.card';

import {
  motivationalQuotes,
  quickActions,
  homeState,
  enhancedFocusTips,
} from 'src/components/home/data';
import { WaterReminderSection } from 'src/components/home/water.reminder';
import QuickActionsSection from 'src/components/home/quickactions';
import { UpcomingTasksSection } from 'src/components/home/upcoming';
import { FocusInsightsSection } from 'src/components/home/focus';

// Enhanced gradient configurations
const gradientConfigs = {
  dark: {
    morning: ['#2dd4bf', '#0d9488', '#121212'],
    afternoon: ['#1DB954', '#155e75', '#121212'],
    evening: ['#7c3aed', '#4c1d95', '#121212'],
  },
  light: {
    morning: ['#14b8a6', '#0d9488', '#2c6aa0'],
    afternoon: ['#059669', '#357abd', '#2c6aa0'],
    evening: ['#8b5cf6', '#6d28d9', '#2c6aa0'],
  },
};

interface HeaderSectionProps {
  timeOfDay: string;
  name: string;
  greeting: string;
  quote: { quote: string; author: string };
  scrollY: SharedValue<number>;
}

const HeaderSection = React.memo(({ timeOfDay, name, greeting, quote, scrollY }: HeaderSectionProps) => {
  const welcomeScale = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP) },
      { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.8], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View style={welcomeScale} className="space-y-3">
      <Animated.View entering={FadeIn.duration(800)} className="flex-row items-center">
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
        entering={FadeIn.duration(1000).delay(600)}
        className="mt-4 bg-white/10 p-4 rounded-2xl backdrop-blur-lg shadow-lg"
      >
        <Text className="text-white font-rmedium leading-6">{quote.quote}</Text>
        <Text className="text-gray-200 mt-2 font-plregular">- {quote.author}</Text>
      </Animated.View>
    </Animated.View>
  );
});

const DailyNotes = observer(({ isDark }: { isDark: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const scale = useSharedValue(1);

  const handleSave = () => {
    // homeState.dailyNotes.set(notes);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(800)}
      className="mx-6 mt-6 p-4 rounded-2xl shadow-lg"
      style={[
        animatedStyle,
        {
          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.8)' : 'white',
        },
      ]}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text
          className={`text-lg font-rmedium ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
        >
          Daily Notes
        </Text>
        <Pressable
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="p-2"
        >
          {isEditing ? (
            <Feather name='save'/>
          ) : (
            <Feather name='edit' size={20} color={isDark ? '#fff' : '#374151'} />
          )}
        </Pressable>
      </View>
      <TextInput
        multiline
        value={notes}
        onChangeText={setNotes}
        editable={isEditing}
        className={`min-h-[100] text-base font-aregular dark:text-gray-100 text-gray-700`}
        placeholder="Write your thoughts for today..."
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        style={{ textAlignVertical: 'top' }}
      />
    </Animated.View>
  );
});

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { personalInfo: { name } } = useProfile();
  
  const scrollY = useSharedValue(0);
  const items = useComputed(() => scheduleStore.items.get());

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
    const quotes = motivationalQuotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  useEffect(() => {
    const timeInterval = setInterval(() => {
      currentTime.set(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const handleWaterLog = useCallback(() => {
    batch(() => {
      homeState.nextWaterTime.set(new Date(Date.now() + 2 * 60 * 60 * 1000));
      homeState.achievements.waterStreak.set(homeState.achievements.waterStreak.get() + 1);
    });
  }, []);

  const onScroll = useCallback(
    (event: any) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  return (
    <ScrollView
      className="flex-1 mb-6 dark:bg-gray-900 bg-gray-50"
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <LinearGradient
        colors={headerGradient}
        className="px-6 pt-16 pb-10"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <HeaderSection
          timeOfDay={timeOfDay.get()}
          name={name}
          greeting={getGreeting.get()}
          quote={dailyQuote.get()}
          scrollY={scrollY}
        />
      </LinearGradient>
      
      <Animated.View entering={FadeIn.duration(800).delay(300)}>
        <WaterReminderSection onWaterLog={handleWaterLog} />
      </Animated.View>
      
      <Animated.View entering={FadeIn.duration(800).delay(400)}>
        <TodayCard />
      </Animated.View>
      
      <Animated.View entering={FadeIn.duration(800).delay(500)}>
        <QuickActionsSection quickActions={quickActions} isDark={isDark} />
      </Animated.View>
      
      <Animated.View entering={FadeIn.duration(800).delay(600)}>
        <UpcomingTasksSection items={items.get()} isDark={isDark} />
      </Animated.View>
      
      <Animated.View entering={FadeIn.duration(800).delay(700)}>
        <Progress />
      </Animated.View>
      
      <Animated.View entering={FadeIn.duration(800).delay(800)}>
        <FocusInsightsSection focusTips={enhancedFocusTips} isDark={isDark} />
      </Animated.View>

      <DailyNotes isDark={isDark} />
    </ScrollView>
  );
});

export default HomeScreen;