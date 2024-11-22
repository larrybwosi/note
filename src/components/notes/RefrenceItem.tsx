import { View, Text, TouchableOpacity } from 'react-native';
import { Reference } from 'src/store/notes/types';
import { BookCheck, BookmarkCheck, FilePenLine, Globe2, Video } from 'lucide-react-native';

interface ReferenceItemProps {
  reference: Reference;
}

interface ReferencesProps {
  references: Reference[];
}

export const ReferenceItem: React.FC<ReferenceItemProps> = ({ reference }) => {
  const getIcon = (type: Reference['type']) => {
    switch (type) {
      case 'book':
        return BookCheck;
      case 'website':
        return Globe2;
      case 'article':
        return FilePenLine;
      case 'video':
        return Video;
      default:
        return BookmarkCheck;
    }
  };

  const Icon = getIcon(reference.type)

  return (
    <View className="bg-gray-100 rounded-lg p-3 mb-2">
      <View className="flex-row items-center">
        <Icon
          size={16}
          color="#374151"
          style={{ marginRight: 8 }}
        />
        <Text className="font-semibold text-gray-800 flex-1">{reference.title}</Text>
      </View>
      {reference.author && (
        <Text className="text-gray-600 text-sm mt-1">by {reference.author}</Text>
      )}
      {reference.url && (
        <TouchableOpacity
          className="mt-1"
          onPress={() => {
            // Handle URL opening logic here
            console.log('Opening URL:', reference.url);
          }}
          accessibilityRole="link"
          accessibilityHint={`Open ${reference.title} website`}
        >
          <Text className="text-blue-500 text-sm">{reference.url}</Text>
        </TouchableOpacity>
      )}
      {reference.page && (
        <Text className="text-gray-600 text-sm mt-1">Page: {reference.page}</Text>
      )}
    </View>
  );
};

const References = ({ references }: ReferencesProps) => (
  <View className="mb-4">
    <Text className="text-lg font-bold mb-2">References</Text>
    {references.map((ref, index) => (
      <ReferenceItem key={index} reference={ref} />
    ))}
  </View>
);

export default References;