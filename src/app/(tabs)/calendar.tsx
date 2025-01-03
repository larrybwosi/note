import { Memo, observer, useComputed } from '@legendapp/state/react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { currentTime } from '@legendapp/state/helpers/time';
import { Star, Plus, CalendarDays } from 'lucide-react-native';
import { format, differenceInMinutes } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useInterval } from 'usehooks-ts';
import { router } from 'expo-router';
import { useCallback } from 'react';

import TasksList from 'src/components/schedule.item';
import { sheduleStore } from 'src/store/shedule/store';

const Header = observer(({ streakCount = 5 }) => {
  const time = useComputed(() => format(currentTime.get().getTime(), 'hh:mm'));
  return (
    <Animated.View 
      entering={FadeInUp.duration(800)}
      className="px-4 py-6 bg-white dark:bg-gray-800 shadow-xl rounded-b-2xl"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        className="absolute top-0 left-0 right-0 bottom-0 rounded-b-3xl"
      />
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-sm font-rmedium text-gray-500 dark:text-gray-400 mb-1">
            Welcome back
          </Text>
          <Text className="text-3xl font-rbold text-gray-900 dark:text-white">
            My Schedule
          </Text>
        </View>
        <View className="px-4 py-2 rounded-lg shadow-blue-500/20">
          <Text className="text-lg font-rmedium dark:text-white text-black">
            <Memo>{time}</Memo>
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between bg-amber-50 dark:bg-amber-900/30 p-4 rounded-2xl">
        <View className="flex-row items-center">
          <Star size={24} color="#F59E0B" />
          <Text className="ml-2 text-amber-700 dark:text-amber-300 font-rmedium text-base">
            {streakCount} day streak
          </Text>
        </View>
        <View className="bg-amber-500/20 p-2 rounded-xl">
          <Text className="text-amber-600 dark:text-amber-400">🔥</Text>
        </View>
      </View>
    </Animated.View>
  );
});

const EmptyState = () => (
  <View className="flex-1 justify-center items-center p-8">
    <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl">
      <CalendarDays size={72} color="#9CA3AF" />
    </View>
    <Text className="text-xl font-amedium text-gray-600 dark:text-gray-400 mt-6 text-center">
      No tasks scheduled for today
    </Text>
    <Text className="text-sm text-gray-500 dark:text-gray-500 font-aregular mt-2 text-center max-w-xs">
      Take a moment to plan your day. Tap the + button to add a new task or event.
    </Text>
  </View>
);

const AddButton = () => (
  <TouchableOpacity
    onPress={() => router.push(`/create.shedule`)}
    className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
  >
    <Plus size={20} color="white" />
    <Text className="text-white font-rmedium ml-1">Add to calendar</Text>
  </TouchableOpacity>
);



const CalendarApp = observer(function CalendarApp() {
  const todayItems = useComputed(() => sheduleStore.items.get());

  const updateCountdowns = useCallback(() => {
    sheduleStore.items.set((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        countdown: differenceInMinutes(item.startDate, new Date()),
      }))
    );
  }, []);
  
  useInterval(() => {
    currentTime.set(new Date());
    updateCountdowns();
  }, 60000);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Header />

        <View className="mx-4 mt-8">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-sm font-rmedium text-gray-500 dark:text-gray-400 mb-1">
                {format(new Date(), 'EEEE, MMMM d')}
              </Text>
              <Text className="text-2xl font-rmedium text-gray-900 dark:text-white">
                Today's Schedule
              </Text>
            </View>
            <AddButton/>
          </View>

          {!todayItems?.length ? (
            <EmptyState />
          ) : (
            <Memo>
              {() => (
                <TasksList
                  items={todayItems.get()}
                />
              )}
            </Memo>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default CalendarApp;