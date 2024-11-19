import { observer, useObservable } from '@legendapp/state/react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NewCategoryProps } from './provider';
import { X } from 'lucide-react-native';


const NewCategory = observer(({type, close}:NewCategoryProps) => {
  const state = useObservable({
    name: '',
    description: '',
  });

  const { name, description } = state;
  const handleSubmit = () => {};

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="absolute top-0 left-0 right-0 bottom-0 bg-black/60 items-center justify-center z-50 backdrop-blur-sm"
    >
      <Animated.View
        entering={FadeInDown.springify().delay(200)}
        className="bg-white rounded-3xl w-11/12 max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <Text className="text-2xl font-rbold text-gray-900">Add New Category</Text>
            <TouchableOpacity
              onPress={() => close()}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <X size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm font-rregular text-gray-500 mt-1">
            Create a custom category to track your finances
          </Text>
        </View>

        {/* Content */}
        <View className="p-6 space-y-6">
          {/* Category Name Input */}
          <View>
            <Text className="text-sm font-rmedium text-gray-700 mb-2">Category Name</Text>
            <View className="flex-row items-center rounded-xl p-3 border border-gray-200 focus:border-blue-500">
              <Ionicons name="pricetag" size={20} color="#6B7280" />
              <TextInput
                value={name.get()}
                onChangeText={name.set}
                className="flex-1 ml-3 font-rregular text-gray-900"
                placeholder="Enter category name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Icon Selection Preview */}
          <View>
            <Text className="text-sm font-rmedium text-gray-700 mb-2">Category Icon</Text>
            <View className="flex-row items-center rounded-xl p-4 border border-gray-200">
              <Text className="text-2xl mr-3">{type === 'INCOME' ? '💰' : '📦'}</Text>
              <Text className="text-sm font-rregular text-gray-500">
                Default icon will be assigned based on category type
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="p-6 border-t border-gray-100">
          <View className="flex-row space-x-4 gap-2">
            <TouchableOpacity
              onPress={() => close()}
              className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 bg-white"
            >
              <Text className="text-center font-rmedium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-3.5 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Ionicons name="add-circle" size={20} color="white" />
                <Text className="text-center font-rmedium text-white">Add Category</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

export default NewCategory;
