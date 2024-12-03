import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Category } from 'src/store/notes/types';

interface CategorySelectProps {
  categories: readonly Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 w-5/6 max-w-sm">
          <Text className="text-xl font-rbold text-gray-900 dark:text-white mb-4">Select Category</Text>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              className={`flex-row items-center p-3 rounded-lg mb-2 ${
                selectedCategoryId === category.id ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <category.icon size={24} color={category.color} />
              <Text className="ml-3 text-gray-900 dark:text-white">{category.name}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-gray-200 dark:bg-gray-700 p-3 rounded-lg items-center"
          >
            <Text className="text-gray-900 dark:text-white font-rbold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

