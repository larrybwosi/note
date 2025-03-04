import { Check, Plus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import { Category, ICON_MAP } from "src/types/transaction";

interface CategoryItemProps {
  item: Category;
  activeGroupIndex: number | null;
  getCategoryGroup: (id: string) => number | null;
  toggleCategoryInGroup: (id: string, groupIndex: number) => void;
  currentBudget: any;
}
  const CategoryItem = ({ item, activeGroupIndex, getCategoryGroup, toggleCategoryInGroup, currentBudget }: CategoryItemProps) => {
    const groupIndex = getCategoryGroup(item.id);
    const isSelected = groupIndex === activeGroupIndex;
    const isInAnyGroup = groupIndex !== null;
    const Icon = ICON_MAP[item.icon];

    return (
      <TouchableOpacity
        className={`flex-row items-center p-3 border-b border-gray-200 ${isSelected ? 'bg-indigo-50' : ''}`}
        onPress={() => {
          if (activeGroupIndex !== null) {
            toggleCategoryInGroup(item.id, activeGroupIndex);
          }
        }}
      >
        <View className="flex-row items-center flex-1">
          <View
            className="w-8 h-8 rounded-full mr-3 items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            <Icon color={'white'} size={18} />
          </View>
          <Text className="flex-1 text-gray-800 font-medium">{item.name}</Text>
        </View>

        {isInAnyGroup && (
          <View className="flex-row items-center px-2 py-1 rounded-full">
            <Text className="text-xs mr-1">
              {currentBudget?.categoryAllocations[groupIndex].name}
            </Text>
            {isSelected && <Check size={16} color={'gray'} />}
          </View>
        )}

        {!isInAnyGroup && activeGroupIndex !== null && (
          <TouchableOpacity
            className="bg-indigo-100 p-1 rounded-full"
            onPress={() => toggleCategoryInGroup(item.id, activeGroupIndex)}
          >
            <Plus size={16} color="#4F46E5" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  export default CategoryItem