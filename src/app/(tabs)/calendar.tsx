import { Memo, observer, useComputed } from '@legendapp/state/react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { currentTime } from '@legendapp/state/helpers/time';
import { format, differenceInMinutes } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useInterval } from 'usehooks-ts';
import { useCallback } from 'react';

import { useModal } from 'src/components/modals/provider';
import { markCompleted } from 'src/store/shedule/actions';
import { ItemCard } from 'src/components/schedule.item';
import { scheduleStore } from 'src/store/shedule/store';
import { router } from 'expo-router';

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
    <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl">
      <Ionicons name="calendar-outline" size={72} color="#9CA3AF" />
    </View>
    <Text className="text-xl font-amedium text-gray-600 dark:text-gray-400 mt-6 text-center">
      No tasks scheduled for today
    </Text>
    <Text className="text-sm text-gray-500 dark:text-gray-500 font-aregular mt-2 text-center max-w-xs">
      Take a moment to plan your day. Tap the + button to add a new task or event.
    </Text>
  </View>
);

const AddButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={() => router.navigate(`/ai.schedule`)}
    className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
  >
    <Ionicons name="add" size={20} color="white" />
    <Text className="text-white font-rmedium ml-1">Add to calendar</Text>
  </TouchableOpacity>
);

const TasksList = observer(({ items, onComplete, onPostpone }: any) => (
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
      />
    ))}
  </Animated.View>
));

const CalendarApp = observer(function CalendarApp() {
  const { show } = useModal();
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
    show('Postpone',{itemId,isVisible:true, close});
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
            <AddButton onPress={() => router.navigate('/ai.schedule')} />
          </View>

          {!todayItems?.length ? (
            <EmptyState />
          ) : (
            <Memo>
              {() => (
                <TasksList
                  items={todayItems.get()}
                  onComplete={handleCompleteItem}
                  onPostpone={handlePostpone}
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