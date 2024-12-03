import { Text } from 'react-native';

interface HighlightedTextProps {
  content: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ content }) => {
  // This is a simple implementation. For more advanced highlighting,
  // you might want to use a library like react-native-highlight-words
  return (
    <Text className="text-gray-900 dark:text-white font-aregular mb-4">
      {content}
    </Text>
  );
};

