import { View, Text, TouchableOpacity, TextInput, FlatList, ListRenderItem } from 'react-native';
import { Trash2Icon, Search, Menu, Plus } from 'lucide-react-native';
import { useObservable, observer, useComputed } from '@legendapp/state/react';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { colorScheme } from 'nativewind';
import { router } from 'expo-router';
import { Category, Note } from 'src/store/notes/types';
import { categories, themes } from 'src/store/notes/data';
import { useNotes } from 'src/store/notes/actions';
import { EmptyState } from 'src/components/nts/empty';
import NoteBlock from 'src/components/nts/block.initial';

interface GlobalState {
  searchQuery: string;
  showOnboarding: boolean;
  isMenuOpen: boolean;
  selectedCategory: 'all' | string;
}

const notesState = observable<GlobalState>({
  searchQuery: '',
  showOnboarding: true,
  isMenuOpen: false,
  selectedCategory: 'all',
});

interface ChipProps {
  label: 'all' | string;
  colorScheme: {
    gradient: [string, string];
  };
}

const Chip: React.FC<ChipProps> = ({ label, colorScheme }) => (
  <LinearGradient
    colors={label === 'all' ? ['#CBD5E1', '#94A3B8'] : colorScheme.gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
  >
    <Text className='capitalize font-amedium text-sm text-gray-200'>
      {label}
    </Text>
  </LinearGradient>
);


const CategoryFilter = () => {
  const selectedCategory = useObservable(notesState.selectedCategory);
  const theme = useComputed(() => themes[colorScheme.get()!]);

  const renderItem: ListRenderItem<'all' | Category> = ({ item }) => (
    <TouchableOpacity
      onPress={() => selectedCategory.set(typeof item === 'string' ? item : item.id)}
      className={`px-4 py-2 rounded-lg mr-2`}
      style={{
        backgroundColor: selectedCategory.get() === (typeof item === 'string' ? item : item.id) ? theme.secondary.get() : theme.cardBg.get()
      }}
    >
      <Text 
        className={`font-amedium`}
        style={{color: selectedCategory.get() === (typeof item === 'string' ? item : item.id) ? theme.background.get() : theme.text.get()}}
      >
        {typeof item === 'string' ? item : item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ paddingHorizontal: 16 }}
      data={['all', ...categories]}
      renderItem={renderItem}
      keyExtractor={(item) => typeof item === 'string' ? item : item.id}
    />
  );
};

const Notes: React.FC = observer(() => {
  const { getNotes, deleteAllNotes } = useNotes();
  const theme = useComputed(() => themes[colorScheme.get()!]);
  const notes = getNotes();
  const searchQuery = useObservable(notesState.searchQuery);
  const selectedCategory = useObservable(notesState.selectedCategory);

  const filteredNotes = () => 
    notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.get().toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.get().toLowerCase());
      const matchesCategory = selectedCategory.get() === 'all' || 
        note.categoryId === selectedCategory.get();
      return matchesSearch && matchesCategory;
  })
  
  const handleDeleteAll = async () => {
    await deleteAllNotes();
  };

  
  const renderItem: ListRenderItem<Note> = ({ item }) => (
    <NoteBlock note={item} />
  );

  return (
    <View className={`flex-1 dark:bg-gray-900 bg-white`}>
      <LinearGradient
        colors={[theme.cardBg.get(), theme.background.get()]}
        className="pt-4 dark:bg-gray-900"
      >
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => notesState.isMenuOpen.set(!notesState.isMenuOpen.get())}>
            <Menu size={24} color={theme.text.get()} />
          </TouchableOpacity>
          <Text className={`text-2xl font-amedium dark:text-white text-gray-900`}>
            Dealio Notes
          </Text>
          <TouchableOpacity
            onPress={handleDeleteAll}
            className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
          >
            <Trash2Icon size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Delete All</Text>
          </TouchableOpacity>
        </View>

        <View className={`flex-row items-center mx-4 my-4 dark:bg-gray-800 bg-gray-100 rounded-xl p-3`}>
          <Search size={20} color={theme.text.get()} />
          <TextInput
            className={`flex-1 ml-2 text-base dark:text-white text-gray-900`}
            placeholder="Search notes..."
            placeholderTextColor={theme.secondary.get()}
            value={searchQuery.get()}
            onChangeText={(text) => searchQuery.set(text)}
          />
        </View>

        <CategoryFilter />
      </LinearGradient>

      {filteredNotes().length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredNotes()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <TouchableOpacity
        className={`absolute bottom-12 z-10 mb-3 p-3 right-6 w-15 h-15 rounded-xl flex-row dark:bg-blue-400 bg-blue-500 items-center justify-center shadow-lg`}
        onPress={() => router.navigate('create.note')}
      >
        <Plus size={20} color="white" />
        <Text className="text-white font-rmedium ml-1">Create Note</Text>
      </TouchableOpacity>
    </View>
  );
});

Chip.displayName = 'Note-Chip';
EmptyState.displayName = 'Note-EmptyState';
export default Notes;
