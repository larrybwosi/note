import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Plus, X } from 'lucide-react-native';

interface TagsListProps {
  tags: string[];
  onAddTag: (newTag: string) => void;
  onRemoveTag: (tagToRemove: string) => void;
}

export const TagsList: React.FC<TagsListProps> = ({ tags, onAddTag, onRemoveTag }) => {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (newTag) {
      onAddTag(newTag);
      setNewTag('');
      setIsAdding(false);
    }
  };

  return (
    <View>
      <View className="flex-row flex-wrap">
        {tags.map((tag) => (
          <View key={tag} className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
            <Text className="text-gray-800 dark:text-gray-200 mr-2">{tag}</Text>
            <TouchableOpacity onPress={() => onRemoveTag(tag)}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {isAdding ? (
        <View className="flex-row mt-2">
          <TextInput
            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-lg mr-2"
            placeholder="New tag"
            placeholderTextColor="#9CA3AF"
            value={newTag}
            onChangeText={setNewTag}
          />
          <TouchableOpacity 
            onPress={handleAddTag}
            className="bg-blue-500 p-2 rounded-lg items-center justify-center"
          >
            <Text className="text-white font-rbold">Add</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => setIsAdding(true)}
          className="flex-row items-center mt-2"
        >
          <Plus size={20} color="#9CA3AF" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">Add Tag</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

