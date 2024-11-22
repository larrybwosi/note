import React from 'react';
import { Text } from 'react-native';

interface FormLabelProps {
  label: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ label }) => (
  <Text className="text-sm font-amedium text-gray-700 dark:text-gray-300 mb-2">
    {label}
  </Text>
);

