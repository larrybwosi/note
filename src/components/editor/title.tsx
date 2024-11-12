import React from 'react';
import { TextInput } from 'react-native';
import { observer } from '@legendapp/state/react';

const TitleInput = observer(({ editorState }) => {
  return (
    <TextInput
      value={editorState.title.get()}
      onChangeText={editorState.title.set}
      placeholder="Enter your title here..."
      placeholderTextColor={editorState.theme.get() === 'dark' ? '#a0aec0' : '#4a5568'}
      className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
      style={{ fontFamily: 'System' }}
    />
  );
});

export default TitleInput;