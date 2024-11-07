import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useObservable, observer } from '@legendapp/state/react';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import Animated, { 
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';

// Enhanced color palette with professional gradients
const colorSchemes = {
  research: {
    gradient: ['#4158D0', '#C850C0'],
    accent: '#8B5CF6',
  },
  project: {
    gradient: ['#0093E9', '#80D0C7'],
    accent: '#3B82F6',
  },
  class: {
    gradient: ['#8EC5FC', '#E0C3FC'],
    accent: '#6366F1',
  },
  personal: {
    gradient: ['#FAD961', '#F76B1C'],
    accent: '#F59E0B',
  },
  ideas: {
    gradient: ['#84FAB0', '#8FD3F4'],
    accent: '#10B981',
  }
};

// Enhanced themes
const themes = {
  light: {
    background: '#ffffff',
    text: '#1F2937',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#8B5CF6',
    border: '#E5E7EB',
    cardBg: '#F9FAFB',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#111827',
    text: '#F9FAFB',
    primary: '#60A5FA',
    secondary: '#3B82F6',
    accent: '#8B5CF6',
    border: '#374151',
    cardBg: '#1F2937',
    error: '#EF4444',
    success: '#10B981',
  },
};

// Enhanced types
type NoteCategory = 'research' | 'project' | 'class' | 'personal' | 'ideas';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: NoteCategory;
  lastEdited: Date;
  isBookmarked: boolean;
}

// Global state
const globalState = observable({
  theme: 'light' as 'light' | 'dark',
  notes: [] as Note[],
  searchQuery: '',
  showOnboarding: true,
  isMenuOpen: false,
  selectedCategory: 'all' as 'all' | NoteCategory,
});

