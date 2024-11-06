import { Memo, observer, useObservable, useComputed } from '@legendapp/state/react';
import { useInterval } from 'usehooks-ts';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { currentTime } from '@legendapp/state/helpers/time';
import { colorScheme as colorSchemeNW } from 'nativewind';
import { format, differenceInMinutes } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';

import { markCompleted, postponeItem } from 'src/store/shedule/actions';
import { ItemCard } from 'src/components/schedule.item';
import { scheduleStore } from 'src/store/shedule/store';
import AddItem from 'src/components/schedule.add';

const CALENDAR_THEME = {
  light: {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    selectedDayBackgroundColor: '#3b82f6',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#2563eb',
    dayTextColor: '#1f2937',
    textDisabledColor: '#9ca3af',
    dotColor: '#3b82f6',
    selectedDotColor: '#ffffff',
    arrowColor: '#3b82f6',
    monthTextColor: '#1f2937',
  },
  dark: {
    backgroundColor: '#111827',
    calendarBackground: '#1f2937',
    selectedDayBackgroundColor: '#60a5fa',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#60a5fa',
    dayTextColor: '#f3f4f6',
    textDisabledColor: '#6b7280',
    dotColor: '#60a5fa',
    selectedDotColor: '#ffffff',
    arrowColor: '#60a5fa',
    monthTextColor: '#f3f4f6',
  },
};

const CalendarApp = observer(function CalendarApp() {
  const state$ = useObservable({
    showPostponeModal: false,
    selectedItemId: '' as any,
    showDatePicker: false,
    animation: {
      streakScale: 1,
    },
  });

  const time = useComputed(() => format(currentTime.get().getTime(), 'hh:mm'));
  const theme = useComputed(() => colorSchemeNW.get());
  const items = useComputed(() => scheduleStore.items.get());

  const updateCountdowns = useCallback(() => {
    scheduleStore.items.set((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        countdown: differenceInMinutes(item.startDate, new Date()),
      }))
    );
  }, []);

  const handlePostpone = useCallback((itemId: any) => {
    state$.selectedItemId.set(itemId);
    state$.showPostponeModal.set(true);
  }, []);

  const confirmPostpone = useCallback(() => {
    if (state$.selectedItemId.get()) {
      postponeItem(
        state$.selectedItemId.get(),
        scheduleStore.postponeData.newDate.get(),
        scheduleStore.postponeData.reason.get(),
        'Other',
        'Low'
      );
    }
    state$.showPostponeModal.set(false);
    state$.selectedItemId.set(null);
    scheduleStore.postponeData.reason.set('');
    scheduleStore.postponeData.newDate.set(new Date());
  }, []);

  useInterval(() => {
    currentTime.set(new Date());
    updateCountdowns();
  }, 60000); // Update every minute

  const handleCompleteItem = useCallback((id: number) => {
    markCompleted(id);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1">
        {/* Enhanced Header */}
        <View className="px-4 py-6 bg-white dark:bg-gray-800 shadow-lg rounded-b-3xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-3xl font-rbold text-gray-900 dark:text-white">My Schedule</Text>
            <View className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-xl">
              <Text className="text-lg font-rmedium text-blue-600 dark:text-blue-300">
                <Memo>{time}</Memo>
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-xl">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#F59E0B" />
              <Text className="ml-2 text-amber-700 dark:text-amber-300 font-rmedium">
                5 day streak 🔥
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Calendar */}
        <Memo>
          {() => (
            <View className="mx-4 mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
              <Calendar
                current={currentTime.get().toISOString()}
                onMonthChange={(month: any) => currentTime.set(new Date(month.timestamp))}
                onDayPress={(day: any) => currentTime.set(new Date(day.timestamp))}
                onDayLongPress={(day: any) => currentTime.set(new Date(day.timestamp))}
                theme={{
                  ...(theme.get() === 'dark' ? CALENDAR_THEME.dark : CALENDAR_THEME.light),
                  textDayFontFamily: 'roboto-bold',
                  textMonthFontFamily: 'roboto-bold',
                  textDayHeaderFontFamily: 'roboto-bold',
                  textDayFontWeight: '400',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>
          )}
        </Memo>

        {/* Enhanced Tasks List */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-rmedium text-gray-900 dark:text-white">
              Today's Schedule
            </Text>
            <TouchableOpacity
              className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full shadow-lg shadow-blue-600/30"
              onPress={() => scheduleStore.isAddingItem.set(true)}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Memo>
            {() =>
              items
                .get()
                .map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onComplete={handleCompleteItem}
                    handlePostpone={handlePostpone}
                    theme={theme.get() as any}
                  />
                ))
            }
          </Memo>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default CalendarApp;
