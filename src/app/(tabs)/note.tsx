import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Bookmark, Trash2Icon, Search, Menu, Plus, NotebookPen, Trash2 } from 'lucide-react-native';
import { useObservable, observer, useComputed } from '@legendapp/state/react';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { colorScheme } from 'nativewind';
import { router } from 'expo-router';
import Animated, { 
  FadeInDown,
  SlideInRight
} from 'react-native-reanimated';
import { Note, NoteCategory, colorSchemes, themes } from 'src/store/notes/types';
import { useNotes } from 'src/store/notes/store';


const globalState = observable({
  searchQuery: '',
  showOnboarding: true,
  isMenuOpen: false,
  selectedCategory: 'all' as 'all' | NoteCategory,
});

const Chip: React.FC<{ label: NoteCategory | 'all' }> = ({ label }) => (
  <LinearGradient
    colors={label === 'all' ? ['#CBD5E1', '#94A3B8'] : colorSchemes[label].gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}
  >
    <Text className='capitalize font-amedium text-sm text-gray-200'>
      {label}
    </Text>
  </LinearGradient>
);


const NoteBlock: React.FC<{ note: Note }> = observer(({ note }) => {
  const [store, actions] = useNotes();
  //@ts-ignore
  const scheme = colorSchemes[note.category];
  return (
    <Animated.View
      entering={SlideInRight}
      className="m-4 rounded-2xl bg-c overflow-hidden shadow-md"
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
            <Bookmark size={24} color="#ffffff" />
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
       <View className='flex-row justify-between'>
          <Text className="text-white/80 text-xs mt-3 font-aregular">
            Last edited: {note.lastEdited?.toLocaleDateString()}
          </Text>
          
          <TouchableOpacity className='mt-1' onPress={async () => await actions.deleteNote(note.id)}>
            <Trash2 size={20} color="#6B7280" />
          </TouchableOpacity>
       </View>
       
      </LinearGradient>
    </Animated.View>
  );
});

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
      {['all', ...Object.keys(colorSchemes)].map((category) => {
        return (
          <TouchableOpacity
            key={category}
            onPress={() => selectedCategory.set(category as 'all' | NoteCategory)}
            className={`px-4 py-2 bg-[${selectedCategory.get() === category ? theme.accent.get() : theme.cardBg.get()}]`}
          >
            <Text 
              className={`text-[${selectedCategory.get() === category ? theme.accent.get() : theme.text.get()}] font-amedium`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        )}
      )}
    </ScrollView>
  );
});

const EmptyState: React.FC = () => {
  const theme = useComputed(() => themes[colorScheme.get()!]);
  return (
    <Animated.View 
      entering={FadeInDown}
      className="items-center px-6 pt-10"
    >
      <NotebookPen size={80} color={theme.get().secondary} />
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
};



const Notes: React.FC = observer(() => {
  const [store, actions] = useNotes();
  const theme = useComputed(() => themes[colorScheme.get()!]);
  const notes =store.notes;
  const searchQuery = useObservable(globalState.searchQuery);
  const selectedCategory = useObservable(globalState.selectedCategory);

  const filteredNotes = useComputed(() => 
    notes.get().filter((note) => {
      const matchesSearch = note.title?.toLowerCase().includes(searchQuery.get()?.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.get()?.toLowerCase());
      const matchesCategory = selectedCategory.get() === 'all' || 
        note.category === selectedCategory.get();
      return matchesSearch && matchesCategory;
    })
  );

  const handleDeleteAll =async()=>{
    await actions.deleteAllNotes()
    console.log(notes.get())
  } 

  return (
    <View className={`flex-1 dark:bg-gray-900 bg-white`}>
      <LinearGradient
        colors={[theme.cardBg.get(), theme.background.get()]}
        className="pt-4"
      >
        <View className="flex-row justify-between items-center p-4">
          <TouchableOpacity onPress={() => globalState.isMenuOpen.set(!globalState.isMenuOpen.get())}>
            <Menu size={24} color={theme.text.get()} />
          </TouchableOpacity>
          <Text className={`text-2xl font-amedium dark:text-white text-gray-900`}>
            Dealio Notes
          </Text>
          <TouchableOpacity
            onPress={() => {}}
            className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
          >
            <Trash2Icon size={20} color="white" onPress={handleDeleteAll} />
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

      <ScrollView className="flex-1">
        {!filteredNotes.get().length? (
          <EmptyState />
        ) : (
          filteredNotes.get().map((note) => (
            <View key={note.id} >
              <NoteBlock note={note} />
            </View>
          ))
        )}
      </ScrollView>

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