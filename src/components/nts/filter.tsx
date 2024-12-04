import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Category } from 'src/store/notes/types';

interface CategoryFilterProps {
  categories: readonly Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
    >
      <TouchableOpacity
        onPress={() => onSelectCategory(null)}
        className={`mr-2 px-4 py-2 rounded-xl ${
          selectedCategory === null ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
        }`}
      >
        <Text className={`text-sm  font-amedium${
          selectedCategory === null ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
        }`}>
          All
        </Text>
      </TouchableOpacity>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onSelectCategory(category.id)}
          className={`mr-2 px-4 py-2 rounded-xl flex-row items-center ${
            selectedCategory === category.id ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <category.icon size={16} color={category.color} />
          <Text className={`ml-2 text-sm font-amedium ${
            selectedCategory === category.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

