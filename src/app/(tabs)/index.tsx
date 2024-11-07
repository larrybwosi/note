import { observer, useComputed } from '@legendapp/state/react';
import { currentTime } from '@legendapp/state/helpers/time';
import { useEffect, useCallback, useRef } from 'react';
import { batch } from '@legendapp/state';
import { View } from 'react-native';
import Animated, {
  useSharedValue
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';

import { scheduleStore } from 'src/store/shedule/store';
import { useProfile } from 'src/store/profile/actions';
import Progress from 'src/components/home.progress';
import TodayCard from 'src/components/today.card';

import { motivationalQuotes, quickActions, homeState, enhancedFocusTips } from 'src/components/home/data';
import { WaterReminderSection } from 'src/components/home/water.reminder';
import QuickActionsSection from 'src/components/home/quickactions';
import { UpcomingTasksSection } from 'src/components/home/upcoming';
import { FocusInsightsSection } from 'src/components/home/focus';
import { HeaderSection } from 'src/components/home/header';

const HomeScreen = observer(() => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { personalInfo: { name } } = useProfile();

  
  const scrollY = useSharedValue(0);
  const items = useComputed(() => scheduleStore.items.get());

  const headerGradient = isDark
    ? ['#1DB954', '#155e75', '#121212']
    : ['#4a90e2', '#357abd', '#2c6aa0'];

  const timeOfDay = useComputed(() => {
    const hour = currentTime.get().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  });

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

  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  }, []);

  return (
    <View className={`flex-1 mb-6 dark:bg-gray-900 bg-gray-50`}>

      <Animated.FlatList
        className="flex-1"
        data={['a']}
        renderItem={() =>(
          <>
            <LinearGradient colors={headerGradient} className="px-6 pt-16 pb-10 rounded-b-3xl">
              <HeaderSection
                timeOfDay={timeOfDay.get()}
                name={name}
                greeting={getGreeting.get()}
                quote={dailyQuote.get()}
                scrollY={scrollY}
              />
            </LinearGradient>

            <WaterReminderSection onWaterLog={handleWaterLog} />

            <TodayCard />

            <QuickActionsSection quickActions={quickActions} isDark={isDark} />

            <UpcomingTasksSection items={items.get()} isDark={isDark} />

            <Progress />

            <FocusInsightsSection focusTips={enhancedFocusTips} isDark={isDark} />
          </>
        )}
        keyExtractor={(item) => 'item.id.toString()'}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
});

export default HomeScreen;