import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { X, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { batch, observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import { router } from 'expo-router';

import SaveConfirmationModal from 'src/components/notes/SaveConfirmation';
import CategorySelector from 'src/components/notes/Category';
import { BaseReference, useNotes } from 'src/store/notes/store';
import { ReferenceModal } from 'src/components/notes/Refrence';
import ReferenceItem from 'src/components/notes/RefrenceItem';
import { tagOptions } from 'src/components/notes/constants';
import TagSelector from 'src/components/notes/TagSelector';
import { Note, Reference } from 'src/store/notes/types';
import Toolbar from 'src/components/notes/Toolbar';
import Editor from 'src/components/notes/editor';

const initialNote: Note = {
  id: '',
  title: '',
  content: '',
  tags: [],
  references: [],
  lastEdited: new Date(),
  isBookmarked: false,
  category: 'personal',
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


const Header = ({ onSave, isBookmarked, onBookmarkToggle }: {
  onSave: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}) => (
  <View className="flex-row justify-between items-center p-4 pt-12 bg-black/30">
    <TouchableOpacity onPress={() => router.back()} className="p-2">
      <X size={24} color="white" />
    </TouchableOpacity>
    <View className="flex-row">
      <TouchableOpacity
        onPress={onBookmarkToggle}
        className="p-2 mr-2"
      >
        {isBookmarked ? (
          <BookmarkCheck size={24} color="white" />
        ) : (
          <Bookmark size={24} color="white" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        className="bg-white rounded-full px-4 py-2"
      >
        <Text className="font-bold text-blue-500">Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const References = ({ references }: { references: BaseReference[] }) => (
  <View className="mb-4">
    <Text className="text-lg font-bold mb-2">References</Text>
    {references.map((ref, index) => (
      <ReferenceItem key={index} reference={ref} />
    ))}
  </View>
);

export const AddNote = observer(() => {
  const [, actions] = useNotes();

  const handleTextFormat = (
    format: 'bold' | 'italic' | 'underline' | 'highlight',
    value?: string
  ) => {
    // const currentText = state.note.content.get();
    // const { start, end } = state.selectedText.get();
    // Add your text formatting logic here
  };

  const addReference = () => {
    if (!state.newReference.title.get()) return;

    batch(() => {
      state.note.references.push(state.newReference.get());
      state.newReference.set({ type: 'book', title: '' });
      state.showReferenceModal.set(false);
    });
  };

  const handleSave = () => {
    const { category, content, tags, title, references, isBookmarked } = state.note.get();
    if(!title || !content) return
    state.saveAlert.set(true);
    actions.addNote({ category, content, tags, title, references, isBookmarked });
    state.saveAlert.set(false);
    router.back();
  };

  const handleTagPress = (tagName: string) => {
    state.note.tags.set((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleBookmarkToggle = () => {
    state.note.isBookmarked.set(!state.note.isBookmarked.get());
  };

  const handleCategoryChange = (category: string) => {
    state.activeCategory.set(category);
  };

  const handleReferenceModalToggle = (show: boolean) => {
    state.showReferenceModal.set(show);
  };

  const references = state.note.references.get();
  const showToolbar = state.showToolbar.get();
  const isBookmarked = state.note.isBookmarked.get();
  const selectedTags = state.note.tags.get();
  const activeCategory = state.activeCategory.get();
  const showReferenceModal = state.showReferenceModal.get();
  const newReference = state.newReference.get();
  const saveAlert = state.saveAlert.get();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-100">
        <Header
          onSave={handleSave}
          isBookmarked={isBookmarked}
          onBookmarkToggle={handleBookmarkToggle}
        />

        <ScrollView className="flex-1 bg-white rounded-t-3xl -mt-6 pt-6 px-4">
          <CategorySelector
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
          />

          <Editor state={state.note} noteType="note" />

          {references.length > 0 && (
            <References references={references} />
          )}

          <TagSelector
            tagOptions={tagOptions}
            selectedTags={selectedTags}
            onTagPress={handleTagPress}
          />
        </ScrollView>

        {showToolbar && (
          <Toolbar
            handleTextFormat={handleTextFormat}
            setShowReferenceModal={handleReferenceModalToggle}
          />
        )}

        <ReferenceModal
          showReferenceModal={showReferenceModal}
          setShowReferenceModal={handleReferenceModalToggle}
          newReference={newReference}
          setNewReference={(ref) => state.newReference.set(ref)}
          addReference={addReference}
        />

        <SaveConfirmationModal
          saveAlert={saveAlert}
          setSaveAlert={(alert) => state.saveAlert.set(alert)}
          onClose={() => router.back()}
        />
      </View>
    </KeyboardAvoidingView>
  );
});

export default AddNote;