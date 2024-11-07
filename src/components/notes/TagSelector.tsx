import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

interface TagOption {
  id: string;
  name: string;
  color: string;
}

interface TagSelectorProps {
  tagOptions: TagOption[];
  selectedTags: string[];
  onTagPress: (tagName: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tagOptions,
  selectedTags,
  onTagPress,
}) => (
  <View className="mb-4">
    <Text className="text-base font-rbold mb-2">Tags</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {tagOptions.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          onPress={() => onTagPress(tag.name)}
          className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
            selectedTags.includes(tag.name) ? tag.color : 'bg-gray-200'
          }`}
        >
          <Text
            className={`${
              selectedTags.includes(tag.name) ? 'text-white' : 'text-gray-700'
            } font-rmedium text-sm`}
          >
            {tag.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);