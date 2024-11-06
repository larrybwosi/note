import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useObservable } from '@legendapp/state/react';
import { colorScheme } from 'nativewind';
import { format } from 'date-fns';

import useScheduleStore from 'src/store/shedule/actions';
import { scheduleStore } from 'src/store/shedule/store';
import DateTimePickerComponent from '../date.time';
import { useModal } from './provider';

const Postpone = () => {
  const { postponeTask } = useScheduleStore();
  const {
    hide,
    props: { itemId },
  } = useModal('postpone');

  const state$ = useObservable({
    showPostponeModal: false,
    showDatePicker: false,
    selectTime: false,
    showTimePicker: false,
    newDate: new Date(),
    newTime: new Date(),
    reason: '',
  });

  const { showDatePicker, showTimePicker, reason, newDate, showPostponeModal } = state$;

  const handlePostpone = () => {
    postponeTask(itemId, newDate.get(), reason.get(), 'Unavailable', 'Low');
    hide();
  };
  return (
    <Modal
      visible={showPostponeModal.get()}
      transparent
      animationType="slide"
      onRequestClose={() => showPostponeModal.set(false)}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
          <Text className="text-2xl font-plregular text-gray-900 dark:text-white mb-6">
            Postpone Item
          </Text>

          <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
            New Date & Time
          </Text>
          <TouchableOpacity
            onPress={() => showDatePicker.set(true)}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4 border border-gray-200 dark:border-gray-600"
          >
            <Text className="text-gray-900 dark:text-white font-rmedium">
              {format(scheduleStore.postponeData.newDate.get(), 'PPP p')}
            </Text>
          </TouchableOpacity>

          {/* Date and Time Selection */}
          <DateTimePickerComponent
            value={newDate.get() || new Date()}
            onDateChange={(selectedDate) => newDate.set(selectedDate)}
            onTimeChange={(selectedDate) => newDate.set(selectedDate)}
            showDatePicker={showDatePicker.get()}
            showTimePicker={showTimePicker.get()}
            setShowDatePicker={showDatePicker.set}
            setShowTimePicker={showTimePicker.set}
          />

          <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-2">
            Reason for Postponement
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            placeholder="Enter reason..."
            value={reason.get()}
            onChangeText={(text) => reason.set(text)}
            multiline
            numberOfLines={3}
            placeholderTextColor={colorScheme.get() === 'dark' ? '#9CA3AF' : '#6B7280'}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => hide()}
              className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600"
            >
              <Text className="text-center font-plregular text-gray-900 dark:text-white">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePostpone}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-xl"
              disabled={!reason.get()}
            >
              <Text className="text-center font-plregular text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Postpone;
