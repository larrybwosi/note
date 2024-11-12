import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { observer } from '@legendapp/state/react';

const Toolbar = observer(({ editorState, onTogglePreview, onShowTemplates }) => {
  const iconColor = editorState.theme.get() === 'dark' ? 'white' : 'black';

  return (
    <View className="flex-row justify-around items-center bg-white dark:bg-gray-800 py-2 px-4 rounded-t-2xl shadow-lg">
      <TouchableOpacity onPress={() => {/* Implement bold */}}>
        <Ionicons name="bold" size={24} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {/* Implement italic */}}>
        <Ionicons name="italic" size={24} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {/* Implement underline */}}>
        <Ionicons name="underline" size={24} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onTogglePreview}>
        <Ionicons name="eye" size={24} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onShowTemplates}>
        <Ionicons name="document-text" size={24} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
});

export default Toolbar;