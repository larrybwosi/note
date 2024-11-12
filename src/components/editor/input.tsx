import React from 'react';
import { View, TextInput } from 'react-native';
import { observer } from '@legendapp/state/react';
// import { Markdown } from 'react-native-markdown-display';

const RichTextInput = observer(({ editorState, isPreviewMode }) => {
  if (isPreviewMode) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        {/* <Markdown>{editorState.content.get()}</Markdown> */}
      </View>
    );
  }

  return (
    <TextInput
      multiline
      value={editorState.content.get()}
      onChangeText={editorState.content.set}
      placeholder="Start typing your note here..."
      placeholderTextColor={editorState.theme.get() === 'dark' ? '#a0aec0' : '#4a5568'}
      className="text-base text-gray-800 dark:text-gray-200 min-h-[200px]"
      style={{ fontFamily: 'System' }}
    />
  );
});

export default RichTextInput;