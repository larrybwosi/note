import { observer, use$, useObservable } from "@legendapp/state/react";
import { Save, Tag, X } from "lucide-react-native";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";


const CustomRuleForm = observer(({ isVisible, close }: any) => {
  const newRule$ = useObservable({
    name: '',
    description: '',
    breakdown: '',
    color: '',
  });

  const { name, description, breakdown } = newRule$;
  const newRule = use$(newRule$);
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

  if(!isVisible) return

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 items-center justify-center z-50 backdrop-blur-lg"
    >
      <Animated.View
        entering={FadeInDown.springify().delay(200)}
        className="bg-white rounded-3xl w-11/12 max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Enhanced Header with Gradient Background */}
        <View className="px-6 pt-8 pb-6 ">
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
        <View className="p-8 space-y-6">
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
                value={use$(description)}
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
                value={use$(breakdown)}
                onChangeText={breakdown.set}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Enhanced Footer */}
        <View className="p-6 border-t border-gray-100 bg-gray-50">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => close()}
              className="flex-1 py-4 rounded-xl border-2 border-gray-200 bg-white"
            >
              <Text className="text-center font-rmedium text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Save size={20} color="white" />
                <Text className="text-center font-rmedium dark:text-white">Save Rule</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

export default CustomRuleForm