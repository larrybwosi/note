import { ScrollView, View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, AlertTriangle, DollarSign, PieChart } from 'lucide-react-native';
import { BudgetRuleType, CategoryType } from 'src/store/finance/types';
import { Progress } from 'src/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card';
import { BudgetRuleTypeSchema } from 'src/store/finance/src/types';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  type: CategoryType;
  isSelected: boolean;
}

interface Step4ReviewProps {
  currentBalance: string;
  monthlyIncome: string;
  selectedRule: BudgetRuleType;
  categories: Category[];
}

const Step4Review: React.FC<Step4ReviewProps> = ({
  currentBalance,
  monthlyIncome,
  selectedRule,
  categories
}) => {
  const selectedCategories = categories.filter(cat => cat.isSelected);
  const incomeCategories = selectedCategories.filter(cat => cat.type === 'income');
  const expenseCategories = selectedCategories.filter(cat => cat.type === 'expense');

  const getBudgetRuleDescription = (rule: BudgetRuleType) => {
    switch (rule) {
      case BudgetRuleTypeSchema.enum['50/30/20']:
        return "50% needs, 30% wants, 20% savings";
      case BudgetRuleTypeSchema.enum['70/20/10']:
        return "70% expenses, 20% savings, 10% debt/donation";
      case BudgetRuleTypeSchema.enum['15/65/20']:
        return "15% wants, 65% needs, 20% savings";
      case BudgetRuleTypeSchema.enum.CUSTOM:
        return "Custom allocation";
      default:
        return "Unknown rule";
    }
  };

  return (
    <ScrollView className="flex-1">
      <Animated.View
        entering={FadeInDown.duration(600)}
        className="space-y-6 "
      >
        <Card className='bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2' >
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Review your financial setup before finalizing</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <DollarSign color="#10B981" size={20} />
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Balance</Text>
                </View>
                <Text className="text-lg font-bold text-green-500">${currentBalance}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center space-x-2">
                  <DollarSign color="#3B82F6" size={20} />
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Income</Text>
                </View>
                <Text className="text-lg font-bold text-blue-500">${monthlyIncome || 'Not provided'}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card  className='bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2'>
          <CardHeader>
            <CardTitle>Budget Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              <View className="flex-row items-center space-x-2">
                <PieChart color="#8B5CF6" size={20} />
                <Text className="text-lg font-semibold text-purple-500">{selectedRule}</Text>
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">{getBudgetRuleDescription(selectedRule)}</Text>
              {selectedRule === BudgetRuleTypeSchema.enum['50/30/20'] && (
                <View className="space-y-2 mt-4">
                  <Progress value={50} max={100} label="Needs" color="#3B82F6" showPercentage />
                  <Progress value={30} max={100} label="Wants" color="#10B981" showPercentage />
                  <Progress value={20} max={100} label="Savings" color="#F59E0B" showPercentage />
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2'>
          <CardHeader>
            <CardTitle>Selected Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-4">
              <View>
                <Text className="text-lg font-semibold text-green-600 mb-2">Income Categories</Text>
                {incomeCategories.map((category, index) => (
                  <View key={index} className="flex-row items-center space-x-2 mb-1">
                    <Check color="#10B981" size={16} />
                    <Text className="text-sm text-gray-700 dark:text-gray-300">{category.name}</Text>
                  </View>
                ))}
              </View>
              <View>
                <Text className="text-lg font-semibold text-red-600 mb-2">Expense Categories</Text>
                {expenseCategories.map((category, index) => (
                  <View key={index} className="flex-row items-center space-x-2 mb-1">
                    <Check color="#EF4444" size={16} />
                    <Text className="text-sm text-gray-700 dark:text-gray-300">{category.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className='bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2'>
          <CardHeader>
            <CardTitle>
              <View className="flex-row items-center space-x-2">
                <AlertTriangle color="#F59E0B" size={20} />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">Important Notes</Text>
              </View>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <Text className="text-sm text-gray-600 dark:text-gray-400">• You can adjust these settings at any time from your profile.</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">• Make sure to regularly update your income and expenses for accurate budgeting.</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">• Consider setting up automatic savings transfers to meet your financial goals.</Text>
            </View>
          </CardContent>
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

export default Step4Review;

