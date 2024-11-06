import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  FlatList,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  AntDesign,
  FontAwesome5,
  MaterialIcons,
} from '@expo/vector-icons';

interface Reference {
  type: 'book' | 'website' | 'article' | 'video';
  title: string;
  author?: string;
  url?: string;
  page?: string;
}

interface FormattedText {
  text: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    highlight?: string;
    color?: string;
  };
}

interface Note {
  title: string;
  content: string;
  formattedContent: FormattedText[];
  tags: string[];
  image?: string;
  category?: string;
  references: Reference[];
  lastEdited: Date;
  reminder?: Date;
  isBookmarked: boolean;
}

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

const categories = [
  { id: '1', name: 'Class Notes', icon: 'school' },
  { id: '2', name: 'Meeting Notes', icon: 'business' },
  { id: '3', name: 'Research', icon: 'science' },
  { id: '4', name: 'Journal', icon: 'book' },
  { id: '5', name: 'Project', icon: 'assignment' },
];

const tagOptions = [
  { id: '1', name: 'Important', color: 'bg-red-500' },
  { id: '2', name: 'Review', color: 'bg-yellow-500' },
  { id: '3', name: 'Quiz', color: 'bg-purple-500' },
  { id: '4', name: 'Homework', color: 'bg-blue-500' },
  { id: '5', name: 'Research', color: 'bg-green-500' },
];

const highlightColors = [
  '#fef08a', // yellow
  '#bef264', // green
  '#93c5fd', // blue
  '#fda4af', // red
  '#d8b4fe', // purple
];

const backgroundImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716',
];

