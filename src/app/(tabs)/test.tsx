import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { observable } from '@legendapp/state';
import { Search, X, Trash2Icon } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import SaveConfirmationModal from 'src/components/notes/SaveConfirmation';
import { CategoryFilter } from 'src/components/nts/filter';
import { EmptyState } from 'src/components/nts/empty';
import { NoteCard } from 'src/components/nts/card';
import { categories } from 'src/store/notes/data';
import { Note } from 'src/store/notes/types';
import { EnhancedNoteCard } from 'src/components/nts/block';


const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Introduction to React Native',
    content: 'React Native is a popular framework for building mobile applications...',
    tags: ['react', 'mobile'],
    categoryId: '1',
    references: [],
    elements: [],
    lastEdited: new Date('2023-05-15'),
    isBookmarked: true,
    comments:[]
  },
  {
    id: '2',
    title: 'Grocery List',
    content: 'Milk, eggs, bread, fruits, vegetables...',
    tags: ['shopping'],
    categoryId: '2',
    references: [],
    elements: [],
    lastEdited: new Date('2023-05-16'),
    isBookmarked: false,
    comments:[]
  },
  {
    id: '3',
    title: 'Project Kickoff Meeting',
    content: 'Discussed project timeline, goals, and team responsibilities...',
    tags: ['work', 'project'],
    categoryId: '3',
    references: [],
    elements: [],
    lastEdited: new Date('2023-05-17'),
    isBookmarked: true,
    comments:[]
  },
];

const notesState = observable(sampleNotes);

const NotesScreen = observer(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const filteredNotes = useMemo(() => {
    return notesState.get().filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? note.categoryId === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, notesState.get()]);

  const handleDeleteAll = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteAll = () => {
    notesState.set([]);
    setIsDeleteModalVisible(false);
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <Animated.View entering={FadeInRight.delay(200).duration(400)}>
      <EnhancedNoteCard note={item} category={categories.find(c => c.id === item.categoryId)!} />
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-4 py-4">
        <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">My Notes</Text>
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
          contentContainerClassName="px-4 pb-4"
        />
      ) : (
        <EmptyState />
      )}
      <TouchableOpacity
        onPress={handleDeleteAll}
        className="absolute bottom-7 right-6 bg-blue-500 p-3 rounded-lg flex-row mt-2"
      >
        <Trash2Icon size={20} color="white" />
        <Text className="text-white font-rmedium ml-1">Delete All</Text>
      </TouchableOpacity>
      {/* <SaveConfirmationModal
        saveAlert={isDeleteModalVisible}
        onConfirm={confirmDeleteAll}
        setSaveAlert={() => setIsDeleteModalVisible(false)}
        title="Delete All Notes"
        message="Are you sure you want to delete all notes? This action cannot be undone."
      /> */}
    </SafeAreaView>
  );
});

export default NotesScreen;

