import { observer } from "@legendapp/state/react";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp } from "lucide-react-native";
import { colorScheme } from "nativewind";
import { View, Text } from 'react-native';
import Animated, { BounceIn, FadeIn, LinearTransition } from "react-native-reanimated";
import useFinanceStore from "src/store/actions";

const InsightCard = observer(({ title, value, trend, color }: { 
  title: string;
  value: string;
  trend: number;
  color: string;
}) => {
  return (
    <Animated.View
      entering={BounceIn.duration(1000)}
      layout={LinearTransition.springify()}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
    >
      <Text className="text-sm font-rmedium text-gray-500 dark:text-gray-400">{title}</Text>
      <Text className={`text-xl font-rbold mt-1 ${color}`}>{value}</Text>
      <View className="flex-row items-center mt-2">
        <TrendingUp size={16} color={trend >= 0 ? '#10B981' : '#EF4444'} />
        <Text className={`ml-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'} font-rmedium`}>
          {Math.abs(trend)}%
        </Text>
      </View>
    </Animated.View>
  );
}); 

const FinanceSummary = observer(() => {
  const { getTotalIncome, getTotalExpenses, getGuiltFreeBalance } = useFinanceStore();
  
  const guiltFreeBalance = getGuiltFreeBalance();
  const totalExpenses = getTotalExpenses();
  const totalIncome = getTotalIncome();
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);
  const monthlyChange = ((guiltFreeBalance / totalIncome) * 100).toFixed(1);

  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(300)}
      layout={LinearTransition.springify()}
      className="mt-4 rounded-2xl overflow-hidden shadow-lg"
    >
      <LinearGradient
        colors={colorScheme.get() === 'dark' 
          ? ['#1F2937', '#111827']
          : ['#ffffff', '#f9fafb']}
        className="p-5"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
              ${(totalIncome - totalExpenses).toLocaleString()}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular mt-1">
              Net Balance
            </Text>
          </View>
          <View className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full">
            <Text className="text-blue-600 dark:text-blue-200 font-rmedium">
              {savingsRate}% Saved
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-4 gap-2 mb-6">
          <InsightCard
            title="Monthly Income"
            value={`$${totalIncome.toLocaleString()}`}
            trend={12.5}
            color="text-green-500"
          />
          <InsightCard
            title="Monthly Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            trend={-8.3}
            color="text-red-500"
          />
        </View>
        
        <View className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-rmedium text-gray-700 dark:text-gray-300">
              Guilt-Free Balance
            </Text>
            <View className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
              <Text className="text-green-600 dark:text-green-400 text-sm font-rmedium">
                +{monthlyChange}%
              </Text>
            </View>
          </View>
          <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
            ${guiltFreeBalance.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

export default FinanceSummary;