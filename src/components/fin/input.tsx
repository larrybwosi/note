import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

interface InputFieldProps extends TextInputProps {}

export const InputField: React.FC<InputFieldProps> = (props) => {
  return (
    <TextInput
      className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3"
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};

