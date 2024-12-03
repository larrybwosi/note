import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { observer } from '@legendapp/state/react';
import { ObservableObject } from '@legendapp/state';

export const InputField = observer(({ label, value, editable = true, ...props }) => {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-amedium text-gray-700 dark:text-gray-300">
        {label}
      </Text>
      {editable ? (
        <TextInput
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-700"
          value={value.get()}
          onChangeText={(text) => value.set(text)}
          {...props}
        />
      ) : (
        <Text className="bg-gray-50 font-rregular dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg">
          {value.get()}
        </Text>
      )}
      <View className="h-0.5 bg-gray-300 dark:bg-gray-700 mt-1" />
    </View>
  );
});

