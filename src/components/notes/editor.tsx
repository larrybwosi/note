import React, { memo, useMemo } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { observer, Reactive, useComputed, useObservable } from '@legendapp/state/react';
import { colorScheme } from 'nativewind';

// Define interfaces for our state, props, and element types
interface EditorState {
  title: string;
  content: string;
}

interface ElementType {
  type: 'bullet' | 'numbered' | 'checkbox' | 'link' | 'mention' | 'comment' | 'reference' | 'text';
  content: string;
  url?: string;
  checked?: boolean;
}

interface EditorProps {
  initialState: EditorState;
  noteType: 'todo' | 'list' | 'note';
}

const parseContent = (text: string, noteType: 'todo' | 'list' | 'note'): ElementType[][] => {
  const lines = text.split('\n');
  return lines.map(line => {
    const parts: ElementType[] = [];
    
    // Parse different elements based on note type
    const checkForSpecialElements = (text: string) => {
      const linkRegex = /\[(.*?)\]$$(.*?)$$/g;
      const mentionRegex = /@(\w+)/g;
      const commentRegex = /\/\/(.*?)$/g;
      const referenceRegex = /#(\w+)/g;
      
      let modifiedText = text;
      
      modifiedText = modifiedText.replace(linkRegex, (match, text, url) => {
        parts.push({ type: 'link', content: text, url });
        return '';
      });
      
      modifiedText = modifiedText.replace(mentionRegex, (match, username) => {
        parts.push({ type: 'mention', content: username });
        return '';
      });
      
      modifiedText = modifiedText.replace(commentRegex, (match, comment) => {
        parts.push({ type: 'comment', content: comment });
        return '';
      });
      
      modifiedText = modifiedText.replace(referenceRegex, (match, reference) => {
        parts.push({ type: 'reference', content: reference });
        return '';
      });
      
      if (modifiedText) {
        parts.push({ type: 'text', content: modifiedText });
      }
    };
    
    if (noteType === 'todo' && line.trim().startsWith('- [ ]')) {
      parts.push({ type: 'checkbox', content: line.slice(5), checked: false });
    } else if (noteType === 'todo' && line.trim().startsWith('- [x]')) {
      parts.push({ type: 'checkbox', content: line.slice(5), checked: true });
    } else if (noteType === 'list' && line.trim().startsWith('- ')) {
      parts.push({ type: 'bullet', content: line.slice(2) });
    } else if (noteType === 'list' && line.trim().match(/^\d+\./)) {
      parts.push({ type: 'numbered', content: line.slice(line.indexOf('.') + 1) });
    } else {
      checkForSpecialElements(line);
    }
    
    return parts;
  });
};

const RichTextDisplay = memo(({ content, noteType }: { content: string; noteType: 'todo' | 'list' | 'note' }) => {
  const parsedContent = useComputed(() => parseContent(content, noteType));
  
  const renderElement = (element: ElementType, index: string) => {
    switch (element.type) {
      case 'bullet':
        return (
          <View key={index} className="flex-row items-center mb-2">
            <Text className={`dark:text-gray-300 text-gray-700 mr-2`}>•</Text>
            <Text className={`dark:text-gray-300 text-gray-700 font-rregular`}>{element.content}</Text>
          </View>
        );
      case 'numbered':
        return (
          <View key={index} className="flex-row items-center mb-2">
            <Text className={`dark:text-gray-300 text-gray-700 mr-2 font-rmedium`}>{index.split('-')[1]}.</Text>
            <Text className={`dark:text-gray-300 text-gray-700 font-rregular`}>{element.content}</Text>
          </View>
        );
      case 'checkbox':
        return (
          <View key={index} className="flex-row items-center mb-2">
            <Text className={`dark:text-gray-300 text-gray-700 mr-2`}>
              {element.checked ? '✓' : '□'}
            </Text>
            <Text className={`dark:text-gray-300 text-gray-700 font-rregular`}>{element.content}</Text>
          </View>
        );
      case 'link':
        return (
          <Text
            key={index}
            className="text-blue-500 underline font-rmedium"
            onPress={() => {/* Handle link press */}}
          >
            {element.content}
          </Text>
        );
      case 'mention':
        return (
          <Text key={index} className="text-purple-500 font-rmedium">
            @{element.content}
          </Text>
        );
      case 'comment':
        return (
          <Text key={index} className="text-gray-500 italic font-rregular">
            //{element.content}
          </Text>
        );
      case 'reference':
        return (
          <Text key={index} className="text-yellow-500 font-rmedium">
            #{element.content}
          </Text>
        );
      default:
        return (
          <Text key={index} className={`dark:text-gray-300 text-gray-700 font-rregular`}>
            {element.content}
          </Text>
        );
    }
  };

  return (
    <ScrollView className="p-4">
      {parsedContent.get().map((line, lineIndex) => (
        <View key={lineIndex} className="flex-row flex-wrap items-center mb-2">
          {line.map((element, elementIndex) => renderElement(element, `${lineIndex}-${elementIndex}`))}
        </View>
      ))}
    </ScrollView>
  );
});

const TitleInput = ({ editorState }: { editorState: any }) => {
  return (
    <Reactive.TextInput
      $value={editorState.title.get()}
      $onChangeText={(text: string) => editorState.title.set(text)}
      $placeholder="Enter your title here..."
      $placeholderTextColor={colorScheme.get() === 'dark' ? '#a0aec0' : '#4a5568'}
      $className={`text-3xl font-rbold mb-4 dark:text-white text-gray-800 px-4 py-2`}
    />
  );
};

const Editor: React.FC<EditorProps> = ({ initialState, noteType }) => {
  const editorState = useObservable({
    title: initialState.title,
    content: initialState.content,
  });

  const handleTextChange = (v: string) => {
    editorState.content.set(v);
  };

  return (
    <View className={`flex-1 dark:bg-gray-900 bg-white`}>
      <TitleInput editorState={editorState} />
      <RichTextDisplay content={editorState.content.get()} noteType={noteType} />
      <Reactive.TextInput
        $multiline
        $value={editorState.content.get()}
        $onChangeText={handleTextChange}
        $placeholder="Start typing your note here..."
        $placeholderTextColor={'gray'}
        $className={`text-base dark:text-gray-300 text-gray-700 min-h-[200px] px-4 py-2 font-rregular`}
      />
    </View>
  );
};

export default observer(Editor);