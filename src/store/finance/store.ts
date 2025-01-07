import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { FinanceStore } from './types';
import { BudgetRuleTypeSchema } from './src/types';

  const initial: FinanceStore = {
    isSetUP: false,
    transactions: {},
    categories: {},
    customCategories: [],
    budgetConfig: {
      rule: BudgetRuleTypeSchema.enum['50/30/20'],
      monthlyIncome: 0,
      savingsGoals: {}
    },
    insights: {
      guiltFreeBalance: 0,
      monthlySpendingByCategory: {},
      savingsProgress: {},
      projectedSavings: 0,
      unusualSpending: [],
      trends: {
        monthly: {},
        categoryTrends: {},
      },
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      incomeCategories: ['salary', 'investments', 'freelance', 'other'],
      expenseCategories: ['housing', 'transportation', 'food', 'utilities', 'entertainment', 'healthcare'],
    },
  };

 export const store = observable(
    synced<FinanceStore>({
      initial,
      persist: {
        name: 'finance',
        plugin: ObservablePersistMMKV,
      },
    })
  );
