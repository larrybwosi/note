import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { NoteCategorySelectProps } from './provider';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

interface EnhancedNoteCategorySelectProps extends NoteCategorySelectProps {
  onClose: () => void;
}

const NoteCategorySelect: React.FC<EnhancedNoteCategorySelectProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onClose
}) => {
  return (
    <Animated.View 
      className="inset-0 bg-black/50 justify-end"
      entering={FadeIn}
      exiting={FadeOut}
    >
      <Animated.View 
        className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8"
        entering={SlideInDown}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white">Select Category</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text className="text-gray-600 dark:text-gray-400 mb-4">
          Choose a category to organize your note. Each category helps you group similar notes together.
        </Text>
        <ScrollView className="max-h-96">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              className={`flex-row items-center p-4 rounded-xl mb-3 ${
                selectedCategoryId === category.id 
                  ? 'bg-blue-100 dark:bg-blue-900' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <View className="bg-white dark:bg-gray-800 p-2 rounded-full">
                <category.icon size={24} color={category.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className={`text-lg font-rbold ${
                  selectedCategoryId === category.id
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {category.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={2}>
                  {/* {category.description || `Organize your ${category.name.toLowerCase()} related notes here.`} */}
                </Text>
              </View>
              {selectedCategoryId === category.id && (
                <View className="bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                  <X size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          onPress={onClose}
          className="mt-6 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl items-center"
        >
          <Text className="text-gray-900 dark:text-white font-rbold">Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default NoteCategorySelect;

