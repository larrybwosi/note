import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from '@legendapp/state/react';
import { observable } from '@legendapp/state';
import { Edit2, Save, Bookmark, Link, MessageSquare, Tag, ChevronDown } from 'lucide-react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { Note, Reference } from 'src/store/notes/types';
import { categories } from 'src/store/notes/data';
import { RichTextEditor } from 'src/components/nts/editor';
import { HighlightedText } from 'src/components/nts/highlight';
import { TagsList } from 'src/components/nts/tag.list';
import { ReferencesList } from 'src/components/nts/refrence';
import { CategorySelect } from 'src/components/nts/category';
import { CommentsList } from 'src/components/nts/comment';
import { useModal } from 'src/components/modals/provider';


// Sample note for demonstration
const sampleNote: Note = {
  id: '1',
  title: 'Introduction to React Native',
  content: 'React Native is a popular framework for building mobile applications. It allows developers to use React along with native platform capabilities.',
  tags: ['react', 'mobile', 'javascript'],
  categoryId: '1',
  references: [
    { id: '1', title: 'React Native Documentation', url: 'https://reactnative.dev/docs/getting-started', type:'website' },
    { id: '2', title: 'React Native: The Practical Guide', url: 'https://www.udemy.com/course/react-native-the-practical-guide/', type:'article' },
  ],
  elements: [],
  lastEdited: new Date('2023-05-15'),
  isBookmarked: true,
  comments: [
    { id: '1', content: 'Great introduction!', author: 'John Doe', createdAt: new Date('2023-05-16') },
    { id: '2', content: 'Could you add more examples?', author: 'Jane Smith', createdAt: new Date('2023-05-17') },
  ],
};

const noteState = observable(sampleNote);

const NotesIdScreen = observer(() => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(noteState.content.get());

  const {show, close} = useModal()


  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes
      noteState.content.set(editedContent);
      noteState.lastEdited.set(new Date());
    }
    setIsEditing(!isEditing);
  };

  const handleToggleBookmark = () => {
    noteState.isBookmarked.set(!noteState.isBookmarked.get());
  };

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  const handleAddTag = (newTag: string) => {
    const currentTags = noteState.tags.get();
    if (!currentTags.includes(newTag)) {
      noteState.tags.set([...currentTags, newTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = noteState.tags.get();
    noteState.tags.set(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddReference = (newReference: Reference) => {
    const currentReferences = noteState.references.get();
    noteState.references.set([...currentReferences, newReference]);
  };

  const handleAddComment = (newComment: { content: string, author: string }) => {
    const currentComments = noteState.comments.get();
    noteState.comments.set([...currentComments, { ...newComment, id: Date.now().toString(), createdAt: new Date() }]);
  };

  const handleCategoryChange = (newCategoryId: string) => {
    noteState.categoryId.set(newCategoryId);
    close();
  };

  const category = categories.find(c => c.id === noteState.categoryId.get())!;


  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-4 py-6">
        <Animated.View entering={FadeIn.duration(400)}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-rbold text-gray-900 dark:text-white">{noteState.title.get()}</Text>
            <View className="flex-row">
              <TouchableOpacity onPress={handleToggleBookmark} className="mr-4">
                <Bookmark 
                  size={24} 
                  color={noteState.isBookmarked.get() ? category.color : '#9CA3AF'} 
                  fill={noteState.isBookmarked.get() ? category.color : 'transparent'} 
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleEdit}>
                {isEditing ? <Save size={24} color="#10B981" /> : <Edit2 size={24} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => show('NoteCategorySelect',{categories,onSelectCategory:handleCategoryChange,selectedCategoryId: noteState.categoryId.get(), })}
            className="flex-row items-center mb-4"
          >
            <category.icon size={20} color={category.color} />
            <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-abold">{category.name}</Text>
            <ChevronDown size={16} color="#9CA3AF" className="ml-1" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(200).duration(400)}>
          {isEditing ? (
            <RichTextEditor
              initialContent={editedContent}
              onContentChange={handleContentChange}
            />
          ) : (
            <HighlightedText content={noteState.content.get()} />
          )}
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(400).duration(400)}>
          <View className="mt-8">
            <View className="flex-row items-center mb-2">
              <Tag size={20} color="#9CA3AF" />
              <Text className="ml-2 text-lg font-rbold text-gray-900 dark:text-white">Tags</Text>
            </View>
            <TagsList 
              tags={noteState.tags.get()} 
              onAddTag={handleAddTag} 
              onRemoveTag={handleRemoveTag} 
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(600).duration(400)}>
          <View className="mt-6">
            <View className="flex-row items-center mb-2">
              <Link size={20} color="#9CA3AF" />
              <Text className="ml-2 text-lg font-rbold text-gray-900 dark:text-white">References</Text>
            </View>
            <ReferencesList 
              references={noteState.references.get()} 
              onAddReference={handleAddReference} 
              onDeleteReference={()=>{}}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInRight.delay(800).duration(400)}>
          <View className="mt-6">
            <View className="flex-row items-center mb-2">
              <MessageSquare size={20} color="#9CA3AF" />
              <Text className="ml-2 text-lg font-rbold text-gray-900 dark:text-white">Comments</Text>
            </View>
            <CommentsList
              comments={noteState.comments.get()} 
              onAddComment={handleAddComment}
              onDeleteComment={(commentId) => {
                const currentComments = noteState.comments.get();
                noteState.comments.set(currentComments.filter(comment => comment.id !== commentId));
              }}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default NotesIdScreen;
