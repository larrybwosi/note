import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RecurrenceFrequency } from 'src/store/types';
import { Clock } from 'lucide-react-native';

interface RecurrenceSelectorProps {
  selectedRecurrence: RecurrenceFrequency;
  onSelectRecurrence: (recurrence: RecurrenceFrequency) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  selectedRecurrence,
  onSelectRecurrence,
}) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4">
        <Clock size={24} color="#4B5563" className="mr-2" />
        <Text className="text-lg font-rmedium text-gray-900 dark:text-white">Recurrence</Text>
      </View>
      <View className="flex-row flex-wrap">
        {Object.values(RecurrenceFrequency).map((frequency) => (
          <TouchableOpacity
            key={frequency}
            className={`mr-2 mb-2 px-4 py-2 rounded-full ${
              selectedRecurrence === frequency ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onPress={() => onSelectRecurrence(frequency)}
          >
            <Text
              className={`font-rmedium ${
                selectedRecurrence === frequency ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}
            >
              {frequency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

