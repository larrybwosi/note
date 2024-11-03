import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Slider from 'src/components/ui/slider';
import useFinanceStore, { BudgetRuleType } from 'src/finance/unified';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Rule {
  type: BudgetRuleType;
  description: string;
  breakdown: string;
  color: string;
}

const rules: Rule[] = [
  {
    type: BudgetRuleType.RULE_50_30_20,
    description: 'Balanced approach for stable income',
    breakdown: '50% needs, 30% wants, 20% savings',
    color: '#3B82F6',
  },
  {
    type: BudgetRuleType.RULE_70_20_10,
    description: 'Conservative approach for debt management',
    breakdown: '70% expenses, 20% savings, 10% debt/donation',
    color: '#10B981',
  },
  {
    type: BudgetRuleType.RULE_15_65_20,
    description: 'High savings with controlled spending',
    breakdown: '15% wants, 65% needs, 20% savings',
    color: '#8B5CF6',
  },
  {
    type: BudgetRuleType.CUSTOM,
    description: 'Personalized allocation based on your goals',
    breakdown: 'Set your own percentages',
    color: '#F59E0B',
  },
];

interface CustomRule {
  categoryId: string;
  label: string;
  percentage: number;
  color: string;
  description: string;
}

const EnhancedFinanceSetupScreen: React.FC = () => {
  const { store, calculateBudgetAllocations } = useFinanceStore();
  const [monthlyIncome, setMonthlyIncome] = useState('0');
  const [selectedRule, setSelectedRule] = useState<BudgetRuleType>(BudgetRuleType.RULE_50_30_20);
  const [step, setStep] = useState(1);
  const progressValue = useSharedValue(0);
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)
  const [customRules, setCustomRules] = useState<CustomRule[]>([
    { categoryId: 'needs', label: 'Essential Needs', percentage: 50, color: '#EF4444', description: 'Rent, utilities, groceries, etc.' },
    { categoryId: 'wants', label: 'Personal Wants', percentage: 30, color: '#3B82F6', description: 'Entertainment, dining out, hobbies' },
    { categoryId: 'savings', label: 'Savings & Investments', percentage: 20, color: '#10B981', description: 'Emergency fund, retirement, goals' },
  ]);

  useEffect(() => {
    progressValue.value = withSpring((step - 1) / 2);
  }, [step]);

  const formatCurrency = (value: string): string => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
    backgroundColor: interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      ['#3B82F6', '#8B5CF6', '#10B981']
    ),
  }));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View
            entering={FadeInDown.duration(600)}
            exiting={FadeOutUp.duration(400)}
            layout={ LinearTransition.springify()}
            className="space-y-8"
          >
            <View className="space-y-4">
              <Animated.Text 
                entering={FadeInDown.delay(200).duration(600)}
                className="text-3xl font-rbold text-gray-900"
              >
                Let's Start with Your Income
              </Animated.Text>
              <Animated.Text 
                entering={FadeInDown.delay(400).duration(600)}
                className="text-sm text-gray-600 leading-relaxed font-rmedium mt-4"
              >
                Your monthly income is the foundation of your budget. Enter the amount you typically receive after taxes each month. This helps us tailor your budget to your specific financial situation (You can always change this later).
              </Animated.Text>
            </View>

            <Animated.View 
              className="bg-white mt-5 mb-3"
              entering={FadeInDown.delay(600).duration(800)}
            >
              <View className="space-y-6">
                <View>
                  <Text className="text-lg font-rmedium text-gray-700 mb-2 mt-2">Monthly Income After Taxes</Text>
                  <View className="flex-row items-center bg-gray-100 rounded-xl p-4">
                    <Text className="text-2xl font-bold text-blue-500 mr-2">$</Text>
                    <TextInput
                      className="flex-1 text-4xl font-bold text-gray-900"
                      value={monthlyIncome}
                      onChangeText={setMonthlyIncome}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#A0AEC0"
                      accessibilityLabel="Enter your monthly income"
                    />
                  </View>
                </View>
                <View className="bg-blue-50 rounded-xl p-4">
                  <Text className="text-xs text-blue-700 leading-relaxed font-aregular">
                    Tip: Include all sources of regular income, such as salary, freelance work, or rental income. For irregular income, use an average of the past few months.
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(600)}
              className="flex-row justify-between items-center bg-gray-100 rounded-xl p-4"
            >
              <Text className="text-base font-aregular text-gray-700">Your Monthly Income:</Text>
              <Text className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyIncome)}</Text>
            </Animated.View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View
            entering={FadeInDown}
            exiting={FadeOutUp}
            layout={LinearTransition.springify()}
            className="space-y-6"
          >
            <View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">Budget Rule</Text>
              <Text className="text-base text-gray-600">
                Choose a budget rule that fits your financial goals
              </Text>
            </View>

            <View className="space-y-4">
              {rules.map((rule, index) => (
                <AnimatedTouchable
                  key={rule.type}
                  entering={FadeInDown.delay(index * 100)}
                    className={`bg-white rounded-2xl p-6 mt-4 shadow-md border-2 ${
                      selectedRule === rule.type ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onPress={() => setSelectedRule(rule.type)}
                >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 mb-1">{rule.type}</Text>
                        <Text className="text-base text-gray-600 mb-2">{rule.description}</Text>
                        <Text style={{ color: rule.color }} className="text-sm font-medium">
                          {rule.breakdown}
                        </Text>
                      </View>
                      {selectedRule === rule.type && (
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      )}
                    </View>
                </AnimatedTouchable>
              ))}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View
            entering={FadeInDown}
            exiting={FadeOutUp}
            layout={LinearTransition.springify()}
            className="space-y-6"
          >
            <View className='my-4'>
              <Text className="text-2xl font-bold text-gray-900 mb-2">Budget Allocation</Text>
              <Text className="text-base text-gray-600">
                Review and adjust your budget allocations
              </Text>
            </View>

            <View className="space-y-6">
              {customRules.map((rule, index) => (
                <Animated.View
                  key={rule.categoryId}
                  entering={FadeInDown.delay(index * 100)}
                  className="bg-white rounded-2xl p-6 shadow-md my-6"
                >
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 mb-1">{rule.label}</Text>
                      <Text className="text-sm text-gray-600">{rule.description}</Text>
                    </View>
                    <View className="items-end">
                      <Text style={{ color: rule.color }} className="text-xl font-bold">
                        {rule.percentage}%
                      </Text>
                      <Text className="text-base text-gray-600">
                        {formatCurrency((parseFloat(monthlyIncome) * rule.percentage / 100).toString())}
                      </Text>
                    </View>
                  </View>

                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    value={rule.percentage}
                    onValueChange={(value) =>
                      setCustomRules(
                        customRules.map((r) =>
                          r.categoryId === rule.categoryId
                            ? { ...r, percentage: value }
                            : r
                        )
                      )
                    }
                    minimumTrackTintColor={rule.color}
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor={rule.color}
                  />
                </Animated.View>
              ))}

              <Animated.View 
                entering={FadeInDown.delay(300)}
                className="bg-gray-50 rounded-xl p-4 flex-row justify-between items-center"
              >
                <Text className="text-base font-medium text-gray-700">Total Allocation</Text>
                <Text
                  className={`text-xl font-bold ${
                    customRules.reduce((sum, r) => sum + r.percentage, 0) === 100
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {customRules.reduce((sum, r) => sum + r.percentage, 0)}%
                </Text>
              </Animated.View>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <Animated.Text 
            entering={FadeInDown.delay(100)}
            className="text-3xl font-rbold text-gray-900 text-center"
          >
            Finance Setup
          </Animated.Text>
          <Animated.Text 
            entering={FadeInDown.delay(200)}
            className="text-sm font-aregular text-gray-600 text-center mt-2 mb-8"
          >
            Let's set up your personalized budget plan
          </Animated.Text>

          <View className="mb-8">
            <View className="h-1 bg-gray-200 rounded-full mb-4">
              <Animated.View className="h-1 rounded-full" style={progressBarStyle} />
            </View>
            <View className="flex-row justify-between px-4">
              {[1, 2, 3].map((stepNumber) => (
                <Animated.View
                  key={stepNumber}
                  entering={FadeInDown.delay(stepNumber * 100)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step >= stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      step >= stepNumber ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {renderStep()}

          <View className="flex-row justify-between items-center mt-8 mb-4">
            {step > 1 && (
              <AnimatedTouchableOpacity
                entering={FadeInDown.delay(400)}
                className="flex-row items-center py-3 px-4"
                onPress={() => setStep(step - 1)}
              >
                <Ionicons name="arrow-back" size={24} color="#6B7280" />
                <Text className="ml-2 text-base font-medium text-gray-600">Previous</Text>
              </AnimatedTouchableOpacity>
            )}

            {step < 3 ? (
              <AnimatedTouchableOpacity
                entering={FadeInDown.delay(400)}
                className="flex-row items-center bg-blue-500 py-3 px-6 rounded-full ml-auto"
                onPress={() => setStep(step + 1)}
              >
                <Text className="text-base font-rmedium text-white mr-2">Next</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
              </AnimatedTouchableOpacity>
            ) : (
              <AnimatedTouchableOpacity
                entering={FadeInDown.delay(400)}
                className="flex-row items-center bg-green-500 py-3 px-6 rounded-full ml-auto"
                onPress={() => {
                  store.budgetConfig.monthlyIncome.set(parseFloat(monthlyIncome));
                  store.budgetConfig.selectedRule.set(selectedRule);
                  store.budgetConfig.customRules.set(
                    customRules.map(({ categoryId, percentage }) => ({
                      categoryId,
                      percentage,
                    }))
                  );
                }}
              >
                <Text className="text-base font-medium text-white mr-2">Complete Setup</Text>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </AnimatedTouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    
    </SafeAreaView>
  );
};

export default EnhancedFinanceSetupScreen;