import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { FinanceStore, FinanceStoreSchema, BudgetRuleTypeSchema } from '../types';

const initial: FinanceStore = {
  isSetUp: false,
  profile: undefined,
  transactions: {},
  budgetConfig: {
    rule: BudgetRuleTypeSchema.enum['50/30/20'],
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
  categories: {},
  metadata: {
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    currency: 'USD',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

export const validateFinanceStore = () => {
  try {
    FinanceStoreSchema.parse(store.get());
    return true;
  } catch (error) {
    console.error('Finance store validation failed:', error);
    return false;
  }
};

