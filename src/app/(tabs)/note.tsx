import { memo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { useObservable, observer, useComputed } from '@legendapp/state/react';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import Animated, { 
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';
import { colorScheme } from 'nativewind';

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
} as const;

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
} as const;

type NoteCategory = keyof typeof colorSchemes;

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: NoteCategory;
  lastEdited: Date;
  isBookmarked: boolean;
}

const globalState = observable({
  theme: 'light' as 'light' | 'dark',
  notes: [] as Note[],
  searchQuery: '',
  showOnboarding: true,
  isMenuOpen: false,
  selectedCategory: 'all' as 'all' | NoteCategory,
});

const Chip: React.FC<{ label: NoteCategory | 'all' }> = memo(({ label }) => (
  <LinearGradient
    colors={label === 'all' ? ['#CBD5E1', '#94A3B8'] : colorSchemes[label].gradient}
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
));


const NoteBlock: React.FC<{ note: Note }> = memo(observer(({ note }) => {
  const scheme = colorSchemes[note.category];
  return (
    <Animated.View
      entering={SlideInRight}
      className="m-4 rounded-2xl overflow-hidden shadow-md"
    >
      <LinearGradient
        colors={scheme.gradient}
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
        <Text className="text-white mb-4 leading-6 font-aregular text-sm" numberOfLines={3}>
          {note.content}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <View key={index} className="bg-white/20 px-2.5 py-1 rounded-full">
              <Text className="text-white text-xs">#{tag}</Text>
            </View>
          ))}
        </View>
        <Text className="text-white/80 text-xs mt-3 font-aregular">
          Last edited: {note.lastEdited.toLocaleDateString()}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}));

const CategoryFilter: React.FC = observer(() => {
  const selectedCategory = useObservable(globalState.selectedCategory);
  const theme = useComputed(() => themes[colorScheme.get()!]);

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {['all', ...Object.keys(colorSchemes)].map((category) => (
        <TouchableOpacity
          key={category}
          onPress={() => globalState.selectedCategory.set(category as 'all' | NoteCategory)}
          className={`px-4 py-2 rounded-full bg-${selectedCategory.get() === category ? theme.accent.get() : theme.cardBg.get()}`}
        >
          <Text 
            className={`${selectedCategory.get() === category ? theme.accent.get() : theme.text.get()} font-amedium`}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const EmptyState: React.FC = memo(() => {
  const theme = useComputed(() => themes[colorScheme.get()!]);
  return (
    <Animated.View 
      entering={FadeInDown}
      className="items-center px-6 pt-10"
    >
      <MaterialIcons name="note-add" size={80} color={theme.get().secondary} />
      <Text className={`text-2xl font-amedium mt-6 mb-3 dark:text-white text-gray-800`}>
        Start Your Journey
      </Text>
      <Text className={`text-center font-aregular text-base mb-6 leading-6 dark:text-white text-gray-600`}>
        Create your first note by tapping the + button below.
        Organize your thoughts across different categories:
      </Text>
      <View className="flex-row flex-wrap justify-center gap-2">
        {Object.keys(colorSchemes).map((category) => (
          <Chip key={category} label={category as NoteCategory} />
        ))}
      </View>
    </Animated.View>
  );
});



const CleveryEditor: React.FC = observer(() => {
  const theme = useComputed(() => themes[colorScheme.get()!]);
  const notes = useObservable(globalState.notes);
  const searchQuery = useObservable(globalState.searchQuery);
  const selectedCategory = useObservable(globalState.selectedCategory);

  // useEffect(() => {
  //   if (notes.get().length === 0) {
  //     const mockNotes: Note[] = [
  //       {
  //         id: '1',
  //         title: 'Research: AI in Healthcare',
  //         content: 'Recent developments in AI are revolutionizing healthcare diagnostics...',
  //         tags: ['AI', 'healthcare', 'research'],
  //         category: 'research',
  //         lastEdited: new Date(),
  //         isBookmarked: true,
  //       },
  //       {
  //         id: '2',
  //         title: 'Project: Mobile App Architecture',
  //         content: 'Key considerations for scalable mobile architecture...',
  //         tags: ['mobile', 'architecture', 'development'],
  //         category: 'project',
  //         lastEdited: new Date(),
  //         isBookmarked: false,
  //       },
  //       {
  //         id: '3',
  //         title: 'Advanced Data Structures',
  //         content: 'Notes from today\'s lecture on balanced trees and heap implementations...',
  //         tags: ['CS', 'algorithms', 'study'],
  //         category: 'class',
  //         lastEdited: new Date(),
  //         isBookmarked: true,
  //       },
  //     ];
  //     notes.set(mockNotes);
  //   }
  // }, []);

  const filteredNotes = useComputed(() => 
    notes.get().filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.get().toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.get().toLowerCase());
      const matchesCategory = selectedCategory.get() === 'all' || 
        note.category === selectedCategory.get();
      return matchesSearch && matchesCategory;
    })
  );

  return (
    <View className={`flex-1 dark:bg-gray-900 bg-white`}>
      <LinearGradient
        colors={[theme.get().cardBg, theme.get().background]}
        className="pt-4"
      >
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => globalState.isMenuOpen.set(!globalState.isMenuOpen.get())}>
            <Ionicons name="menu" size={24} color={theme.get().text} />
          </TouchableOpacity>
          <Text className={`text-2xl font-amedium dark:text-white text-gray-900`}>
            Dealio Notes
          </Text>
          <TouchableOpacity />
        </View>

        <View className={`flex-row items-center mx-4 my-4 dark:bg-gray-800 bg-gray-100 rounded-xl p-3`}>
          <Feather name="search" size={20} color={theme.get().text} />
          <TextInput
            className={`flex-1 ml-2 text-base dark:text-white text-gray-900`}
            placeholder="Search notes..."
            placeholderTextColor={theme.get().secondary}
            value={searchQuery.get()}
            onChangeText={(text) => searchQuery.set(text)}
          />
        </View>

        <CategoryFilter />
      </LinearGradient>

      <ScrollView className="flex-1">
        {filteredNotes.get().length === 0 ? (
          <EmptyState />
        ) : (
          filteredNotes.get().map((note) => (
            <NoteBlock key={note.id} note={note} />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        className={`absolute bottom-12 z-10 mb-3 p-3 right-6 w-15 h-15 rounded-xl flex-row dark:bg-blue-400 bg-blue-500 items-center justify-center shadow-lg`}
        onPress={() => router.navigate('create.note')}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text className="text-white font-rmedium ml-1">Create Note</Text>
      </TouchableOpacity>
    </View>
  );
});

Chip.displayName = 'Note-Chip';
EmptyState.displayName = 'Note-EmptyState';
export default CleveryEditor;