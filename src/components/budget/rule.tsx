import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BudgetRuleType } from '../fin/ts';

interface BudgetRuleSelectorProps {
  selectedRule: BudgetRuleType;
  onSelectRule: (rule: BudgetRuleType) => void;
}

export const BudgetRuleSelector: React.FC<BudgetRuleSelectorProps> = ({ selectedRule, onSelectRule }) => {
  const rules = Object.values(BudgetRuleType);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
      <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Select Budget Rule</Text>
      <View className="flex-row flex-wrap">
        {rules.map((rule) => (
          <TouchableOpacity
            key={rule}
            className={`mr-2 mb-2 px-4 py-2 rounded-full ${
              selectedRule === rule ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onPress={() => onSelectRule(rule)}
          >
            <Text
              className={`font-rmedium ${
                selectedRule === rule ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}
            >
              {rule}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

