import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { PlusCircle } from 'lucide-react-native';
import { CustomRule } from 'src/components/fin/ts';
import { CustomRuleForm } from 'src/components/budget/custom';
import { BudgetRuleType } from 'src/components/fin/ts';
import { BudgetRuleSelector } from 'src/components/budget/rule';
import { BudgetBreakdown } from 'src/components/budget/breakdown';

const BudgetPlannerScreen: React.FC = () => {
  const [selectedRule, setSelectedRule] = useState<BudgetRuleType>(BudgetRuleType.RULE_50_30_20);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [showCustomRuleForm, setShowCustomRuleForm] = useState(false);

  const budgetData = [
    { key: 1, amount: 50, svg: { fill: 'url(#gradient1)' }, label: 'Needs' },
    { key: 2, amount: 30, svg: { fill: 'url(#gradient2)' }, label: 'Wants' },
    { key: 3, amount: 20, svg: { fill: 'url(#gradient3)' }, label: 'Savings' },
  ];

  const handleRuleChange = (rule: BudgetRuleType) => {
    setSelectedRule(rule);
    if (rule === BudgetRuleType.CUSTOM) {
      setShowCustomRuleForm(true);
    } else {
      setShowCustomRuleForm(false);
    }
  };

  const handleAddCustomRule = (rule: CustomRule) => {
    setCustomRules([...customRules, rule]);
    setShowCustomRuleForm(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-4">Budget Planner</Text>
        
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Current Budget Allocation</Text>
          <View className="aspect-square">
            {/* <PieChart style={{ height: '100%' }} data={budgetData} innerRadius="58%" padAngle={0.01}>
              <Defs>
                <LinearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#4F46E5" />
                  <Stop offset="100%" stopColor="#7C3AED" />
                </LinearGradient>
                <LinearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#10B981" />
                  <Stop offset="100%" stopColor="#059669" />
                </LinearGradient>
                <LinearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#D97706" />
                </LinearGradient>
              </Defs>
            </PieChart> */}
          </View>
          <View className="flex-row justify-around mt-4">
            {budgetData.map((item) => (
              <View key={item.key} className="items-center">
                <View className={`w-4 h-4 rounded-full mb-1`} style={{ backgroundColor: item.svg.fill.split('#')[1] }} />
                <Text className="text-sm font-rmedium text-gray-700 dark:text-gray-300">{item.label}</Text>
                <Text className="text-sm font-rbold text-gray-900 dark:text-white">{item.amount}%</Text>
              </View>
            ))}
          </View>
        </View>

        <BudgetRuleSelector selectedRule={selectedRule} onSelectRule={handleRuleChange} />

        {showCustomRuleForm && (
          <CustomRuleForm onAddRule={handleAddCustomRule} />
        )}

        {selectedRule === BudgetRuleType.CUSTOM && customRules.length > 0 && (
          <BudgetBreakdown rules={customRules} />
        )}

        {selectedRule === BudgetRuleType.CUSTOM && (
          <TouchableOpacity
            className="flex-row items-center justify-center bg-blue-500 rounded-lg p-3 mt-4"
            onPress={() => setShowCustomRuleForm(true)}
          >
            <PlusCircle color="#ffffff" size={24} className="mr-2" />
            <Text className="text-white font-rmedium">Add Custom Rule</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export  default BudgetPlannerScreen