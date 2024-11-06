import { Pressable, Text, TouchableOpacity } from "react-native";

import { useState } from "react";
import { View } from "react-native";

import { TextInput } from "react-native";
import { FadeOutUp, LinearTransition } from "react-native-reanimated";
import { FadeInDown } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import { observer, useObservable } from "@legendapp/state/react";

const CustomRuleForm = observer(({ showNewRuleModal$, onSave }: any) => {
  const newRule$ = useObservable({
    name: "",
    description: "",
    breakdown: "",
    color: "",
  });

  const { name, description, breakdown } = newRule$;
  const newRule = newRule$.get();
  const setNewRule = newRule$.set;

  const handleSubmit = () => {
    if (name && description && breakdown) {
      onSave({
        type: name,
        description,
        breakdown,
        color: "#3B82F6",
      });
    }
  };

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
        <View className="px-6 pt-8 pb-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-2xl font-rbold text-white">
                Create New Rule
              </Text>
              <Text className="text-sm font-rregular text-blue-100 mt-2 opacity-90">
                Customize your budget allocation
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => showNewRuleModal$.set(false)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Content Section */}
        <View className="p-8 space-y-6">
          {/* Rule Name Input with floating label effect */}
          <View className="space-y-2">
            <Text className="text-sm font-rmedium text-gray-600 mb-1">
              Rule Name
            </Text>
            <View className="flex-row items-center rounded-xl p-4 bg-gray-50 border-2 border-gray-100 focus:border-blue-500 transition-colors duration-200">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="pricetag" size={20} color="#3B82F6" />
              </View>
              <TextInput
                value={newRule.name}
                onChangeText={(text) =>
                  setNewRule((prev) => ({ ...prev, name: text }))
                }
                className="flex-1 font-rregular text-gray-900 text-base"
                placeholder="e.g., 40/30/30 Rule"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Description Input with enhanced styling */}
          <View className="space-y-2">
            <Text className="text-sm font-rmedium text-gray-600 mb-1">
              Description
            </Text>
            <View className="rounded-xl bg-gray-50 border-2 border-gray-100">
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
            <Text className="text-sm font-rmedium text-gray-600 mb-1">
              Breakdown
            </Text>
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

        {/* Enhanced Footer */}
        <View className="p-6 border-t border-gray-100 bg-gray-50">
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => showNewRuleModal$.set(false)}
              className="flex-1 py-4 rounded-xl border-2 border-gray-200 bg-white"
            >
              <Text className="text-center font-rmedium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30"
            >
              <View className="flex-row items-center justify-center space-x-2">
                <Ionicons name="save-outline" size={20} color="white" />
                <Text className="text-center font-rmedium text-white">
                  Save Rule
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

export enum BudgetRuleType {
  RULE_15_65_20 = '15/65/20 Rule',
  RULE_50_30_20 = '50/30/20 Rule',
  RULE_70_20_10 = '70/20/10 Rule',
  CUSTOM = 'Custom Rule'
}
interface Rule {
  type: BudgetRuleType;
  description: string;
  breakdown: string;
  color: string;
}

interface CustomRule {
  categoryId: string;
  label: string;
  percentage: number;
  color: string;
  description: string;
}
const BudgetRuleSelector = ({rules}: {rules: Rule[]}) => {
  const [selectedRule, setSelectedRule] = useState<BudgetRuleType>(rules[0].type);
  const [customRules, setCustomRules] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleCustomRuleSave = (newRule: CustomRule) => {
    // setCustomRules([...customRules, newRule]);
    // setSelectedRule(newRule.type);
    // setShowCustomForm(false);
  };
  const showNewRuleModal$ = useObservable(false);

  const allRules = [...rules, ...customRules];

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutUp}
      layout={LinearTransition.springify()}
      className="space-y-6"
    >
      <View>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Budget Rule</Text>
        <Text className="text-base text-gray-600 leading-relaxed font-rmedium dark:text-gray-400">
          Choose a budget rule that fits your financial goals
        </Text>
      </View>

      <View className="space-y-4">
        {allRules.map((rule) => (
          <Pressable
            key={rule.type}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 mt-4 shadow-md border-2 ${
              selectedRule === rule.type ? 'border-blue-500' : 'border-transparent'
            }`}
            onPress={() => setSelectedRule(rule.type)}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-bold dark:text-white text-gray-900 mb-1">{rule.type}</Text>
                <Text className="text-base text-gray-600 dark:text-gray-400 mb-2">{rule.description}</Text>
                <Text style={{ color: rule.color }} className="text-sm font-medium">
                  {rule.breakdown}
                </Text>
              </View>
              {selectedRule === rule.type && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </View>
          </Pressable>
        ))}

        <Pressable
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-4 shadow-md border-2 border-dashed border-gray-300"
          onPress={() => setShowCustomForm(true)}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
            <Text className="text-blue-500 ml-2 font-bold">Create Custom Rule</Text>
          </View>
        </Pressable>

        {/* {showCustomForm && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-4 shadow-md">
            <CustomRuleForm onSave={handleCustomRuleSave} showNewRuleModal$={showNewRuleModal$} />
          </View>
        )} */}
      </View>
    </Animated.View>
  );
};

export default observer(BudgetRuleSelector);