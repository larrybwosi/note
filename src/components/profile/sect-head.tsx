import React from 'react';
import { View, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View className="mt-6 mb-4">
      <Text className="text-xl font-rbold text-gray-900 dark:text-white">
        {title}
      </Text>
      <View className="h-1 w-20 bg-blue-500 mt-2 rounded-full" />
    </View>
  );
};

