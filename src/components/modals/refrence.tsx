import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { observer } from '@legendapp/state/react';
import { Book, Link, Video, Newspaper } from 'lucide-react-native';
import { Reference } from 'src/store/notes/types';

export interface AddReferenceModalProps {
  onAddReference: () => void;
  newReference: any;
  handleFieldChange: (field: keyof Reference, value: Reference['type']) => void
}

const AddReferenceModal: React.FC<AddReferenceModalProps> = observer(({ onAddReference, newReference,handleFieldChange }) => {
  const referenceTypes = [
    { type: 'book', icon: Book, label: 'Book' },
    { type: 'website', icon: Link, label: 'Website' },
    { type: 'video', icon: Video, label: 'Video' },
    { type: 'article', icon: Newspaper, label: 'Article' },
  ];


  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <Text className="text-2xl font-rbold text-gray-900 dark:text-gray-100 mb-4">
        Add Reference
      </Text>
      <View className="mb-4">
        <Text className="text-gray-700 dark:text-gray-300 mb-2">Type</Text>
        <View className="flex-row justify-between">
          {referenceTypes.map((item) => (
            <TouchableOpacity
              key={item.type}
              onPress={() => handleFieldChange('type', item.type as Reference['type'])}
              className={`p-3 rounded-lg ${
                newReference.type === item.type
                  ? 'bg-indigo-100 dark:bg-indigo-900'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <item.icon
                size={24}
                color={newReference.type === item.type ? '#6366F1' : '#9CA3AF'}
              />
              <Text
                className={`text-sm mt-1 ${
                  newReference.type === item.type
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View className="mb-4">
        <Text className="text-gray-700 dark:text-gray-300 mb-2">Title</Text>
        <TextInput
          value={newReference.title}
          onChangeText={(text) => handleFieldChange('title', text)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-lg"
          placeholder="Enter reference title"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View className="mb-4">
        <Text className="text-gray-700 dark:text-gray-300 mb-2">URL</Text>
        <TextInput
          value={newReference.url}
          onChangeText={(text) => handleFieldChange('url', text)}
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 rounded-lg"
          placeholder="Enter reference URL"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <TouchableOpacity
        onPress={onAddReference}
        className="bg-indigo-500 p-3 rounded-lg items-center"
      >
        <Text className="text-white font-rbold">Add Reference</Text>
      </TouchableOpacity>
    </View>
  );
});

export default AddReferenceModal;
