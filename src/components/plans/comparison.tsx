import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Check, X } from 'lucide-react-native';

interface ComparisonTableProps {
  plans: Array<{
    name: string;
    features: string[];
  }>;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ plans }) => {
  const allFeatures = Array.from(
    new Set(plans.flatMap(plan => plan.features))
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View className="flex-row">
          <View className="w-40 p-2 bg-gray-100 dark:bg-gray-800">
            <Text className="font-rbold text-gray-900 dark:text-white">Feature</Text>
          </View>
          {plans.map(plan => (
            <View key={plan.name} className="w-32 p-2 bg-gray-100 dark:bg-gray-800">
              <Text className="font-rbold text-gray-900 dark:text-white">{plan.name}</Text>
            </View
>
          ))}
        </View>
        {allFeatures.map((feature, index) => (
          <View key={feature} className="flex-row">
            <View className={`w-40 p-2 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <Text className="text-gray-700 dark:text-gray-300">{feature}</Text>
            </View>
            {plans.map(plan => (
              <View key={plan.name} className={`w-32 p-2 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                {plan.features.includes(feature) ? (
                  <Check size={20} color="#10B981" />
                ) : (
                  <X size={20} color="#EF4444" />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

