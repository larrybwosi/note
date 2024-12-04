import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { CustomRule } from '../fin/ts';

interface CustomRuleFormProps {
  onAddRule: (rule: CustomRule) => void;
}

export const CustomRuleForm: React.FC<CustomRuleFormProps> = ({ onAddRule }) => {
  const [label, setLabel] = useState('');
  const [percentage, setPercentage] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (label && percentage) {
      const newRule: CustomRule = {
        categoryId: Date.now().toString(), // Generate a unique ID
        label,
        percentage: parseFloat(percentage),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Generate a random color
        description,
      };
      onAddRule(newRule);
      setLabel('');
      setPercentage('');
      setDescription('');
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
      <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Add Custom Rule</Text>
      <View className="mb-4">
        <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-1">Label</Text>
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
          value={label}
          onChangeText={setLabel}
          placeholder="e.g., Entertainment"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-1">Percentage</Text>
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
          value={percentage}
          onChangeText={setPercentage}
          placeholder="e.g., 15"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
      </View>
      <View className="mb-4">
        <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</Text>
        <TextInput
          className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#9CA3AF"
          multiline
        />
      </View>
      <TouchableOpacity
        className="flex-row items-center justify-center bg-blue-500 rounded-lg p-3"
        onPress={handleSubmit}
      >
        <Check color="#ffffff" size={24} className="mr-2" />
        <Text className="text-white font-rmedium">Add Rule</Text>
      </TouchableOpacity>
    </View>
  );
};

