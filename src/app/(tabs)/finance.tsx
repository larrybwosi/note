import { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { observer, useObservable } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
  LinearTransition,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
  BudgetRuleType,
  EXPENSE_CATEGORIES,
  ExpenseCategoryId,
  INCOME_CATEGORIES,
  IncomeCategoryId,
} from 'src/store/finance/types';
import useFinanceStore from 'src/store/finance/actions';
import { useColorScheme } from 'nativewind';
import BudgetRuleSelector from 'src/components/budget.rule';

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

type CategoryType = 'INCOME' | 'EXPENSE';

interface Category {
  id: string;
  icon: string;
  name: string;
  description?: string;
  type: CategoryType;
  isSelected: boolean;
}
const FinanceSetup: React.FC = () => {
  const { store } = useFinanceStore();
  const progressValue = useSharedValue(0);
  const isDarkMode = useColorScheme().colorScheme === 'dark';
  const showNewCategoryModal$ = useObservable(false);

  const Pressable = Animated.createAnimatedComponent(TouchableOpacity);

  const state$ = useObservable({
    step: 1,
    selectedRule: BudgetRuleType.RULE_50_30_20,
    activeTab: 'INCOME' as CategoryType,
    monthlyIncome: '0',
    customRules: [
      {
        categoryId: 'needs',
        label: 'Essential Needs',
        percentage: 50,
        color: '#EF4444',
        description: 'Rent, utilities, groceries, etc.',
      },
      {
        categoryId: 'wants',
        label: 'Personal Wants',
        percentage: 30,
        color: '#3B82F6',
        description: 'Entertainment, dining out, hobbies',
      },
      {
        categoryId: 'savings',
        label: 'Savings & Investments',
        percentage: 20,
        color: '#10B981',
        description: 'Emergency fund, retirement, goals',
      },
    ],
  });

  const step = state$.step.get();
  const setStep = state$.step.set;
  const selectedRule = state$.selectedRule.get();
  const setSelectedRule = state$.selectedRule.set;
  const monthlyIncome = state$.monthlyIncome.get();
  const setMonthlyIncome = state$.monthlyIncome.set;

  // Add this to your component's state
  const categories$ = useObservable<Category[]>([
    ...Object.entries(INCOME_CATEGORIES).map(([key, value]) => ({
      id: key,
      icon: value.icon,
      name: key
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' '),
      description: value.description,
      type: 'INCOME' as CategoryType,
      isSelected: true,
    })),
    ...Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => ({
      id: key,
      icon: value.icon,
      name: key
        .split('_')
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' '),
      description: value.description,
      type: 'EXPENSE' as CategoryType,
      isSelected: true,
    })),
  ]);

  const categories = categories$.get();
  const setCategories = categories$.set;

  const newCategory$ = useObservable({
    name: '',
    type: 'INCOME' as CategoryType,
  });

  const newCategory = newCategory$.get();
  const setNewCategory = newCategory$.set;
  const activeTab = state$.activeTab.get();

  const handleSubmit = () => {
    const newCategories = categories
      .map((category) => {
        if (category.isSelected) {
          return {
            id: category.id,
            icon: category.icon,
            name: category.name,
            type: category.type,
            isSelected: false,
          };
        }
        return undefined;
      })
      .filter(Boolean);

    console.log(newCategories);

    store.budgetConfig.monthlyIncome.set(parseFloat(monthlyIncome));
    store.budgetConfig.rule.set(selectedRule);
  };

  // Add these helper functions
  const toggleCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isSelected: !cat.isSelected } : cat))
    );
  }, []);

  const addNewCategory = useCallback(() => {
    if (newCategory.name.trim()) {
      setCategories((prev) => [
        ...prev,
        {
          id: activeTab === 'INCOME' ? IncomeCategoryId.CUSTOM : ExpenseCategoryId.CUSTOM,
          icon: activeTab === 'INCOME' ? '💰' : '📦',
          name: newCategory.name,
          type: activeTab,
          isSelected: true,
        },
      ]);
      setNewCategory({ name: '', type: 'EXPENSE' });
      showNewCategoryModal$.set(false);
    }
  }, [newCategory]);

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

  const handleTabPress = async (type: CategoryType) => {
    state$.activeTab.set(type);
  };

  const renderCategoryTabs = () => (
    <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
      {['INCOME', 'EXPENSE'].map((type) => (
        <Pressable
          key={type}
          onPress={() => handleTabPress(type as CategoryType)}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor:
              activeTab === type
                ? isDarkMode
                  ? '#E2E8F0'
                  : '#FFFFFF'
                : isDarkMode
                  ? '#FFFFFF'
                  : '#E2E8F0',
            shadowColor: activeTab === type ? '#000000' : undefined,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={type === 'INCOME' ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={24}
            color={activeTab === type ? '#3B82F6' : '#6B7280'}
          />
          <Text
            className="font-rmedium ml-2"
            style={{
              textAlign: 'center',
              color: activeTab === type ? '#3B82F6' : '#6B7280',
              fontWeight: 'bold',
            }}
          >
            {type}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderCategories = () => (
    <ScrollView className="space-y-4">
      {categories
        .filter((cat) => cat.type === activeTab)
        .map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInDown.delay(index * 100)}
            className="rounded-xl shadow-sm"
          >
            <TouchableOpacity
              onPress={() => toggleCategory(category.id)}
              className="p-4 flex-row items-center space-x-4"
            >
              <Text className="text-2xl">{category.icon}</Text>
              <View className="flex-1 ml-4">
                <Text className="text-lg font-rbold text-gray-900 dark:text-white">
                  {category.name}
                </Text>
                <Text className="text-sm font-rregular text-gray-600">{category.description}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center`}
                style={{
                  borderColor: category.isSelected ? '#3b82f6' : '#d1d5db',
                  backgroundColor: category.isSelected ? '#3b82f6' : 'white',
                }}
              >
                {category.isSelected && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
    </ScrollView>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View
            entering={FadeInDown.duration(600)}
            exiting={FadeOutUp.duration(400)}
            layout={LinearTransition.springify()}
            className="space-y-8 dark:bg-gray-900 dark:border-gray-800 bg-gray-50 border-gray-100 rounded-xl"
          >
            <View className="space-y-4">
              <Animated.Text
                entering={FadeInDown.delay(200).duration(600)}
                className="text-3xl font-rbold text-gray-900 dark:text-white"
              >
                Let's Start with Your Income
              </Animated.Text>
              <Animated.Text
                entering={FadeInDown.delay(400).duration(600)}
                className="text-sm text-gray-600 leading-relaxed font-rmedium mt-4 dark:text-gray-400"
              >
                Your monthly income is the foundation of your budget. Enter the amount you typically
                receive after taxes each month. This helps us tailor your budget to your specific
                financial situation (You can always change this later).
              </Animated.Text>
            </View>

            <Animated.View
              className="bg-white dark:bg-gray-800 mt-5 mb-3"
              entering={FadeInDown.delay(600).duration(800)}
            >
              <View className="space-y-6">
                <View>
                  <Text className="text-lg font-rmedium text-gray-700 mb-2 mt-2 dark:text-white">
                    Monthly Income After Taxes
                  </Text>
                  <View className="flex-row items-center bg-gray-100 rounded-xl p-3 dark:bg-gray-700">
                    <Text className="text-2xl font-bold text-blue-500 mr-2">$</Text>
                    <TextInput
                      className="flex-1 text-4xl font-bold text-gray-900 "
                      value={monthlyIncome}
                      onChangeText={setMonthlyIncome}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#A0AEC0"
                      accessibilityLabel="Enter your monthly income"
                    />
                  </View>
                </View>
                <View className="bg-blue-50 rounded-xl p-4 dark:bg-gray-800">
                  <Text className="text-xs text-blue-700 leading-relaxed font-aregular">
                    Tip: Include all sources of regular income, such as salary, freelance work, or
                    rental income. For irregular income, use an average of the past few months.
                  </Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(600)}
              className="flex-row justify-between items-center bg-gray-100 rounded-xl p-4 dark:bg-gray-700"
            >
              <Text className="text-base font-aregular text-gray-700 dark:text-white">
                Your Monthly Income:
              </Text>
              <Text className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyIncome)}
              </Text>
            </Animated.View>
          </Animated.View>
        );

      case 2:
        return <BudgetRuleSelector rules={rules} />;

      case 3:
        return (
          <Animated.View
            entering={FadeInDown}
            exiting={FadeOutUp}
            layout={LinearTransition.springify()}
            className="space-y-6"
          >
            <View>
              <Text className="text-2xl font-rbold text-gray-900 mb-2">Customize Categories</Text>
              <Text className="text-base font-rmedium text-gray-600">
                Select the categories you want to track in your budget
              </Text>
            </View>

            {renderCategoryTabs()}
            {renderCategories()}

            {/* Add New Category Button */}
            <TouchableOpacity
              onPress={() => showNewCategoryModal$.set(true)}
              className="flex-row items-center justify-center bg-gray-100 rounded-xl p-4 mt-4"
            >
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
              <Text className="ml-2 text-blue-500 font-rmedium">Add Custom Category</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Animated.Text
            entering={FadeInDown.delay(100)}
            className="text-3xl font-rbold text-gray-900 dark:text-gray-100 text-center"
          >
            Finance Setup
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(200)}
            className="text-sm font-aregular text-gray-600 dark:text-gray-400 text-center mt-2 mb-8"
          >
            Let's set up your personalized budget plan
          </Animated.Text>

          {/* Progress Bar Section */}
          <View className="mb-8">
            <View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              <Animated.View
                className="h-1 rounded-full bg-blue-500 dark:bg-blue-400"
                style={progressBarStyle}
              />
            </View>

            {/* Step Indicators */}
            <View className="flex-row justify-between px-4">
              {[1, 2, 3].map((stepNumber) => (
                <Animated.View
                  key={stepNumber}
                  entering={FadeInDown.delay(stepNumber * 100)}
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    step >= stepNumber
                      ? 'bg-blue-500 dark:bg-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      step >= stepNumber
                        ? 'text-white dark:text-gray-900'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stepNumber}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {renderStep()}

          {/* Navigation Buttons */}
          <View className="flex-row justify-between items-center mt-8 mb-4">
            {step > 1 && (
              <Pressable
                entering={FadeInDown.delay(400)}
                className="flex-row items-center py-3 px-4"
                onPress={() => setStep(step - 1)}
              >
                <Ionicons name="arrow-back" size={24} color={'#9CA3AF'} />
                <Text className="ml-2 text-base font-plregular text-gray-600 dark:text-gray-400">
                  Previous
                </Text>
              </Pressable>
            )}

            {step < 3 ? (
              <Pressable
                entering={FadeInDown.delay(400)}
                className="flex-row items-center bg-blue-500 dark:bg-blue-400 py-3 px-6 rounded-full ml-auto"
                onPress={() => setStep(step + 1)}
              >
                <Text className="text-base font-plregular text-white dark:text-gray-900 mr-2">
                  Next
                </Text>
                <Ionicons name="arrow-forward" size={24} color={'#111827'} />
              </Pressable>
            ) : (
              <Pressable
                className="flex-row items-center bg-green-500 dark:bg-green-400 py-3 px-6 rounded-full ml-auto shadow-lg shadow-green-500/20 dark:shadow-green-400/20"
                onPress={() => handleSubmit()}
              >
                <Text className="text-base font-plregular text-white dark:text-gray-900 mr-2">
                  Complete Setup
                </Text>
                <Ionicons name="checkmark-circle" size={24} color={'#111827'} />
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(FinanceSetup);
