import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { BudgetRuleType, CategoryType, FinanceStore } from './types';

const financeStore = () => {
  const initial: FinanceStore = {
    transactions: {},
    categories: [],
    customCategories: [],
    budgetConfig: {
      rule: BudgetRuleType.RULE_50_30_20,
      monthlyIncome: 0,
      savingsGoals: {},
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
    alerts: {
      categoryOverspend: [],
      upcomingBills: [],
      savingsGoalProgress: {},
      unusualTransactions: [],
      upcomingRecurringTransactions: [],
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const store = observable(
    synced<FinanceStore>({
      initial,
      persist: {
        name: 'finance',
        plugin: ObservablePersistMMKV,
      },
    })
  );

  return {
    store,
  };
};

export default financeStore;
