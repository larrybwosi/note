import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useObservable } from '@legendapp/state/react';
import { Tag, X } from 'lucide-react-native';

const CustomRuleForm: React.FC<{ close: () => void }> = ({close }) => {
    const newRule$ = useObservable({
      name: '',
      description: '',
      breakdown: '',
      color: '',
    });
  
    const { name, description, breakdown } = newRule$;
    const newRule = newRule$.get();
    const setNewRule = newRule$.set;

    const handleSubmit = () => {
      if (name && description && breakdown) {
        // onSave({
        //   type: name,
        //   description,
        //   breakdown,
        //   color: '#3B82F6',
        // });
      }
      close()
    };
  return (
    <View className="space-y-4">
      {/* Enhanced Header with Gradient Background */}
      <View className="px-2 pt-8 pb-6 ">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-rbold darktext-white">Create New Rule</Text>
            <Text className="text-sm font-rregular dark:text-blue-100 mt-2 opacity-90">
              Customize your budget allocation
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => close()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm"
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Content Section */}
      <View className="p-2 space-y-2">
        {/* Rule Name Input with floating label effect */}
        <View className="space-y-2">
          <Text className="text-sm font-rmedium text-gray-600 mb-1">Rule Name</Text>
          <View className="flex-row items-center rounded-xl p-4 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 transition-colors duration-200">
            <View className="w-10 h-10 rounded-full dark:bg-blue-100 items-center justify-center mr-3">
              <Tag size={20} color="#3B82F6" />
            </View>
            <TextInput
              value={newRule.name}
              onChangeText={(text) => setNewRule((prev) => ({ ...prev, name: text }))}
              className="flex-1 font-rregular text-gray-900 text-base"
              placeholder="e.g., 40/30/30 Rule"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Description Input with enhanced styling */}
        <View className="space-y-2">
          <Text className="text-sm font-rmedium text-gray-600 mb-1">Description</Text>
          <View className="rounded-xl dark:bg-gray-50 border-2 border-gray-100">
            <TextInput
              className="p-4 font-rregular text-gray-900 min-h-[100px] text-base"
              placeholder="Explain how this rule helps in budgeting..."
              value={description.get()}
              onChangeText={description.set}
              multiline={true}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Breakdown Input */}
        <View className="space-y-2">
          <Text className="text-sm font-rmedium text-gray-600 mb-1">Breakdown</Text>
          <View className="rounded-xl bg-gray-50 border-2 border-gray-100">
            <TextInput
              className="p-4 font-rregular text-gray-900 text-base"
              placeholder="e.g., 40% Needs, 30% Wants, 30% Savings"
              value={breakdown.get()}
              onChangeText={breakdown.set}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      </View>
      <TouchableOpacity
        className="bg-blue-500 py-2 px-4 rounded-lg"
        onPress={handleSubmit}
      >
        <Text className="text-white font-amedium text-center">Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomRuleForm;

