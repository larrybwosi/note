import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { observer, useObservable } from '@legendapp/state/react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, interpolateColor } from 'react-native-reanimated';
import { router } from 'expo-router';
import { z } from 'zod';

import { BudgetRuleType, Category, CategoryType } from 'src/store/finance/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from 'src/store/finance/data';
import { FinanceSetupFormData, financeSetupSchema } from 'src/components/fin/setup/schema';
import { AnimatedTitle, NavigationButtons } from 'src/components/fin/setup/custom';
import Step1FinancialInfo from 'src/components/fin/setup/step1';
import Step2BudgetRule from 'src/components/fin/setup/step2';
import Step3Categories from 'src/components/fin/setup/step3';
import Step4Review from 'src/components/fin/setup/step4';
import { useModal } from 'src/components/modals/provider';
import { BudgetRuleTypeSchema } from 'src/store/finance/src/types';

const rules = [
  {
    type: BudgetRuleTypeSchema.enum['50/30/20'],
    description: 'Balanced approach for stable income',
    breakdown: '50% needs, 30% wants, 20% savings',
    color: '#3B82F6',
  },
  {
    type: BudgetRuleTypeSchema.enum['70/20/10'],
    description: 'Conservative approach for debt management',
    breakdown: '70% expenses, 20% savings, 10% debt/donation',
    color: '#10B981',
  },
  {
    type: BudgetRuleTypeSchema.enum['15/65/20'],
    description: 'High savings with controlled spending',
    breakdown: '15% wants, 65% needs, 20% savings',
    color: '#8B5CF6',
  },
  {
    type: BudgetRuleTypeSchema.enum['CUSTOM'],
    description: 'Personalized allocation based on your goals',
    breakdown: 'Set your own percentages',
    color: '#F59E0B',
  },
];

const FinanceSetup: React.FC = () => {
  const progressValue = useSharedValue(0);
  const{ show }=useModal()

  const state$ = useObservable<FinanceSetupFormData & { step: number; activeTab: CategoryType }>({
    step: 1,
    currentBalance: '',
    monthlyIncome: '0',
    selectedRule: BudgetRuleTypeSchema.enum['50/30/20'],
    activeTab: 'INCOME' as CategoryType,
    categories: [
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
    ],
  });

  const errors$ = useObservable<Partial<Record<keyof FinanceSetupFormData, string>>>({});

  const state = state$.get()
  const errors =errors$.get()
  useEffect(() => {
    progressValue.value = withSpring((state$.step.get() - 1) / 3);
  }, [state$.step.get()]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
    backgroundColor: interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      ['#3B82F6', '#8B5CF6', '#10B981']
    ),
  }));

  const handleTabPress = (type: CategoryType) => {
    state$.activeTab.set(type);
  };

  const toggleCategory = (id: string) => {
    state$.categories.set((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isSelected: !cat.isSelected } : cat))
    );
  };

  const validateStep = (): boolean => {
    try {
      switch (state$.step.get()) {
        case 1:
          financeSetupSchema.pick({ currentBalance: true, monthlyIncome: true }).parse(state$.get());
          break;
        case 2:
          financeSetupSchema.pick({ selectedRule: true }).parse(state$.get());
          break;
        case 3:
          financeSetupSchema.pick({ categories: true }).parse(state$.get());
          break;
      }
      errors$.set({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          console.warn(err)
          // newErrors[err.path[0]] = err.message;
        });
        errors$.set(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      state$.step.set((prev) => Math.min(4, prev + 1));
    }
  };

  const handleSubmit = () => {
    if (validateStep()) {
      const formData = state;
      // store.budgetConfig.monthlyIncome.set(parseFloat(formData.monthlyIncome || '0'));
      // store.budgetConfig.rule.set(formData.selectedRule);
      // store.budgetConfig.categories.set(formData.categories.filter(cat => cat.isSelected));
      console.log('Setup completed:', formData);
      // formData.categories= formData.categories.map((cat)=>cat.id)
      // console.log(formData)
      // router.back();
    }
  };

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <Step1FinancialInfo
            currentBalance={state.currentBalance}
            setCurrentBalance={state$.currentBalance.set}
            monthlyIncome={state.monthlyIncome}
            setMonthlyIncome={state$.monthlyIncome.set}
            errors={errors$.get()}
          />
        );
      case 2:
        return (
          <Step2BudgetRule
            rules={rules}
            selectedRule={state.selectedRule}
            setSelectedRule={state$.selectedRule.set}
          />
        );
      case 3:
        return (
          <Step3Categories
            categories={state.categories}
            activeTab={state.activeTab}
            handleTabPress={handleTabPress}
            toggleCategory={toggleCategory}
            showNewCategoryModal={()=>show('NewCategory',{type:"INCOME"})}
            error={errors.categories}
          />
        );
      case 4:
        return (
          <Step4Review
            currentBalance={state.currentBalance}
            monthlyIncome={state.monthlyIncome}
            selectedRule={state.selectedRule}
            categories={state.categories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <AnimatedTitle
            title="Finance Setup"
            subtitle="Let's set up your personalized budget plan"
          />

          {/* Progress Bar */}
          <View className="mb-8">
            <View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              <Animated.View
                className="h-1 rounded-full bg-blue-500 dark:bg-blue-400"
                style={progressBarStyle}
              />
            </View>
          </View>

          {renderStep()}

          <NavigationButtons
            step={state.step}
            onPrevious={() => state$.step.set((prev) => Math.max(1, prev - 1))}
            onNext={handleNext}
            onComplete={handleSubmit}
            isNextDisabled={Object.keys(errors).length > 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default observer(FinanceSetup);

