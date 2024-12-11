import { View, Text, TextInput } from 'react-native';
import { observer } from '@legendapp/state/react';

const LabelField = observer(({ label, value}) => {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-amedium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
        <Text className="bg-gray-50 font-rregular dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg">
          {value}
        </Text>
      <View className="h-0.5 bg-gray-300 dark:bg-gray-700 mt-1" />
    </View>
  );
});

export default LabelField