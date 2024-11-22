import { View } from 'react-native';
import { batch, observable } from '@legendapp/state';
import { observer } from '@legendapp/state/react';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller'
import { router } from 'expo-router';

import SaveConfirmationModal from 'src/components/notes/SaveConfirmation';
import { categories, tagOptions } from 'src/components/notes/constants';
import { Note, Reference, Category } from 'src/store/notes/types';
import { ReferenceModal } from 'src/components/notes/Refrence';
import CategorySelector from 'src/components/notes/Category';
import TagSelector from 'src/components/notes/TagSelector';
import { useNotes } from 'src/store/notes/actions';
import Toolbar from 'src/components/notes/Toolbar';
import Editor from 'src/components/notes/editor';
import Header from 'src/components/notes/header';
import { useRef } from 'react';
import References from 'src/components/notes/RefrenceItem';

const initialNote: Note = {
  id: '',
  title: '',
  content: '',
  tags: [],
  references: [],
  elements: [],
  lastEdited: new Date(),
  isBookmarked: false,
  category: categories[1],
};

interface EditorState {
  note: Note;
  showToolbar: boolean;
  selectedText: { start: number; end: number };
  showReferenceModal: boolean;
  newReference: Reference;
  activeCategory: Category | null;
  saveAlert: boolean;
}

const state = observable<EditorState>({
  note: initialNote,
  showToolbar: true,
  selectedText: { start: 0, end: 0 },
  showReferenceModal: false,
  newReference: { type: 'book', title: '' } as Reference,
  activeCategory: categories[1],
  saveAlert: false,
});


export const AddNote = observer(() => {
  const {addNote} = useNotes();

  const renders = useRef(0);
  console.log(`Create Note: ${++renders.current}`);
  const {
    showToolbar,activeCategory, newReference,
    note:{ 
      tags: selectedTags, isBookmarked: isBookmarked, references:references,
      title, content, category
    }, 
     saveAlert, selectedText, showReferenceModal,
  } = state.get()

  const addReference = () => {
    if (!newReference.title) return;

    batch(() => {
      state.note.references.push(state.newReference.get());
      state.newReference.set({ type: 'book', title: '' });
      state.showReferenceModal.set(false);
    });
  };

  const handleSave = async () => {
    const note = state.note.get();
    console.log(note)
    if (title || content) return;
    
    state.saveAlert.set(true);
    await addNote(note);
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
    state.note.isBookmarked.set(!isBookmarked);
  };

  const handleCategoryChange = (category: Category) => {
    state.activeCategory.set(category);
    state.note.category.set(category);
  };

  const handleReferenceModalToggle = (show: boolean) => {
    state.showReferenceModal.set(show);
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-gray-50 dark:bg-gray-800">
      <View className="flex-1 bg-gray-100 dark:bg-gray-800">
        <Header
          onSave={handleSave}
          isBookmarked={isBookmarked}
          onBookmarkToggle={handleBookmarkToggle}
        />

        <View className="flex-1 rounded-t-3xl bg-gray-50 -mt-6 pt-6 px-4 dark:bg-gray-800">
          <CategorySelector
            activeCategory={activeCategory as Category}
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
        </View>

        {showToolbar && (
          <Toolbar
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