const CleveryEditor: React.FC = observer(() => {
  const state = useObservable(globalState);

  useEffect(() => {
    if (state.notes.length === 0) {
      const mockNotes: Note[] = [
        {
          id: '1',
          title: 'Research: AI in Healthcare',
          content: 'Recent developments in AI are revolutionizing healthcare diagnostics...',
          tags: ['AI', 'healthcare', 'research'],
          category: 'research',
          lastEdited: new Date(),
          isBookmarked: true,
        },
        {
          id: '2',
          title: 'Project: Mobile App Architecture',
          content: 'Key considerations for scalable mobile architecture...',
          tags: ['mobile', 'architecture', 'development'],
          category: 'project',
          lastEdited: new Date(),
          isBookmarked: false,
        },
        {
          id: '3',
          title: 'Advanced Data Structures',
          content: 'Notes from today\'s lecture on balanced trees and heap implementations...',
          tags: ['CS', 'algorithms', 'study'],
          category: 'class',
          lastEdited: new Date(),
          isBookmarked: true,
        },
      ];
      state.notes.set(mockNotes);
    }
  }, []);

  const theme = themes[state.theme.get()];

  const EmptyState: React.FC = () => (
    <Animated.View 
      entering={FadeInDown}
      style={{
        alignItems: 'center',
        padding: 24,
        marginTop: 40,
      }}
    >
      <MaterialIcons name="note-add" size={80} color={theme.secondary} />
      <Text style={{ 
        fontSize: 24, 
        fontWeight: 'bold',
        color: theme.text,
        marginTop: 24,
        marginBottom: 12,
      }}>
        Start Your Journey
      </Text>
      <Text style={{ 
        color: theme.secondary,
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 24,
      }}>
        Create your first note by tapping the + button below.
        Organize your thoughts across different categories:
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {Object.keys(colorSchemes).map((category) => (
          <Chip key={category} label={category} />
        ))}
      </View>
    </Animated.View>
  );

  const Chip: React.FC<{ label: string }> = ({ label }) => (
    <LinearGradient
      colors={colorSchemes[label as NoteCategory]?.gradient || ['#CBD5E1', '#94A3B8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
      }}
    >
      <Text style={{ color: '#ffffff', fontSize: 14, textTransform: 'capitalize' }}>
        {label}
      </Text>
    </LinearGradient>
  );

  const NoteBlock: React.FC<{ note: Note }> = observer(({ note }) => (
    <Animated.View
      entering={SlideInRight}
      className="m-4 rounded-2xl overflow-hidden shadow-md"
    >
      <LinearGradient
        colors={colorSchemes[note.category].gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5"
      >
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-xl font-rbold text-white mb-1">
              {note.title}
            </Text>
            <Text className="text-xs text-white/80 capitalize font-rregular">
              {note.category}
            </Text>
          </View>
          {note.isBookmarked && (
            <Ionicons name="bookmark" size={24} color="#ffffff" />
          )}
        </View>
        <Text className="text-white mb-4 leading-6 font-plregular text-sm" numberOfLines={3}>
          {note.content}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <View key={index} className="bg-white/20 px-2.5 py-1 rounded-full">
              <Text className="text-white text-xs">#{tag}</Text>
            </View>
          ))}
        </View>
        <Text className="text-white/80 text-xs mt-3 font-rthin">
          Last edited: {note.lastEdited.toLocaleDateString()}
        </Text>
      </LinearGradient>
    </Animated.View>
  ));

  const CategoryFilter: React.FC = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      <TouchableOpacity
        onPress={() => state.selectedCategory.set('all')}
        className={`px-4 py-2 rounded-full ${state.selectedCategory.get() === 'all' ? theme.accent : theme.cardBg}`}
      >
        <Text className={`${state.selectedCategory.get() === 'all' ? 'text-white' : theme.text}`}>
          All
        </Text>
      </TouchableOpacity>
      {Object.keys(colorSchemes).map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => state.selectedCategory.set(category as NoteCategory)}
          className={`px-4 py-2 rounded-full ${state.selectedCategory.get() === category ? theme.accent : theme.cardBg}`}
        >
          <Text 
            className={`${state.selectedCategory.get() === category ? 'text-white' : theme.text} capitalize`}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const filteredNotes = state.notes.get()
    .filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(state.searchQuery.get().toLowerCase()) ||
        note.content.toLowerCase().includes(state.searchQuery.get().toLowerCase());
      const matchesCategory = state.selectedCategory.get() === 'all' || 
        note.category === state.selectedCategory.get();
      return matchesSearch && matchesCategory;
    });

  return (
    <View className={`flex-1 ${state.theme.get() === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <StatusBar barStyle={state.theme.get() === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={[theme.cardBg, theme.background]}
        className="pt-4"
      >
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => state.isMenuOpen.set(!state.isMenuOpen.get())}>
            <Ionicons name="menu" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text className={`text-2xl font-rbold ${state.theme.get() === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Dealio Notes
          </Text>
          <TouchableOpacity 
            onPress={() => state.theme.set(state.theme.get() === 'light' ? 'dark' : 'light')}
          >
            <Ionicons 
              name={state.theme.get() === 'light' ? 'moon' : 'sunny'} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </View>

        <View className={`flex-row items-center mx-4 my-4 ${state.theme.get() === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-3`}>
          <Feather name="search" size={20} color={theme.text} />
          <TextInput
            className={`flex-1 ml-2 text-base ${state.theme.get() === 'dark' ? 'text-white' : 'text-gray-900'}`}
            placeholder="Search notes..."
            placeholderTextColor={theme.secondary}
            value={state.searchQuery.get()}
            onChangeText={(text) => state.searchQuery.set(text)}
          />
        </View>

        <CategoryFilter />
      </LinearGradient>

      <ScrollView className="flex-1">
        {filteredNotes.length === 0 ? (
          <EmptyState />
        ) : (
          filteredNotes.map((note) => (
            <NoteBlock key={note.id} note={note} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        className={`absolute bottom-12 z-10 shadow-lg mb-3 p-3 right-6 w-15 h-15 rounded-lg flex-row ${state.theme.get() === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} items-center justify-center shadow-lg`}
        onPress={() => router.navigate('create.note')}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text className="text-white">Add new</Text>
      </TouchableOpacity>
    </View>
  );
});

export default CleveryEditor;