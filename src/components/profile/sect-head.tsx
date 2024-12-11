import React from 'react';
import { View, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title}) => {
  return (
    <View className="mt-6 mb-4">
      <Text className={`text-xl font-rbold text-white dark:text-gray-900`}>
        {title}
      </Text>
      <View className={`h-0.5 mt-2 bg-gray-700 dark:bg-gray-300`} />
    </View>
  );
};

