import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { AntDesign, Feather, MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AddNoteModal from 'src/components/note.add';

// Define color themes
const themes = {
  light: {
    background: '#ffffff',
    text: '#2d3436',
    primary: '#0984e3',
    secondary: '#74b9ff',
    accent: '#6c5ce7',
    border: '#dfe6e9',
  },
  dark: {
    background: '#2d3436',
    text: '#dfe6e9',
    primary: '#74b9ff',
    secondary: '#0984e3',
    accent: '#6c5ce7',
    border: '#636e72',
  },
};

interface Note {
  id: string;
  title: string;
  content: string;
  tags: Array<{ label: string; color: string }>;
  createdAt: number;
}

const NotionEditor: React.FC = () => {
  // State management
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [] });
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Animations
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load notes from AsyncStorage on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      // const savedNotes = await AsyncStorage.getItem('notes');
      // if (savedNotes) {
      //   setNotes(JSON.parse(savedNotes));
      // }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      console.log('Saving notes:', updatedNotes);
      // await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  // Toolbar component for text formatting
  const Toolbar: React.FC = () => (
    <View className="flex-row items-center p-2 border-b border-gray-200 dark:border-gray-700">
      <TouchableOpacity className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <MaterialIcons name="format-bold" size={20} color={themes[theme].text} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <MaterialIcons name="format-italic" size={20} color={themes[theme].text} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <MaterialIcons name="format-underlined" size={20} color={themes[theme].text} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <MaterialIcons name="format-list-bulleted" size={20} color={themes[theme].text} />
      </TouchableOpacity>
      <TouchableOpacity className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <Feather name="image" size={20} color={themes[theme].text} />
      </TouchableOpacity>
    </View>
  );

  // Quick Actions FAB
  const QuickActionsFAB: React.FC = () => (
    <TouchableOpacity
      className="absolute bottom-6 right-6 bg-blue-500 rounded-full w-14 h-14 items-center justify-center shadow-lg"
      onPress={() => setIsAddingNote(true)}
    >
      <AntDesign name="plus" size={24} color="#ffffff" />
    </TouchableOpacity>
  );

  // Search Bar component
  const SearchBar: React.FC = () => (
    <View className="flex-row items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg mx-4 my-2">
      <Feather name="search" size={20} color={themes[theme].text} />
      <TextInput
        className="flex-1 ml-2 text-base"
        placeholder="Search notes..."
        placeholderTextColor={themes[theme].secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  // Tag component
  const Tag: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <View
      className="flex-row items-center px-3 py-1 rounded-full mr-2 mb-2"
      style={{ backgroundColor: color }}
    >
      <Text className="text-white text-sm">{label}</Text>
    </View>
  );

  // Note Block component
  const NoteBlock: React.FC<{ note: Note }> = ({ note }) => (
    <Animated.View
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md m-4 overflow-hidden"
      style={{ opacity: fadeAnim }}
    >
      <View className="p-4">
        <Text className="text-xl font-bold mb-2 dark:text-white">{note.title}</Text>
        <View className="flex-row flex-wrap mb-2">
          {note.tags.map((tag, index) => (
            <Tag key={index} label={tag.label} color={tag.color} />
          ))}
        </View>
        <Text className="text-gray-600 dark:text-gray-300">{note.content}</Text>
      </View>
    </Animated.View>
  );

  // Onboarding Modal
  const OnboardingModal: React.FC = () => (
    <Modal visible={showOnboarding} animationType="slide" transparent={true}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 w-5/6">
          <Text className="text-2xl font-bold mb-4 dark:text-white">Welcome to Notes!</Text>
          <Text className="text-gray-600 dark:text-gray-300 mb-4">
            Let's get you started with the basics:
          </Text>
          <View className="mb-4">
            <Text className="text-gray-600 dark:text-gray-300 mb-2">
              1. Tap the + button to create a new note
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 mb-2">
              2. Use the toolbar to format your text
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 mb-2">
              3. Add tags to organize your notes
            </Text>
            <Text className="text-gray-600 dark:text-gray-300">
              4. Use the search bar to find notes quickly
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg py-3 px-6 items-center"
            onPress={() => setShowOnboarding(false)}
          >
            <Text className="text-white font-bold">Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Add Note Modal
  // const AddNoteModal: React.FC = () => (
  //   <Modal
  //     visible={isAddingNote}
  //     animationType="slide"
  //     transparent={true}
  //   >
  //     <KeyboardAvoidingView
  //       behavior={Platform.OS === "ios" ? "padding" : "height"}
  //       className="flex-1 justify-end"
  //     >
  //       <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 h-3/4">
  //         <View className="flex-row justify-between items-center mb-4">
  //           <Text className="text-2xl font-bold dark:text-white">New Note</Text>
  //           <TouchableOpacity onPress={() => setIsAddingNote(false)}>
  //             <AntDesign name="close" size={24} color={themes[theme].text} />
  //           </TouchableOpacity>
  //         </View>
  //         <TextInput
  //           className="text-xl font-semibold mb-2 dark:text-white"
  //           placeholder="Title"
  //           placeholderTextColor={themes[theme].secondary}
  //           value={newNote.title}
  //           onChangeText={(text) => setNewNote({ ...newNote, title: text })}
  //         />
  //         <TextInput
  //           className="text-base mb-4 dark:text-white"
  //           placeholder="Start typing your note..."
  //           placeholderTextColor={themes[theme].secondary}
  //           multiline
  //           textAlignVertical="top"
  //           numberOfLines={10}
  //           value={newNote.content}
  //           onChangeText={(text) => setNewNote({ ...newNote, content: text })}
  //         />
  //         <TouchableOpacity
  //           className="bg-blue-500 rounded-lg py-3 px-6 items-center"
  //           onPress={handleAddNote}
  //         >
  //           <Text className="text-white font-bold">Save Note</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </KeyboardAvoidingView>
  //   </Modal>
  // );

  const handleAddNote = () => {
    if (newNote.title && newNote.content) {
      const newNoteWithId: Note = {
        ...newNote,
        id: Date.now().toString(),
        createdAt: Date.now(),
        tags: [{ label: 'New', color: '#3498db' }], // Default tag
      };
      const updatedNotes = [...notes, newNoteWithId];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setNewNote({ title: '', content: '', tags: [] });
      setIsAddingNote(false);
    }
  };

  // Main render
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <OnboardingModal />
      <AddNoteModal
        isOpen={isAddingNote}
        newNote={newNote}
        setNewNote={setNewNote}
        onSave={handleAddNote}
        onClose={() => setIsAddingNote(false)}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800">
        <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)}>
          <Ionicons name="menu" size={24} color={themes[theme].text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? (
            <Ionicons name="moon" size={24} color={themes[theme].text} />
          ) : (
            <Ionicons name="sunny" size={24} color={themes[theme].text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar />

      {/* Main Content */}
      <ScrollView className="flex-1">
        {notes
          .filter(
            (note) =>
              note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              note.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((note, index) => (
            <NoteBlock key={index} note={note} />
          ))}
      </ScrollView>

      {/* Toolbar */}
      <Toolbar />

      {/* Quick Actions */}
      <QuickActionsFAB />
    </View>
  );
};

export default NotionEditor;
