import React from 'react';
import { View, Text } from 'react-native';
import { CustomRule } from '../fin/ts';

interface BudgetBreakdownProps {
  rules: CustomRule[];
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ rules }) => {
  const pieData = rules.map((rule) => ({
    value: rule.percentage,
    svg: { fill: rule.color },
    key: rule.categoryId,
    arc: { outerRadius: '100%', padAngle: 0.01 },
  }));

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
      <Text className="text-lg font-rmedium text-gray-900 dark:text-white mb-2">Custom Budget Breakdown</Text>
      <View className="aspect-square mb-4">
        {/* <PieChart style={{ height: '100%' }} data={pieData} innerRadius="58%" /> */}
      </View>
      {rules.map((rule) => (
        <View key={rule.categoryId} className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: rule.color }} />
            <Text className="font-rmedium text-gray-900 dark:text-white">{rule.label}</Text>
          </View>
          <Text className="font-rbold text-gray-900 dark:text-white">{rule.percentage}%</Text>
        </View>
      ))}
    </View>
  );
};

