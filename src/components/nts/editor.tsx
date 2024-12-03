import { TextInput } from 'react-native';

interface RichTextEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onContentChange }) => {
  return (
    <TextInput
      className="bg-white font-aregular dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-lg min-h-[200px]"
      multiline
      value={initialContent}
      onChangeText={onContentChange}
      placeholder="Start typing your note..."
      placeholderTextColor="#9CA3AF"
    />
  );
};

