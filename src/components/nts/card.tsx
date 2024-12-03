import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { Category } from 'src/store/notes/types';
import { Note } from 'src/store/notes/types';
import { router } from 'expo-router';

interface NoteCardProps {
  note: Note;
  category: Category;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, category }) => {
  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: category.color,
      }}
      onPress={()=>router.navigate('id')}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-rbold text-gray-900 dark:text-white">{note.title}</Text>
        {note.isBookmarked && <Bookmark size={20} color={category.color} fill={category.color} />}
      </View>
      <Text className="text-gray-600 dark:text-gray-400 mb-2" numberOfLines={2}>
        {note.content}
      </Text>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <category.icon size={16} color={category.color} />
          <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">{category.name}</Text>
        </View>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {note.lastEdited.toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

