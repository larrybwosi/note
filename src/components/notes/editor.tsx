import { View } from 'react-native';
import { observer, Reactive } from '@legendapp/state/react';
import { colorScheme } from 'nativewind';
import { Textarea, TextareaInput } from 'src/components/ui/textarea';


interface EditorProps {
  state: any;
  noteType: 'todo' | 'list' | 'note';
}

const TitleInput = ({ editorState }: { editorState: any }) => {
  return (
    <Reactive.TextInput
      $value={editorState.title.get()}
      $onChangeText={(text: string) => editorState.title.set(text)}
      $placeholder="Enter your title here..."
      $placeholderTextColor={colorScheme.get() === 'dark' ? '#a0aec0' : '#4a5568'}
      $className={`text-3xl font-rbold mb-2 dark:text-white text-gray-800 px-4 py-2`}
    />
  );
};

const Editor: React.FC<EditorProps> = ({state:notestate,noteType }) => {

  const handleTextChange = (v: string) => {
    notestate.content.set(v);
  };

  return (
    <View className={`flex-1 dark:bg-gray-900 bg-white`}>
      <TitleInput editorState={notestate} />

      <Textarea
        size="lg" 
        variant="default" 
        disabled={false} 
        invalid={false}
        showBorder={false}
        cursorPosition="top"
        fontFamily="font-aregular"
      >
        <TextareaInput
          value={notestate.content.get()}
          onChangeText={handleTextChange}
          placeholder="Start typing your note here..."
        />
      </Textarea>
    </View>
  );
};

export default observer(Editor);