import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { scheduleStore } from 'src/store/shedule/store';
import { format } from 'date-fns';
import DateTimePickerComponent from '../date.time';
import useScheduleStore from 'src/store/shedule/actions';
import { observer, useObservable } from '@legendapp/state/react';


export interface PostponeProps {
  itemId: string;
  isVisible: boolean;
}

const Postpone: React.FC<PostponeProps & { onClose: () => void }> = ({ itemId, onClose }) => {

	const { postponeTask } = useScheduleStore();
	const state$ = useObservable({
		showDatePicker: false,
		showTimePicker: false,
		newDate: new Date(),
		newTime: new Date(),
		reason: '',
	});

	const { showDatePicker, showTimePicker, reason, newDate } = state$;
	const rsn = reason.get()
	const setReason = reason.set

	const handlePostpone = async() => {
		await postponeTask(itemId as any, newDate.get(), {reason:rsn, reasonCategory:'Unavailable',impact:'High'});
		onClose();
	};

  return (
    <View className="space-y-4">
      <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-2">
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
				value={rsn}
				onChangeText={setReason}
				multiline
				numberOfLines={3}
			/>

      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-lg"
        onPress={handlePostpone}
      >
        <Text className="text-white font-amedium text-center">Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default observer(Postpone);

