import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StatusBar } from 'react-native';
import { observer } from '@legendapp/state/react';
import { Search, X, Trash2Icon, Plus } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import SaveConfirmationModal from 'src/components/notes/SaveConfirmation';
import { CategoryFilter } from 'src/components/nts/filter';
import { EmptyState } from 'src/components/nts/empty';
import { categories } from 'src/store/notes/data';
import { Note } from 'src/store/notes/types';
import { EnhancedNoteCard } from 'src/components/nts/block';
import { useNotes } from 'src/store/notes/actions';
import { SafeAreaView } from 'react-native';
import { router } from 'expo-router';


const NotesScreen = observer(() => {
  const { getNotes } = useNotes();
  const notes = getNotes()
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? note.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, notes]);

  const handleDeleteAll = () => {
    
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <Animated.View entering={FadeInRight.delay(200).duration(400)}>
      <EnhancedNoteCard note={item} category={categories.find(c => c.id === item.categoryId)!} />
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 mb-8">
      <StatusBar hidden={false}/>
      <View className="px-4 py-4">

        <View className='flex-row mt-3'>
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">My Notes</Text>
          <TouchableOpacity
            onPress={handleDeleteAll}
            className="absolute bottom-5 right-6 bg-blue-500 p-3 rounded-lg flex-row mt-1"
          >
            <Trash2Icon size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Delete All</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2 mb-4">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900 dark:text-white"
            placeholder="Search notes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>
      {filteredNotes.length > 0 ? (
        <FlatList
          data={filteredNotes}
          renderItem={renderNoteItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 pb-4 mb-4"
        />
      ) : (
        <EmptyState />
      )}
      <TouchableOpacity
        onPress={()=>router.push('note.view')}
        className="absolute bottom-7 right-6 bg-blue-500 p-3 rounded-lg flex-row mt-2"
      >
        <Plus size={20} color="white" />
        <Text className="text-white font-rmedium ml-1">Add Note</Text>
      </TouchableOpacity>
      <SaveConfirmationModal
        saveAlert={false}
        onConfirm={()=>{}}
        setSaveAlert={() => {}}
        title="Delete All Notes"
        message="Are you sure you want to delete all notes? This action cannot be undone."
      />
    </SafeAreaView>
  );
});

export default NotesScreen;

