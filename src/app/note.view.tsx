import { View, Text, ScrollView, TouchableOpacity, Linking, TextInput, ImageBackground, StatusBar } from 'react-native';
import { Book, Link, Video, Newspaper, Bookmark, BookmarkCheck, Calendar, ArrowLeft, ExternalLink, ChevronDown, Edit, Save, Plus, X } from 'lucide-react-native';
import { observer, useObservable } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { observable } from '@legendapp/state';
import { format } from 'date-fns';
import Animated, { 
  FadeIn,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';

import { Note, Reference, Reference as ReferenceType } from 'src/store/notes/types';
import { useModal } from 'src/components/modals/provider';
import { useNotes } from 'src/store/notes/actions';
import { categories } from 'src/store/notes/data';
import { colorScheme } from 'nativewind';

const initialNote: Note = {
  id: '',
  title: '',
  content: '',
  tags: [],
  categoryId: '1',
  references: [],
  lastEdited: new Date(),
  isBookmarked: false,
  comments: [],
};

  const newReference = observable<ReferenceType>({
    id: '',
    title: '',
    type: 'website',
    url: '',
  });

const NoteViewer = () => {
  const { noteId } = useLocalSearchParams();
  const { getNote, updateNote, addNote } = useNotes();
  const note$ = getNote(noteId as string);
  const noteState$ = useObservable(note$ || initialNote);
  const isEditing$ = useObservable(note$? false: true);
  const showReferences$ = useObservable(note$? false: true);
  const newTag$ = useObservable('');

  const { show, close } = useModal();
  const handleCategoryChange = (newCategoryId: string) => {
    noteState$.categoryId.set(newCategoryId);
    close();
  };

  const handleToggleBookmark = () => {
    noteState$.isBookmarked.set(!noteState$.isBookmarked.get());
  };

  const handleSave = () => {
    // isEditing$.set(false);
    const note = noteState$.get();
    if (noteId){
      updateNote(noteId as string,note);
    } else {
      addNote(note)
    }
    // noteState$.
  };

  const handleAddTag = () => {
    if (newTag$.get()?.trim()) {
      noteState$.tags.push(newTag$.get()?.trim());
      newTag$.set('');
    }
  };

  const handleDeleteTag = (index: number) => {
    noteState$.tags.splice(index, 1);
  };

  const handleAddReference = () => {
    if (newReference.title.get()?.trim()) {
      noteState$.references.push({
        ...newReference.get(),
        id: Date.now().toString(),
      });
      newReference.set({
        id: '',
        title: '',
        type: 'website',
        url: '',
      });
      close();
    }
  };

  const handleFieldChange = (field: keyof Reference, value: Reference['type']) => {
    console.log(value)
    newReference[field].set(value);
  };

  const category = categories.find(c => c.id === noteState$.categoryId.get())!;
  const scheme = category.colorScheme || { gradient: ['#CBD5E1', '#94A3B8'] as [string, string] };

  const ReferenceIcon = ({ type }: { type: ReferenceType['type'] }) => {
    switch (type) {
      case 'book':
        return <Book size={18} color="#6366F1" />;
      case 'website':
        return <Link size={18} color="#8B5CF6" />;
      case 'video':
        return <Video size={18} color="#EC4899" />;
      case 'article':
        return <Newspaper size={18} color="#10B981" />;
      default:
        return null;
    }
  };

  const Reference: React.FC<{ reference: ReferenceType }> = ({ reference }) => {
    const handlePress = () => {
      if (reference.url) {
        Linking.openURL(reference.url);
      }
    };

    return (
      <Animated.View 
        entering={SlideInRight.delay(200).springify()}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
      >
        <TouchableOpacity 
          onPress={handlePress}
          disabled={!reference.url}
          className="flex-row items-center space-x-3"
        >
          <ReferenceIcon type={reference.type} />
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-gray-100 font-rmedium text-base">
              {reference.title}
            </Text>
            {reference.author && (
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                by {reference.author}
              </Text>
            )}
            {reference.page && (
              <Text className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                Page: {reference.page}
              </Text>
            )}
          </View>
          {reference.url && (
            <ExternalLink size={18} color="#6B7280" />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const Tag: React.FC<{ label: string, onDelete: () => void }> = ({ label, onDelete }) => (
    <Animated.View 
      entering={FadeIn.delay(300)}
      className="bg-indigo-100 dark:bg-indigo-900 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
    >
      <Text className="text-indigo-700 dark:text-indigo-200 text-sm font-rmedium">
        {label}
      </Text>
      {isEditing$.get() && (
        <TouchableOpacity onPress={onDelete} className="ml-2">
          <X size={14} color="#4F46E5" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-2xl font-rbold text-gray-400 mb-4 text-center">
        No content yet
      </Text>
      <Text className="text-gray-500 text-center mb-6">
        Start adding content to your note. You can include text, references, and tags to organize your thoughts.
      </Text>
      <TouchableOpacity
        onPress={() => isEditing$.set(true)}
        className="bg-indigo-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-rbold">Start Editing</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent =()=>{
    if(noteState$.content.get()){
      return(
        <View className='mt-4'>
          <Text className='font-abold mb-4 dark:text-gray-300'>Your Note</Text>
          <Text className='font-aregular dark:text-gray-200'>
            {noteState$.content.get()}
          </Text>
        </View>
      )
    } else {
      return(
        <EmptyState />
      )
    }
  }

  //trim
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar hidden/>
      <Animated.View 
        entering={FadeInDown.duration(500)}
        className="flex-1"
      >
        {/* Header */}
        <ImageBackground
          source={require('../../assets/images/image3.png')}
          className="p-6 pb-8 rounded-b-[32px] shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-xl"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-row">
              <TouchableOpacity 
                onPress={handleToggleBookmark}
                className="bg-white/20 p-2 rounded-xl mr-2"
              >
                {noteState$.isBookmarked.get() ? (
                  <BookmarkCheck size={24} color="white" />
                ) : (
                  <Bookmark size={24} color="white" />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => isEditing$.set(!isEditing$.get())}
                className="bg-white/20 p-2 rounded-xl"
              >
                {isEditing$.get() ? (
                  <Save size={24} color="white" onPress={handleSave} />
                ) : (
                  <Edit size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {isEditing$.get() ? (
            <TextInput
              value={noteState$.title.get()}
              onChangeText={(text) => noteState$.title.set(text)}
              className="text-3xl font-rbold text-white mb-4 dark:text-gray-700"
              placeholder="Enter note title"
              placeholderTextColor={colorScheme.get()==='light'?"rgba(255,255,255,0.6)":'white'}
            />
          ) : (
            <Text className="text-3xl font-rbold text-white mb-4">
              {noteState$.title.get() || "Untitled Note"}
            </Text>
          )}

          <View className="flex-row items-center mb-4">
            <Calendar size={16} color="white" className="opacity-80" />
            <Text className="text-white/80 ml-2 font-aregular">
              {format(new Date(noteState$.lastEdited.get()), 'MMM dd, yyyy')}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => show('NoteCategorySelect', {
              categories,
              onSelectCategory: handleCategoryChange,
              selectedCategoryId: noteState$.categoryId.get(),
            })}
            className="flex-row items-center mb-4"
          >
            <category.icon size={20} color={category.color} />
            <Text className="ml-2 text-sm text-white font-abold">{category.name}</Text>
            <ChevronDown size={16} color="#9CA3AF" className="ml-1" />
          </TouchableOpacity>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row flex-wrap"
          >
            {noteState$.tags.get().map((tag, index) => (
              <Tag 
                key={index} 
                label={tag} 
                onDelete={() => handleDeleteTag(index)}
              />
            ))}
            {isEditing$.get() && (
              <View className="flex-row items-center">
                <TextInput
                  value={newTag$.get()}
                  onChangeText={(text) => newTag$.set(text)}
                  onSubmitEditing={handleAddTag}
                  placeholder="Add tag"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  className="bg-white/20 rounded-full px-3 py-1 text-white"
                />
                <TouchableOpacity onPress={handleAddTag} className="ml-2">
                  <Plus size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </ImageBackground>

        {/* Content */}
        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            {isEditing$.get() ? (
              <TextInput
                value={noteState$.content.get()}
                onChangeText={(text) => noteState$.content.set(text)}
                multiline
                textAlignVertical='top'
                className='text-gray-800 dark:text-gray-200 font-aregular dark:bg-gray-900 ml-2 text-lg bg-gray-50 min-h-[150px]'
                placeholder="Start typing your note here..."
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              renderContent()
            )}
          </View>
            

          {/* References Section */}
          <View className="mb-8">
            <TouchableOpacity
              onPress={() => showReferences$.set(!showReferences$.get())}
              className="flex-row items-center justify-between mb-4"
            >
              <Text className="text-xl font-rbold text-gray-900 dark:text-gray-100">
                References
              </Text>
              <Text className="text-indigo-600 dark:text-indigo-400 font-rmedium">
                {showReferences$.get() ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>

            {showReferences$.get() && (
              <View>
                {noteState$.references.get().map((reference, index) => (
                  <Reference key={index} reference={reference} />
                ))}
                {noteState$.references.get().length === 0 && (
                  <TouchableOpacity
                    onPress={() => show('AddReferenceModal', {
                      onAddReference: handleAddReference,
                      newReference,
                      handleFieldChange,
                    })}
                    className="flex-row items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-4"
                  >
                    <Plus size={20} color="#6366F1" />
                    <Text className="ml-2 text-indigo-600 dark:text-indigo-400 font-rmedium">
                      Add Reference
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default observer(NoteViewer);

