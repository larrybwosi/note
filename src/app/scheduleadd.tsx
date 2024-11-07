import { observer, useObservable } from '@legendapp/state/react';
import { Text } from 'react-native';
import { TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
// import { TASK_TYPES, PRIORITY_LEVELS, RECURRENCE_PATTERNS } from '../storage/schedule';
import useScheduleStore from 'src/store/shedule/actions';
import { scheduleStore } from 'src/store/shedule/store';
import DateTimePickerComponent from 'src/components/date.time';
import { PRIORITY_LEVELS, RECURRENCE_PATTERNS, TASK_TYPES } from 'src/store/shedule/types';

const priorityColors = {
  Low: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    light: 'bg-emerald-100',
    border: 'border-emerald-500',
  },
  Medium: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    light: 'bg-blue-100',
    border: 'border-blue-500',
  },
  High: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    light: 'bg-amber-100',
    border: 'border-amber-500',
  },
  Critical: {
    bg: 'bg-rose-500',
    text: 'text-rose-500',
    light: 'bg-rose-100',
    border: 'border-rose-500',
  },
};

const typeColors = {
  Work: { bg: 'bg-blue-100', text: 'text-blue-600' },
  Personal: { bg: 'bg-green-100', text: 'text-green-600' },
  Health: { bg: 'bg-rose-100', text: 'text-rose-600' },
  Learning: { bg: 'bg-purple-100', text: 'text-purple-600' },
  Social: { bg: 'bg-amber-100', text: 'text-amber-600' },
  Urgent: { bg: 'bg-red-100', text: 'text-red-600' },
};

const AddItem = () => {
  const isEvent = scheduleStore.newItem.scheduleType.get() === 'event';
  const showDatePicker$ = useObservable(false);
  const showTimePicker$ = useObservable(false);
  const showDatePicker = showDatePicker$.get();
  const showTimePicker = showDatePicker$.get();

  const { addItem, resetForm } = useScheduleStore();
  return (
    <View className="flex-1 justify-end bg-black/50">
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutLeft}
        className="bg-white dark:bg-gray-800 rounded-t-3xl p-5"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-xl font-rbold text-gray-900 dark:text-white mb-4">
            {scheduleStore.editingItem.get() ? 'Edit Item' : 'Add New Item'}
          </Text>

          <View className="space-y-3">
            {/* Schedule Type Selection */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Type
              </Text>
              <View className="flex-row gap-3">
                {['task', 'event'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => scheduleStore.newItem.scheduleType.set(type as 'task' | 'event')}
                    className={`flex-1 p-4 rounded-xl border ${
                      scheduleStore.newItem.scheduleType.get() === type
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        scheduleStore.newItem.scheduleType.get() === type
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title Input */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter title..."
                value={scheduleStore.newItem.title.get()}
                onChangeText={(text) => scheduleStore.newItem.title.set(text)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description Input */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Description
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter description..."
                value={scheduleStore.newItem.description.get()}
                onChangeText={(text) => scheduleStore.newItem.description.set(text)}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Task Type Selection */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 py-2">
                  {TASK_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => scheduleStore.newItem.type.set(type)}
                      className={`px-4 py-2 rounded-xl ${
                        scheduleStore.newItem.type.get() === type
                          ? typeColors[type].bg
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`${
                          scheduleStore.newItem.type.get() === type
                            ? typeColors[type].text
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Priority Selection */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </Text>
              <View className="flex-row gap-2">
                {PRIORITY_LEVELS.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => scheduleStore.newItem.priority.set(priority)}
                    className={`flex-1 p-3 rounded-xl border ${
                      scheduleStore.newItem.priority.get() === priority
                        ? `${priorityColors[priority].light} ${priorityColors[priority].border}`
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        scheduleStore.newItem.priority.get() === priority
                          ? priorityColors[priority].text
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date and Time Selection */}
            <DateTimePickerComponent
              value={scheduleStore.newItem.startDate.get() || new Date()}
              onDateChange={(selectedDate) => scheduleStore.newItem.startDate.set(selectedDate)}
              onTimeChange={(selectedDate) => scheduleStore.newItem.startDate.set(selectedDate)}
              showDatePicker={showDatePicker}
              showTimePicker={showTimePicker}
              setShowDatePicker={showDatePicker$.set}
              setShowTimePicker={showTimePicker$.set}
            />

            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter duration..."
                value={scheduleStore.newItem.duration.get()?.toString()}
                onChangeText={(text) => scheduleStore.newItem.duration.set(parseInt(text) || 30)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Recurrence Pattern */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Recurrence
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 py-2">
                  {RECURRENCE_PATTERNS.map((pattern) => (
                    <TouchableOpacity
                      key={pattern}
                      onPress={() => scheduleStore.newItem.recurrence.set(pattern)}
                      className={`px-4 py-2 rounded-xl ${
                        scheduleStore.newItem.recurrence.get() === pattern
                          ? 'bg-teal-100 dark:bg-teal-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Text
                        className={`${
                          scheduleStore.newItem.recurrence.get() === pattern
                            ? 'text-teal-600 dark:text-teal-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pattern}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Location (Required for events) */}
            {isEvent && (
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </Text>
                <TextInput
                  className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  placeholder="Enter location..."
                  value={scheduleStore.newItem.location?.get() || ''}
                  onChangeText={(text) => scheduleStore.newItem.location?.set(text)}
                  placeholderTextColor="#9CA3AF"
                />
                {isEvent && !scheduleStore.newItem.location?.get() && (
                  <Text className="text-sm text-rose-500 mt-1">
                    Location is required for events
                  </Text>
                )}
              </View>
            )}

            {/* Reminder Setting */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Reminder (minutes before)
              </Text>
              <View className="flex-row gap-2">
                {[5, 15, 30, 60].map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    onPress={() => scheduleStore.newItem.reminder.set(minutes)}
                    className={`flex-1 p-3 rounded-xl border ${
                      scheduleStore.newItem.reminder.get() === minutes
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-center font-medium ${
                        scheduleStore.newItem.reminder.get() === minutes
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {minutes}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags Input */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter tags..."
                value={scheduleStore.newItem?.tags?.get()?.join(', ')}
                onChangeText={(text) => {
                  const tags = text
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                  scheduleStore.newItem.tags.set(tags);
                }}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-plregular text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white min-h-[100px]"
                placeholder="Enter any additional notes..."
                value={scheduleStore.newItem.notes.get()}
                onChangeText={(text) => scheduleStore.newItem.notes.set(text)}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-6 mb-4">
            <TouchableOpacity
              onPress={resetForm}
              className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
            >
              <Text className="text-center font-plregular text-gray-900 dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addItem}
              className={`flex-1 p-4 rounded-xl ${
                isFormValid() ? 'bg-cyan-600 dark:bg-cyan-400' : 'bg-cyan-100 dark:bg-cyan-900/30'
              }`}
              disabled={!isFormValid()}
            >
              <Text className="text-center font-plregular text-white">
                {scheduleStore.editingItem.get() ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// Form validation function
const isFormValid = () => {
  const newItem = scheduleStore.newItem;
  const isEvent = newItem.scheduleType.get() === 'event';

  const hasRequiredFields =
    newItem?.title?.get()?.trim() !== '' &&
    newItem?.duration?.get()! > 0 &&
    newItem?.startDate?.get() !== null;

  if (isEvent) {
    return hasRequiredFields && newItem.location?.get()?.trim() !== '';
  }

  return hasRequiredFields;
};

export default observer(AddItem);
