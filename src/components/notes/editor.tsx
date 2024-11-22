import { observer, Reactive } from '@legendapp/state/react';
import { colorScheme } from 'nativewind';
import { View } from 'react-native';

interface EditorProps {
  state: any;
  noteType: 'todo' | 'list' | 'note';
}

const Editor: React.FC<EditorProps> = ({state:notestate }) => (
  <View className={`flex-1 dark:bg-gray-800 bg-white`}>
    <Reactive.TextInput
      $value={notestate.title.get()}
      $onChangeText={notestate.title.set}
      $placeholder="Enter your title here..."
      $placeholderTextColor={colorScheme.get()==='light'?"#374151":"#CDCDE0"}
      $className={`text-3xl font-rbold mb-2 dark:text-white dark:bg-gray-800 text-gray-800 px-4 dark:placeholder-gray-200 py-2`}
    />

    <Reactive.TextInput
      $value={notestate.content.get()}
      $onChangeText={notestate.content.set}
      $placeholder="Start typing your note here..."
      $placeholderTextColor={colorScheme.get()==='light'?"#374151":"#CDCDE0"}
      $className='text-gray-800 dark:text-gray-200 font-aregular dark:bg-gray-800 ml-2 text-lg bg-gray-50 min-h-[150px]'
      $multiline
      $numberOfLines={3}
      $textAlignVertical='top'
    />
  </View>
);

export default observer(Editor);