import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Note, Reference } from 'src/components/notes/ts';
import { CategorySelector } from 'src/components/notes/Category';
import { categories, highlightColors, tagOptions } from 'src/components/notes/constants';
import { TagSelector } from 'src/components/notes/TagSelector';
import { ToolsSection } from 'src/components/notes/ToolsSelection';
import { QuickTemplates } from 'src/components/notes/QuickTemplate';
import { Toolbar } from 'src/components/notes/Toolbar';
import { ReferenceModal } from 'src/components/notes/Refrence';
import { SaveConfirmationModal } from 'src/components/notes/SaveConfirmation';
import ReferenceItem from 'src/components/notes/RefrenceItem';
import { router } from 'expo-router';


export const AddNoteModal = () => {
  const [note, setNote] = useState<Note>({
    title: '',
    content: '',
    formattedContent: [],
    tags: [],
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
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      Animated.timing(toolbarAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setShowToolbar(false);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(toolbarAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setShowToolbar(true);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleTextFormat = (
    format: 'bold' | 'italic' | 'underline' | 'highlight',
    value?: string
  ) => {
    const currentText = note.content;
    const { start, end } = selectedText;

    const newFormattedContent = [...note.formattedContent];
    newFormattedContent.push({
      text: currentText.slice(start, end),
      style: {
        [format]: format === 'highlight' ? value : true,
      },
    });

    setNote((prev) => ({
      ...prev,
      formattedContent: newFormattedContent,
    }));
  };

  const addReference = () => {
    if (!newReference.title) return;

    setNote((prev) => ({
      ...prev,
      references: [...prev.references, newReference],
    }));
    setNewReference({ type: 'book', title: '' });
    setShowReferenceModal(false);
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-gray-100">
          <View className="flex-row justify-between items-center p-4 pt-12 bg-black/30">
            <TouchableOpacity onPress={()=>router.back()} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setNote((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }))}
                className="p-2 mr-2"
              >
                <MaterialIcons
                  name={note.isBookmarked ? 'bookmark' : 'bookmark-border'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity> 
              <TouchableOpacity
                onPress={() => setSaveAlert(true)}
                className="bg-white rounded-full px-4 py-2"
              >
                <Text className="font-bold text-blue-500">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 bg-white rounded-t-3xl -mt-6 pt-6 px-4">
            <CategorySelector
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <TextInput
              className="text-3xl font-bold mb-4"
              placeholder="Note Title"
              value={note.title}
              onChangeText={(text) => setNote((prev) => ({ ...prev, title: text }))}
            />

            <TextInput
              ref={contentRef}
              className="text-base mb-4"
              placeholder="Start typing your note..."
              value={note.content}
              onChangeText={(text) => setNote((prev) => ({ ...prev, content: text }))}
              multiline
              textAlignVertical="top"
              numberOfLines={10}
              onSelectionChange={(event) => {
                setSelectedText(event.nativeEvent.selection);
              }}
            />

            {note.references.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-bold mb-2">References</Text>
                {note.references.map((ref, index) => (
                  <ReferenceItem key={index} reference={ref} />
                ))}
              </View>
            )}

            <TagSelector
              tagOptions={tagOptions}
              selectedTags={note.tags}
              onTagPress={(tagName) => {
                setNote((prev) => ({
                  ...prev,
                  tags: prev.tags.includes(tagName)
                    ? prev.tags.filter((t) => t !== tagName)
                    : [...prev.tags, tagName],
                }));
              }}
            />

            <ToolsSection />

            <QuickTemplates />
          </ScrollView>

          {showToolbar && (
            <Toolbar
              handleTextFormat={handleTextFormat}
              highlightColors={highlightColors}
              setShowReferenceModal={setShowReferenceModal}
            />
          )}

          <ReferenceModal
            showReferenceModal={showReferenceModal}
            setShowReferenceModal={setShowReferenceModal}
            newReference={newReference}
            setNewReference={setNewReference}
            addReference={addReference}
          />

          <SaveConfirmationModal
            saveAlert={saveAlert}
            setSaveAlert={setSaveAlert}
            onClose={()=>router.back()}
          />
        </View>
      </KeyboardAvoidingView>
  );
};

export default AddNoteModal;