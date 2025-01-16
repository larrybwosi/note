import React from 'react';
import { View, Text } from 'react-native';
import { Insights } from 'src/store/types';

interface InsightsSummaryProps {
  insights: Insights;
}

export const InsightsSummary: React.FC<InsightsSummaryProps> = ({ insights }) => {
  return (
    <View className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
      <Text className="text-lg font-rbold text-gray-900 dark:text-white mb-2">Financial Insights</Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600 dark:text-gray-400">Guilt-free Balance:</Text>
        <Text className="font-rbold text-green-500">${insights.guiltFreeBalance.toFixed(2)}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600 dark:text-gray-400">Projected Savings:</Text>
        <Text className="font-rbold text-blue-500">${insights.projectedSavings.toFixed(2)}</Text>
      </View>
      {insights.unusualSpending.length > 0 && (
        <View>
          <Text className="text-gray-600 dark:text-gray-400 mt-2 mb-1">Unusual Spending:</Text>
          {insights.unusualSpending.map((item, index) => (
            <Text key={index} className="text-yellow-500">
              {item.categoryId}: ${item.amount.toFixed(2)} (+{item.percentageIncrease}%)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

