import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { observer } from '@legendapp/state/react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { batch, observable } from '@legendapp/state';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef } from 'react';
import { router } from 'expo-router';

import { SaveConfirmationModal } from 'src/components/notes/SaveConfirmation';
import { QuickTemplates } from 'src/components/notes/QuickTemplate';
import { ToolsSection } from 'src/components/notes/ToolsSelection';
import { CategorySelector } from 'src/components/notes/Category';
import { TagSelector } from 'src/components/notes/TagSelector';
import { ReferenceModal } from 'src/components/notes/Refrence';
import ReferenceItem from 'src/components/notes/RefrenceItem';
import { tagOptions } from 'src/components/notes/constants';
import { Note, Reference } from 'src/components/notes/ts';
import { Toolbar } from 'src/components/notes/Toolbar';
import Editor from 'src/components/notes/editor';

const initialNote: Note = {
  title: '',
  content: '',
  formattedContent: [],
  tags: [],
  references: [],
  lastEdited: new Date(),
  isBookmarked: false,
};

const state = observable({
  note: initialNote,
  showToolbar: true,
  selectedText: { start: 0, end: 0 },
  showReferenceModal: false,
  newReference: { type: 'book', title: '' } as Reference,
  activeCategory: '',
  saveAlert: false,
});

export const AddNoteModal = () => {
  const handleTextFormat = (
    format: 'bold' | 'italic' | 'underline' | 'highlight',
    value?: string
  ) => {
    const currentText = state.note.content.get();
    const { start, end } = state.selectedText.get();

    batch(() => {
      state.note.formattedContent.push({
        text: currentText.slice(start, end),
        style: {
          [format]: format === 'highlight' ? value : true,
        },
      });
    });
  };

  const addReference = () => {
    if (!state.newReference.title.get()) return;

    batch(() => {
      state.note.references.push(state.newReference.get());
      state.newReference.set({ type: 'book', title: '' });
      state.showReferenceModal.set(false);
    });
  };

  const renders = ++ useRef(0).current
  console.log(renders)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-100">
        <View className="flex-row justify-between items-center p-4 pt-12 bg-black/30">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => state.note.isBookmarked.set(!state.note.isBookmarked.get())}
              className="p-2 mr-2"
            >
              <MaterialIcons
                name={state.note.isBookmarked.get() ? 'bookmark' : 'bookmark-border'}
                size={24}
                color="white"
              />
            </TouchableOpacity> 
            <TouchableOpacity
              onPress={() => state.saveAlert.set(true)}
              className="bg-white rounded-full px-4 py-2"
            >
              <Text className="font-bold text-blue-500">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 bg-white rounded-t-3xl -mt-6 pt-6 px-4">
          <CategorySelector
            activeCategory={state.activeCategory.get()}
            setActiveCategory={(category) => state.activeCategory.set(category)}
          />

          <Editor initialState={state.note.get()}noteType='list' />

          {state.note.references.get().length > 0 && (
            <View className="mb-4">
              <Text className="text-lg font-bold mb-2">References</Text>
              {state.note.references.get().map((ref, index) => (
                <ReferenceItem key={index} reference={ref} />
              ))}
            </View>
          )}

          <TagSelector
            tagOptions={tagOptions}
            selectedTags={state.note.tags.get()}
            onTagPress={(tagName) => {
              state.note.tags.set((prev) =>
                prev.includes(tagName)
                  ? prev.filter((t) => t !== tagName)
                  : [...prev, tagName]
              );
            }}
          />

          <ToolsSection />

          <QuickTemplates />
        </ScrollView>

        {state.showToolbar.get() && (
          <Toolbar
            handleTextFormat={handleTextFormat}
            setShowReferenceModal={(show) => state.showReferenceModal.set(show)}
          />
        )}

        <ReferenceModal
          showReferenceModal={state.showReferenceModal.get()}
          setShowReferenceModal={(show) => state.showReferenceModal.set(show)}
          newReference={state.newReference.get()}
          setNewReference={(ref) => state.newReference.set(ref)}
          addReference={addReference}
        />

        <SaveConfirmationModal
          saveAlert={state.saveAlert.get()}
          setSaveAlert={(alert) => state.saveAlert.set(alert)}
          onClose={() => router.back()}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default observer(AddNoteModal);