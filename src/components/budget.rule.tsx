import { Pressable, Text, View } from 'react-native';
import Animated, { FadeOutUp, LinearTransition, FadeInDown }from 'react-native-reanimated';
import { PlusCircle, CheckCircle } from 'lucide-react-native';
import { observer, } from '@legendapp/state/react';
import { useState } from 'react';

import { BudgetRuleType } from 'src/store/types';
import { useModal } from './modals/provider';

interface Rule {
  type: BudgetRuleType;
  description: string;
  breakdown: string;
  color: string;
}

const BudgetRuleSelector = ({ rules }: { rules: Rule[] }) => {
  const [selectedRule, setSelectedRule] = useState<BudgetRuleType>(rules[0].type);
  const [customRules, setCustomRules] = useState([]);

  const {show} = useModal()
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
                <Text className="text-lg font-bold dark:text-white text-gray-900 mb-1">
                  {rule.type}
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-400 mb-2">
                  {rule.description}
                </Text>
                <Text style={{ color: rule.color }} className="text-sm font-amedium">
                  {rule.breakdown}
                </Text>
              </View>
              {selectedRule === rule.type && (
                <CheckCircle size={24} color="#3B82F6" />
              )}
            </View>
          </Pressable>
        ))}

        <Pressable
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-4 shadow-md border-2 border-dashed border-gray-300"
          onPress={() => show('CustomRuleForm',{})}
        >
          <View className="flex-row items-center justify-center">
            <PlusCircle size={24} color="#3B82F6" />
            <Text className="text-blue-500 ml-2 font-bold">Create Custom Rule</Text>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default observer(BudgetRuleSelector);
