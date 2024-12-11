import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bookmark, Trash2Icon } from 'lucide-react-native';
import { LinearGradient } from "expo-linear-gradient";
import Animated, { SlideInRight, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { router } from 'expo-router';
import { Note, Category } from 'src/store/notes/types';
import { useNotes } from "src/store/notes/actions";

interface EnhancedNoteCardProps {
  note: Note;
  category: Category;
}

export const EnhancedNoteCard: React.FC<EnhancedNoteCardProps> = ({ note, category }) => {
  const { deleteNote } = useNotes();
  const scheme = category.colorScheme || { gradient: ['#CBD5E1', '#94A3B8'] as [string, string] };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={SlideInRight}
      style={animatedStyle}
      className="my-4 rounded-2xl overflow-hidden shadow-md"
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        onPress={() => router.navigate(`note.view?noteId=${note.id}`)}
      >
        <LinearGradient
          colors={scheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5"
        >
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-xl font-rbold text-white mb-1" numberOfLines={1}>
                {note.title}
              </Text>
              <Text className="text-xs text-white/80 capitalize font-rregular">
                {category.name}
              </Text>
            </View>
            {note.isBookmarked && (
              <Bookmark size={24} color="#ffffff" fill="#ffffff" />
            )}
          </View>
          <Text className="text-white mb-4 leading-6 font-aregular text-sm" numberOfLines={3}>
            {note.content}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {note.tags && note.tags.map((tag, index) => (
              <View key={index} className="bg-white/20 px-2.5 py-1 rounded-full">
                <Text className="text-white text-xs">#{tag}</Text>
              </View>
            ))}
          </View>
          <View className='flex-row justify-between items-center mt-3'>
            <View className="flex-row items-center">
              <category.icon size={16} color="#ffffff" />
              <Text className="ml-2 text-sm text-white/80">{category.name}</Text>
            </View>
            <Text className="text-white/80 text-xs font-aregular">
              {note.lastEdited.toLocaleDateString()}
            </Text>
            <TouchableOpacity onPress={() => deleteNote(note.id)}>
              <Trash2Icon size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

