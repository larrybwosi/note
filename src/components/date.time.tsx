import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CalendarDays, Clock } from 'lucide-react-native';
import { format } from 'date-fns';

interface DateTimePickerProps {
	value: Date;
	onDateChange: (date: Date) => void;
	onTimeChange: (time: Date) => void;
	showDatePicker: boolean;
	showTimePicker: boolean;
	timeSelection: boolean;
	setShowDatePicker: (value: boolean) => void;
	setShowTimePicker: (value: boolean) => void;
}
const DateTimePickerComponent = ({
	value,
	onDateChange,
	onTimeChange,
	showDatePicker,
	showTimePicker,
	setShowDatePicker,
	setShowTimePicker,
	timeSelection = true,
}: DateTimePickerProps) => {
	return (
		<View className="space-y-4 mt-3">
			<Animated.View entering={FadeIn.duration(500)} className="p-4 rounded-2xl">
				<View className="flex-row justify-between items-start space-x-4 gap-4">
					{/* Date Section */}
					<View className="flex-1">
						<View className="flex-row items-center mb-2">
							<CalendarDays size={16} color="gray" />
							<Text className="text-sm font-amedium dark:text-gray-200 ml-2">Date</Text>
						</View>
						<TouchableOpacity
							onPress={() => setShowDatePicker(true)}
							className="bg-white/10 p-4 rounded-xl border border-white/20"
						>
							<Text className="dark:text-white font-aregular text-sm">
								{format(value || new Date(), 'PPP')}
							</Text>
							{showDatePicker && (
								<DateTimePicker
									value={value || new Date()}
									mode="date"
									display="default"
									minimumDate={new Date()}
									onChange={(event, selectedDate) => {
										setShowDatePicker(false);
										if (selectedDate) {
											onDateChange(selectedDate);
										}
									}}
									onError={() => setShowDatePicker(false)}
									onTouchCancel={() => setShowDatePicker(false)}
								/>
							)}
						</TouchableOpacity>
					</View>

					{/* Time Section */}
					{timeSelection && (
						<View className="flex-1">
							<View className="flex-row items-center mb-2">
								<Clock size={16} color="gray" />
								<Text className="text-sm font-amedium dark:text-gray-200 ml-2">Time</Text>
							</View>
							<TouchableOpacity
								onPress={() => setShowTimePicker(true)}
								className="bg-white/10 p-4 rounded-xl border border-white/20"
							>
								<Text className="dark:text-white font-aregular text-sm">
									{format(value || new Date(), 'p')}
								</Text>
								{showTimePicker && (
									<DateTimePicker
										value={value || new Date()}
										mode="time"
										display="clock"
										onChange={(event, selectedDate) => {
											setShowTimePicker(false);
											if (selectedDate) {
												onTimeChange(selectedDate);
											}
										}}
										onError={() => setShowTimePicker(false)}
										onTouchCancel={() => setShowTimePicker(false)}
									/>
								)}
							</TouchableOpacity>
						</View>
					)}
				</View>
			</Animated.View>
		</View>
	);
};

export default DateTimePickerComponent;
