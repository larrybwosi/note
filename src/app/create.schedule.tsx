import { TouchableOpacity, View,Text, ScrollView, TextInput } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { observer, Reactive, useObservable } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileTextIcon, Sparkles, Tag } from 'lucide-react-native';
import { router } from 'expo-router';

import { PRIORITY_LEVELS, RECURRENCE_PATTERNS, TASK_TYPES } from 'src/store/shedule/types';
import DateTimePickerComponent from 'src/components/date.time';
import useScheduleStore from 'src/store/shedule/actions';
import { scheduleStore } from 'src/store/shedule/store';
import { priorityColors, typeColors } from 'src/utils/theme/shedule';

const CreateShedule = () => {
  const isEvent = scheduleStore.newItem.scheduleType.get() === 'event';
  const showDatePicker$ = useObservable(false);
  const showTimePicker$ = useObservable(false);
  const showDatePicker = showDatePicker$.get();
  const showTimePicker = showDatePicker$.get();

  const { addItem, resetForm } = useScheduleStore();

  const submit =async()=>{
    await addItem()
    router.back()
  }
  return (
    <SafeAreaView className="flex-1 justify-end bg-black/50">
      <Animated.View
        entering={SlideInRight}
        exiting={SlideOutLeft}
        className="bg-white dark:bg-gray-800 rounded-t-2xl p-5"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className='justify-between flex-row'>
            <Text className="text-xl font-abold text-gray-900 dark:text-white mb-4">
              {scheduleStore.editingItem.get() ? 'Edit Item' : 'Add New Item'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/ai.create.schedule")}
              className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
            >
              <Sparkles size={20} color="white" />
              <Text className="text-white font-rmedium ml-1">Try Ai</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            {/* Schedule Type Selection */}
            <View>
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
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
                      className={`text-center font-amedium ${
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
            <View className="my-2">
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
                 Title *
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 font-aregular rounded-xl text-gray-900 dark:text-white"
                placeholder="Enter description..."
                value={scheduleStore.newItem.title.get()}
                onChangeText={scheduleStore.newItem.title.set}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View className="my-2">
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </Text>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white font-aregular"
                placeholder="Enter description..."
                value={scheduleStore.newItem.description.get()}
                onChangeText={(text) => scheduleStore.newItem.description.set(text)}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Task Category Selection */}
            <View className="my-2">
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
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
                            : 'text-gray-700 dark:text-gray-300 font-amedium text-sm'
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
            <View className="my-2">
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
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
                      className={`text-center text-sm font-amedium ${
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

            <View className="my-2">
              <Text className="text-sm font-amedium text-gray-700 dark:text-gray-300 mb-2">
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
            <View className="my-2">
              <Text className="text-sm font-amedium text-gray-700 dark:text-gray-300 mb-2">
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
                        className={`font-abold${ 
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
              <View className="my-2">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location *
                </Text>
                <Reactive.TextInput
                  $className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                  $placeholder="Enter location..."
                  $value={scheduleStore.newItem.location?.get() || ''}
                  $onChangeText={(text) => scheduleStore.newItem.location?.set(text)}
                  $placeholderTextColor="#9CA3AF"
                />
                {isEvent && !scheduleStore.newItem.location?.get() && (
                  <Text className="text-sm text-rose-500 mt-1">
                    Location is required for events
                  </Text>
                )}
              </View>
            )}

            {/* Reminder Setting */}
            <View className="my-2">
              <Text className="text-sm font-amedium text-gray-700 dark:text-gray-300 mb-2">
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
            <View className="my-2">
              <View className="flex-row items-center py-2 border-b border-gray-200 dark:border-gray-700 gap-2">
              <Text className="text-sm font-abold text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma separated)
              </Text>
                <Tag size={16} color="#9CA3AF" className='mb-3' />
              </View>
              <Reactive.TextInput
                $className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white"
                $placeholder="Enter tags..."
                $value={scheduleStore.newItem?.tags?.get()?.join(', ')}
                $onChangeText={(text) => {
                  const tags = text
                    ?.split(',')
                    ?.map((tag) => tag.trim())
                    ?.filter((tag) => tag.length > 0);
                  scheduleStore.newItem.tags.set(tags);
                }}
                $placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Notes */}
            <View className="my-2">
              <View className="flex-row items-center py-2 border-b border-gray-200 dark:border-gray-700 gap-2">
                <Text className="text-lg font-amedium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </Text>
                <FileTextIcon size={16} color="#9CA3AF" className='mb-3' />
              </View>
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl text-gray-900 dark:text-white min-h-[100px]"
                placeholder="Enter any additional notes..."
                value={scheduleStore.newItem.notes.get()}
                onChangeText={scheduleStore.newItem.notes.set}
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-6 mb-4">
            <TouchableOpacity
              onPress={()=>{
                resetForm()
                router.back()
              }}
              className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
            >
              <Text className="text-center font-amedium text-gray-900 dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={submit}
              className={`flex-1 p-4 rounded-xl ${
                isFormValid() ? 'bg-cyan-600 dark:bg-cyan-400' : 'bg-cyan-100 dark:bg-cyan-900/30'
              }`}
              disabled={!isFormValid()}
            >
              <Text className="text-center font-amedium text-white">
                {scheduleStore.editingItem.get() ? 'Update' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// Form validation function
const isFormValid = () => {
  const newItem = scheduleStore.newItem;
  const isEvent = newItem.scheduleType.get() === 'event';

  const hasRequiredFields =
    newItem?.title?.get()?.trim() !== '' || undefined &&
    newItem?.duration?.get()! > 0 &&
    newItem?.startDate?.get() !== null;

  if (isEvent) {
    return hasRequiredFields && newItem.location?.get()?.trim() !== '';
  }

  return hasRequiredFields;
};

export default observer(CreateShedule);
