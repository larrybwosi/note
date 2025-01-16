import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { PlusCircle, Tag } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useObservable } from '@legendapp/state/react';

export interface NewCategoryProps {
  type: "INCOME" | "EXPENSES";
}

const NewCategory: React.FC<NewCategoryProps & { onClose: () => void }> = ({ type, onClose }) => {
  const state = useObservable({
    name: '',
    description: '',
  });

  const { name, description } = state;
  const handleSubmit = () => {};
  return (
    <View className="space-y-4">
      <Text className="text-2xl font-rbold text-gray-900 dark:text-white">
        New {type.toLowerCase()} Category
      </Text>
      
      <Animated.View
        entering={FadeInDown.springify().delay(200)}
        className="bg-whit overflow-hidden"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-gray-100">
          <Text className="text-base font-rregular text-gray-500 mt-1">
            Create a custom category to track your finances
          </Text>
        </View>

        {/* Content */}
        <View className="p-6 space-y-6">
          {/* Category Name Input */}
          <View>
            <Text className="text-base font-rmedium text-gray-700 mb-2">Category Name</Text>
            <View className="flex-row items-center rounded-xl p-3 border border-gray-200 focus:border-blue-500">
              <Tag size={20} color="#6B7280" />
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
            <Text className="text-base font-rmedium text-gray-700 mb-2">Category Icon</Text>
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
              onPress={() => onClose()}
              className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 bg-white"
            >
              <Text className="text-center font-rmedium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-3.5 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <PlusCircle size={20} color="white" />
                <Text className="text-center font-rmedium text-white">Add Category</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default NewCategory;

