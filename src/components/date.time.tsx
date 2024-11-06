import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

interface DateTimePickerProps {
  value: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  showDatePicker: boolean;
  showTimePicker: boolean;
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
}: DateTimePickerProps) => {
  return (
    <View className="space-y-4 mt-3">
      <Animated.View entering={FadeIn.duration(500)} className="p-4 rounded-2xl">
        <View className="flex-row justify-between items-start space-x-4 gap-4">
          {/* Date Section */}
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Feather name="calendar" size={16} color="#E5E7EB" />
              <Text className="text-sm font-plregular text-gray-200 ml-2">Date</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white/10 p-4 rounded-xl border border-white/20"
            >
              <Text className="text-white font-medium">{format(value || new Date(), 'PPP')}</Text>
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
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Feather name="clock" size={16} color="#E5E7EB" />
              <Text className="text-sm font-plregular text-gray-200 ml-2">Time</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-white/10 p-4 rounded-xl border border-white/20"
            >
              <Text className="text-white font-medium">{format(value || new Date(), 'p')}</Text>
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
        </View>

        {/* Decorative Elements */}
        <View className="absolute top-2 right-2 opacity-20">
          <View className="w-20 h-20 rounded-full bg-white/10 absolute -top-10 -right-10" />
          <View className="w-12 h-12 rounded-full bg-white/15 absolute -top-6 -right-6" />
        </View>
      </Animated.View>
    </View>
  );
};

export default DateTimePickerComponent;
