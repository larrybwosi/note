import { Memo, observer, useComputed } from '@legendapp/state/react';
import { useInterval } from 'usehooks-ts';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currentTime } from '@legendapp/state/helpers/time';
import { colorScheme as colorSchemeNW } from 'nativewind';
import { format, differenceInMinutes } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { markCompleted } from 'src/store/shedule/actions';
import { ItemCard } from 'src/components/schedule.item';
import { scheduleStore } from 'src/store/shedule/store';
import { router } from 'expo-router';
import { useModal } from 'src/components/modals/provider';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Separate components for better organization
const Header = observer(({ streakCount = 5 }) => {
  const time = useComputed(() => format(currentTime.get().getTime(), 'hh:mm'));
  return (
    <Animated.View 
      entering={FadeInUp.duration(800)}
      className="px-4 py-6 bg-white dark:bg-gray-800 shadow-xl rounded-b-3xl"
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
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-2xl shadow-lg shadow-blue-500/20">
          <Text className="text-lg font-rmedium text-white">
            <Memo>{time}</Memo>
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between bg-amber-50 dark:bg-amber-900/30 p-4 rounded-2xl">
        <View className="flex-row items-center">
          <Ionicons name="star" size={24} color="#F59E0B" />
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
    <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl shadow-inner">
      <Ionicons name="calendar-outline" size={72} color="#9CA3AF" />
    </View>
    <Text className="text-xl font-rmedium text-gray-600 dark:text-gray-400 mt-6 text-center">
      No tasks scheduled for today
    </Text>
    <Text className="text-sm text-gray-500 dark:text-gray-500 mt-2 text-center max-w-xs">
      Take a moment to plan your day. Tap the + button to add a new task or event.
    </Text>
  </View>
);

const AddButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full shadow-xl shadow-blue-600/30 active:scale-95 transform transition-all"
    onPress={onPress}
  >
    <LinearGradient
      colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
      className="absolute top-0 left-0 right-0 bottom-0 rounded-full"
    />
    <Ionicons name="add" size={24} color="white" />
  </TouchableOpacity>
);

const TasksList = observer(({ items, onComplete, onPostpone, theme }: any) => (
  <Animated.View 
    className="space-y-4"
    entering={FadeInUp.duration(800)}
  >
    {items.map((item: any) => (
      <ItemCard
        key={item.id}
        item={item}
        onComplete={onComplete}
        handlePostpone={onPostpone}
        theme={theme}
      />
    ))}
  </Animated.View>
));

const CalendarApp = observer(function CalendarApp() {
  const { show } = useModal('postpone');
  const theme = useComputed(() => colorSchemeNW.get());
  const todayItems = useComputed(() => scheduleStore.items.get());

  const updateCountdowns = useCallback(() => {
    scheduleStore.items.set((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        countdown: differenceInMinutes(item.startDate, new Date()),
      }))
    );
  }, []);

  const handlePostpone = useCallback((itemId: any) => {
    show({ itemId, date: new Date() });
  }, [show]);

  const handleCompleteItem = useCallback((id: number) => {
    markCompleted(id);
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
            <AddButton onPress={() => router.navigate('/scheduleadd')} />
          </View>

          {todayItems.length === 0 ? (
            <EmptyState />
          ) : (
            <Memo>
              {() => (
                <TasksList
                  items={todayItems.get()}
                  onComplete={handleCompleteItem}
                  onPostpone={handlePostpone}
                  theme={theme.get()}
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