const AddNoteModal: React.FC<AddNoteModalProps> = ({ isOpen, onClose, onSave }) => {
  const [note, setNote] = useState<Note>({
    title: '',
    content: '',
    formattedContent: [],
    tags: [],
    image: backgroundImages[0],
    references: [],
    lastEdited: new Date(),
    isBookmarked: false,
  });

  const [showToolbar, setShowToolbar] = useState(true);
  const [selectedText, setSelectedText] = useState({ start: 0, end: 0 });
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [newReference, setNewReference] = useState<Reference>({
    type: 'book',
    title: '',
  });
  const [activeCategory, setActiveCategory] = useState('');
  const [saveAlert, setSaveAlert] = useState(false);

  const toolbarAnimation = useRef(new Animated.Value(1)).current;
  const contentRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Animated.timing(toolbarAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setShowToolbar(false);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(toolbarAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        setShowToolbar(true);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline' | 'highlight', value?: string) => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentText = note.content;
    const { start, end } = selectedText;
    
    const newFormattedContent = [...note.formattedContent];
    newFormattedContent.push({
      text: currentText.slice(start, end),
      style: {
        [format]: format === 'highlight' ? value : true,
      },
    });

    setNote(prev => ({
      ...prev,
      formattedContent: newFormattedContent,
    }));
  };

  const addReference = () => {
    if (!newReference.title) return;
    
    setNote(prev => ({
      ...prev,
      references: [...prev.references, newReference],
    }));
    setNewReference({ type: 'book', title: '' });
    setShowReferenceModal(false);
  };

  const ReferenceModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={showReferenceModal}
      onRequestClose={() => setShowReferenceModal(false)}
    >
      <View className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-xl font-rbold mb-4">Add Reference</Text>
          
          <View className="flex-row mb-4">
            {['book', 'website', 'article', 'video'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setNewReference(prev => ({ ...prev, type: type as Reference['type'] }))}
                className={`mr-4 p-3 rounded-full ${
                  newReference.type === type ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <FontAwesome5
                  name={type === 'book' ? 'book' : type === 'website' ? 'globe' : type === 'article' ? 'file-alt' : 'video'}
                  size={20}
                  color={newReference.type === type ? 'white' : 'black'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="bg-gray-100 p-3 rounded-lg mb-3"
            placeholder="Title"
            value={newReference.title}
            onChangeText={(text) => setNewReference(prev => ({ ...prev, title: text }))}
          />
          
          <TextInput
            className="bg-gray-100 p-3 rounded-lg mb-3"
            placeholder="Author"
            value={newReference.author}
            onChangeText={(text) => setNewReference(prev => ({ ...prev, author: text }))}
          />

          {newReference.type !== 'book' && (
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-3"
              placeholder="URL"
              value={newReference.url}
              onChangeText={(text) => setNewReference(prev => ({ ...prev, url: text }))}
            />
          )}

          {newReference.type === 'book' && (
            <TextInput
              className="bg-gray-100 p-3 rounded-lg mb-3"
              placeholder="Page Number"
              value={newReference.page}
              onChangeText={(text) => setNewReference(prev => ({ ...prev, page: text }))}
              keyboardType="number-pad"
            />
          )}

          <View className="flex-row justify-end mt-4">
            <TouchableOpacity
              onPress={() => setShowReferenceModal(false)}
              className="px-4 py-2 mr-2"
            >
              <Text className="text-gray-500 font-plregular">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addReference}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-plregular">Add Reference</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const Toolbar = () => (
    <Animated.View
      className="border-t border-gray-200 bg-white"
      style={{ opacity: toolbarAnimation }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row items-center p-2">
          <TouchableOpacity
            onPress={() => handleTextFormat('bold')}
            className="p-2 mx-1 rounded-lg bg-gray-100"
          >
            <MaterialIcons name="format-bold" size={24} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTextFormat('italic')}
            className="p-2 mx-1 rounded-lg bg-gray-100"
          >
            <MaterialIcons name="format-italic" size={24} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleTextFormat('underline')}
            className="p-2 mx-1 rounded-lg bg-gray-100"
          >
            <MaterialIcons name="format-underlined" size={24} color="#374151" />
          </TouchableOpacity>

          <View className="h-6 w-px bg-gray-300 mx-2" />
          
          <View className="flex-row">
            {highlightColors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleTextFormat('highlight', color)}
                className="w-6 h-6 rounded-full mx-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </View>

          <View className="h-6 w-px bg-gray-300 mx-2" />

          <TouchableOpacity
            onPress={() => setShowReferenceModal(true)}
            className="flex-row items-center p-2 mx-1 rounded-lg bg-gray-100"
          >
            <MaterialIcons name="bookmark-border" size={24} color="#374151" />
            <Text className="ml-1 text-gray-700">Add Reference</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 bg-gray-100">
          {/* Header with background image */}
          <Image
            source={{ uri: note.image }}
            className="absolute top-0 left-0 right-0 h-60"
          />
          <View className="flex-row justify-between items-center p-4 pt-12 bg-black/30">
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setNote(prev => ({ ...prev, isBookmarked: !prev.isBookmarked }))}
                className="p-2 mr-2"
              >
                <MaterialIcons
                  name={note.isBookmarked ? "bookmark" : "bookmark-border"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => console.log('save')}
                className="bg-white rounded-full px-4 py-2"
              >
                <Text className="font-bold text-blue-500">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main content */}
          <ScrollView className="flex-1 bg-white rounded-t-3xl -mt-6 pt-6 px-4">
            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setActiveCategory(category.id)}
                  className={`mr-3 p-2 px-4 rounded-full flex-row items-center ${
                    activeCategory === category.id ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <MaterialIcons
                    name={category.icon}
                    size={18}
                    color={activeCategory === category.id ? 'white' : '#374151'}
                  />
                  <Text
                    className={`ml-2 font-rmedium text-sm ${
                      activeCategory === category.id ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Title input */}
            <TextInput
              className="text-3xl font-bold mb-4"
              placeholder="Note Title"
              value={note.title}
              onChangeText={(text) => setNote(prev => ({ ...prev, title: text }))}
            />

            {/* Main content input */}
            <TextInput
              ref={contentRef}
              className="text-base mb-4"
              placeholder="Start typing your note..."
              value={note.content}
              onChangeText={(text) => setNote(prev => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
              numberOfLines={10}
              onSelectionChange={(event) => {
                setSelectedText(event.nativeEvent.selection);
              }}
            />

            {/* References section */}
            {note.references.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-bold mb-2">References</Text>
                {note.references.map((ref, index) => (
                  <View key={index} className="bg-gray-100 rounded-lg p-3 mb-2">
                    <View className="flex-row items-center">
                      <FontAwesome5
                        name={
                          ref.type === 'book'
                            ? 'book'
                            : ref.type === 'website'
                            ? 'globe'
                            : ref.type === 'article'
                            ? 'file-alt'
                            : 'video'
                        }
                        size={16}
                        color="#374151"
                        className="mr-2"
                      />
                      <Text className="font-semibold">{ref.title}</Text>
                    </View>
                    {ref.author && (
                      <Text className="text-gray-600 text-sm mt-1">
                        by {ref.author}
                      </Text>
                    )}
                    {ref.url && (
                      <TouchableOpacity 
                        className="mt-1"
                        onPress={() => {/* Handle URL opening */}}
                      >
                        <Text className="text-blue-500 text-sm">{ref.url}</Text>
                      </TouchableOpacity>
                    )}
                    {ref.page && (
                      <Text className="text-gray-600 text-sm mt-1">
                        Page: {ref.page}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Tags section */}
            <View className="mb-4">
              <Text className="text-base font-rbold mb-2">Tags</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tagOptions.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    onPress={() => {
                      setNote(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag.name)
                          ? prev.tags.filter(t => t !== tag.name)
                          : [...prev.tags, tag.name]
                      }));
                      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`mr-2 px-4 py-2 rounded-full flex-row items-center${
                      note.tags.includes(tag.name) ? tag.color : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`${note.tags.includes(tag.name) ? 'text-white' : 'text-gray-700'} font-rmedium text-sm `}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Additional Tools */}
            <View className="mb-4">
              <Text className="text-lg font-bold mb-2">Tools</Text>
              <View className="flex-row flex-wrap">
                <TouchableOpacity
                  onPress={async () => { /* Handle image selection */ }}
                  className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
                >
                  <MaterialIcons name="image" size={24} color="#374151" />
                  <Text className="text-sm mt-1">Change Cover</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);
                    setNote(prev => ({
                      ...prev,
                      reminder: date
                    }));
                    // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
                >
                  <MaterialIcons name="alarm" size={24} color="#374151" />
                  <Text className="text-sm mt-1">Set Reminder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // Implement voice recording
                    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
                >
                  <MaterialIcons name="mic" size={24} color="#374151" />
                  <Text className="text-sm mt-1">Voice Note</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    // Implement drawing
                    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  className="bg-gray-100 p-4 rounded-lg mr-2 mb-2 items-center"
                >
                  <MaterialIcons name="brush" size={24} color="#374151" />
                  <Text className="text-sm mt-1">Drawing</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Templates */}
            <View className="mb-4">
              <Text className="text-lg font-bold mb-2">Quick Templates</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { name: 'Cornell Notes', icon: 'format-list-bulleted' },
                  { name: 'Mind Map', icon: 'bubble-chart' },
                  { name: 'Lecture Notes', icon: 'school' },
                  { name: 'Book Summary', icon: 'book' },
                  { name: 'Research Notes', icon: 'science' },
                ].map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // Apply template
                      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="mr-3 p-3 bg-gray-100 rounded-lg items-center w-24"
                  >
                    <MaterialIcons name={template.icon} size={24} color="#374151" />
                    <Text className="text-sm text-center mt-1">{template.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Formatting toolbar */}
          {showToolbar && <Toolbar />}

          {/* Reference modal */}
          <ReferenceModal />

          {/* Save confirmation alert */}
          <Modal
            transparent
            visible={saveAlert}
            animationType="fade"
            onRequestClose={() => setSaveAlert(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white rounded-2xl p-6 m-4 items-center">
                <View className="bg-green-100 p-4 rounded-full mb-4">
                  <MaterialIcons name="check" size={32} color="#22c55e" />
                </View>
                <Text className="text-xl font-bold mb-2">Note Saved!</Text>
                <Text className="text-gray-600 text-center mb-4">
                  Your note has been saved successfully
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSaveAlert(false);
                    onClose();
                  }}
                  className="bg-blue-500 py-3 px-6 rounded-full"
                >
                  <Text className="text-white font-bold">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddNoteModal;