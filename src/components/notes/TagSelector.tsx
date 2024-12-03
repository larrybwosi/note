import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { tagOptions } from 'src/store/notes/data';
interface TagSelectorProps {
  selectedTags: string[];
  onTagPress: (tagName: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagPress,
}) => (
  <View className="mb-4">
    <Text className="text-base text-gray-700 dark:text-gray-300 font-rbold mb-2">Tags</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {tagOptions.map((tag) => (
        <TouchableOpacity
          key={tag.id}
          onPress={() => onTagPress(tag.name)}
          className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
            selectedTags.includes(tag.name) ? tag.color : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <Text
            className={`${
              selectedTags.includes(tag.name) ? 'text-white dark:text-gray-200' : 'text-gray-700 dark:text-gray-300'
            } font-rmedium text-sm`}
          >
            {tag.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default TagSelector