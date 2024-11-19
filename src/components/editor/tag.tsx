import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { observer } from '@legendapp/state/react';
import { XCircle } from 'lucide-react-native';

const TagManager = observer(({ editorState }) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !editorState.tags.get().includes(newTag)) {
      editorState.tags.push(newTag);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    editorState.tags.set(prev => prev.filter(t => t !== tag));
  };

  return (
    <View className="mt-4">
      <Text className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Tags</Text>
      <View className="flex-row flex-wrap mb-2">
        {editorState.tags.get().map((tag) => (
          <View key={tag} className="bg-indigo-100 dark:bg-indigo-800 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
            <Text className="text-indigo-800 dark:text-indigo-200 mr-2">{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
              <XCircle size={16} color="#4a5568" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View className="flex-row">
        <TextInput
          value={newTag}
          onChangeText={setNewTag}
          placeholder="Add a new tag"
          placeholderTextColor={editorState.theme.get() === 'dark' ? '#a0aec0' : '#4a5568'}
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-l-lg px-4 py-2 text-gray-800 dark:text-gray-200"
        />
        <TouchableOpacity onPress={addTag} className="bg-indigo-500 rounded-r-lg px-4 py-2 justify-center">
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default TagManager;