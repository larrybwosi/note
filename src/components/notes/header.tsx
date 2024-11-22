import { router } from "expo-router";
import { Bookmark, BookmarkCheck, X } from "lucide-react-native";
import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native";

interface HeaderProps {
  onSave: () => void;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

const Header = ({ onSave, isBookmarked, onBookmarkToggle }: HeaderProps) => (
  <View className="flex-row justify-between items-center p-4 pt-12 dark:bg-black/30">
    <TouchableOpacity onPress={() => router.back()} className="p-2">
      <X size={24} color="white" />
    </TouchableOpacity>
    <View className="flex-row">
      <TouchableOpacity
        onPress={onBookmarkToggle}
        className="p-2 mr-2"
      >
        {isBookmarked ? (
          <BookmarkCheck size={24} color="white" />
        ) : (
          <Bookmark size={24} color="white" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        className="bg-white rounded-full px-4 py-2"
      >
        <Text className="font-bold text-blue-500">Save</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default Header