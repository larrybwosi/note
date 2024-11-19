import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Reference } from './ts';
import { BaseReference } from 'src/store/notes/types';

interface ReferenceItemProps {
  reference: BaseReference;
}

export const ReferenceItem: React.FC<ReferenceItemProps> = ({ reference }) => {
  const getIcon = (type: Reference['type']) => {
    switch (type) {
      case 'book':
        return 'book';
      case 'website':
        return 'globe';
      case 'article':
        return 'file-alt';
      case 'video':
        return 'video';
      default:
        return 'bookmark';
    }
  };

  return (
    <View className="bg-gray-100 rounded-lg p-3 mb-2">
      <View className="flex-row items-center">
        <FontAwesome5
          name={getIcon(reference.type)}
          size={16}
          color="#374151"
          style={{ marginRight: 8 }}
        />
        <Text className="font-semibold text-gray-800 flex-1">{reference.title}</Text>
      </View>
      {reference.author && (
        <Text className="text-gray-600 text-sm mt-1">by {reference.author}</Text>
      )}
      {reference.url && (
        <TouchableOpacity
          className="mt-1"
          onPress={() => {
            // Handle URL opening logic here
            console.log('Opening URL:', reference.url);
          }}
          accessibilityRole="link"
          accessibilityHint={`Open ${reference.title} website`}
        >
          <Text className="text-blue-500 text-sm">{reference.url}</Text>
        </TouchableOpacity>
      )}
      {reference.page && (
        <Text className="text-gray-600 text-sm mt-1">Page: {reference.page}</Text>
      )}
    </View>
  );
};

export default ReferenceItem;