import { Observable, observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { CurrencyAmount, FinanceStore, BudgetRuleType, Percentage } from '../types';

export const createStore = (): Observable<FinanceStore> => {
  const defaultStore: FinanceStore = {
    categories: {},
    transactions: {},
    budgets: {},
    insights: {
      income: {
        total: 0 as CurrencyAmount,
        byCategory: {},
        trend: [],
      },
      expenses: {
        total: 0 as CurrencyAmount,
        byCategory: {},
        trend: [],
      },
      savings: {
        total: 0 as CurrencyAmount,
        rate: 0 as Percentage,  
        trend: [],
      },
    },
    settings: {
      currency: 'USD',
      timezone: 'UTC',
      budgetRule: BudgetRuleType.FIFTY_THIRTY_TWENTY,
      notifications: {
        enabled: true,
      },
    },
    metadata: {
      lastUpdated: new Date(),
      version: '1.0.0',
    },
    budgetRules: {
      active: BudgetRuleType.FIFTY_THIRTY_TWENTY,
      rules: {},
    },
    alerts: [],
    guiltFreeBalance: 0 as CurrencyAmount,
    categoryHealth: {},
  };

  const store = observable(
    synced<FinanceStore>({
      initial: defaultStore,
      persist: {
        name: 'finance',
        plugin: ObservablePersistMMKV,
      },
    })
  );
  return store;
};
