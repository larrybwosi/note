import { Observable, observable } from '@legendapp/state';
import {
  CategoryId,
  TransactionId,
  CurrencyAmount,
  Percentage,
  Category,
  Transaction,
  FinanceStore,
  TransactionType,
  CategorySchema,
  TransactionSchema,
  FinanceStoreSchema,
  CategoryBudgetState,
  IncomeCategory,
  ExpenseCategory,
  CategoryGroup,
  BudgetRuleType
} from './types';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

// Type Guards and Validation
export const isCurrencyAmount = (amount: number): amount is CurrencyAmount => 
  amount >= 0;

export const isPercentage = (value: number): value is Percentage => 
  value >= 0 && value <= 100;

// Safe Type Conversions
export const toCurrencyAmount = (amount: number): CurrencyAmount => {
  if (!isCurrencyAmount(amount)) {
    throw new Error('Invalid currency amount: must be non-negative');
  }
  return amount as CurrencyAmount;
};

const randomId =()=> Math.random()
export const toPercentage = (value: number): Percentage => {
  if (!isPercentage(value)) {
    throw new Error('Invalid percentage: must be between 0 and 100');
  }
  return value as Percentage;
};

// Store Operations

// Category Operations
export const createCategory = (
  store: FinanceStore,
  categoryData: Omit<Category, 'id' | 'isCustom'>
): [FinanceStore, Category] => {
  const id = `cat_${randomId()}` as CategoryId;
  const category = CategorySchema.parse({
    ...categoryData,
    id,
    isCustom: true
  });

  return [{
    ...store,
    categories: {
      ...store.categories,
      [id]: category
    }
  }, category];
};

export const updateCategory = (
  store: FinanceStore,
  categoryId: CategoryId,
  updates: Partial<Omit<Category, 'id' | 'type'>>
): [FinanceStore, Category] => {
  const existingCategory = store.categories[categoryId];
  if (!existingCategory) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  const updatedCategory = CategorySchema.parse({
    ...existingCategory,
    ...updates
  });

  return [{
    ...store,
    categories: {
      ...store.categories,
      [categoryId]: updatedCategory
    }
  }, updatedCategory];
};

export const deleteCategory = (
  store: FinanceStore,
  categoryId: CategoryId
): FinanceStore => {
  const hasTransactions = Object.values(store.transactions)
    .some(t => t.categoryId === categoryId);

  if (hasTransactions) {
    throw new Error('Cannot delete category with existing transactions');
  }

  const { [categoryId]: _, ...remainingCategories } = store.categories;
  return {
    ...store,
    categories: remainingCategories
  };
};

// Transaction Operations
export const createTransaction = (
  store: FinanceStore,
  transactionData: Omit<Transaction, 'id'>
): [FinanceStore, Transaction] => {
  const id = `txn_${randomId()}` as TransactionId;
  const transaction = TransactionSchema.parse({
    ...transactionData,
    id
  });

  const updatedStore = updateBudgetForTransaction(store, transaction);

  return [{
    ...updatedStore,
    transactions: {
      ...updatedStore.transactions,
      [id]: transaction
    }
  }, transaction];
};

export const updateTransaction = (
  store: FinanceStore,
  transactionId: TransactionId,
  updates: Partial<Omit<Transaction, 'id' | 'type'>>
): [FinanceStore, Transaction] => {
  const existingTransaction = store.transactions[transactionId];
  if (!existingTransaction) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  // First, reverse the effect of the old transaction
  let updatedStore = reverseBudgetForTransaction(store, existingTransaction);

  const updatedTransaction = TransactionSchema.parse({
    ...existingTransaction,
    ...updates
  });

  // Then apply the new transaction
  updatedStore = updateBudgetForTransaction(updatedStore, updatedTransaction);

  return [{
    ...updatedStore,
    transactions: {
      ...updatedStore.transactions,
      [transactionId]: updatedTransaction
    }
  }, updatedTransaction];
};

export const deleteTransaction = (
  store: FinanceStore,
  transactionId: TransactionId
): FinanceStore => {
  const transaction = store.transactions[transactionId];
  if (!transaction) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  const updatedStore = reverseBudgetForTransaction(store, transaction);
  const { [transactionId]: _, ...remainingTransactions } = updatedStore.transactions;

  return {
    ...updatedStore,
    transactions: remainingTransactions
  };
};

// Budget Operations
export const setBudget = (
  store: FinanceStore,
  categoryId: CategoryId,
  amount: CurrencyAmount
): [FinanceStore, CategoryBudgetState] => {
  const category = store.categories[categoryId];
  if (!category) {
    throw new Error(`Category not found: ${categoryId}`);
  }

  if (category.type === TransactionType.INCOME) {
    throw new Error('Cannot set budget for income categories');
  }

  const spent = calculateCategorySpent(store, categoryId);
  const budget: CategoryBudgetState = {
    categoryId,
    amount,
    spent,
    remaining: toCurrencyAmount(Number(amount) - Number(spent))
  };

  return [{
    ...store,
    budgets: {
      ...store.budgets,
      [categoryId]: budget
    }
  }, budget];
};

// Analytics Operations
export const calculateCategoryTotals = (
  store: FinanceStore,
  type: TransactionType
): Record<CategoryId, CurrencyAmount> => {
  const totals: Record<string, number> = {};

  Object.values(store.transactions)
    .filter(t => t.type === type)
    .forEach(transaction => {
      const current = totals[transaction.categoryId] || 0;
      totals[transaction.categoryId] = current + Number(transaction.amount);
    });

  return Object.entries(totals).reduce((acc, [categoryId, amount]) => ({
    ...acc,
    [categoryId]: toCurrencyAmount(amount)
  }), {});
};

export const calculateSavingsRate = (store: FinanceStore): Percentage => {
  const totalIncome = Object.values(store.transactions)
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = Object.values(store.transactions)
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (totalIncome === 0) return toPercentage(0);

  const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
  return toPercentage(Math.max(0, Math.min(100, savingsRate)));
};

export const calculateMonthlyTrend = (
  store: FinanceStore,
  type: TransactionType,
  months: number = 12
): CurrencyAmount[] => {
  const now = new Date();
  const trend: CurrencyAmount[] = [];

  for (let i = 0; i < months; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthTotal = Object.values(store.transactions)
      .filter(t => 
        t.type === type &&
        t.date >= monthStart &&
        t.date <= monthEnd
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    trend.unshift(toCurrencyAmount(monthTotal));
  }

  return trend;
};

// Helper Functions
const calculateCategorySpent = (
  store: FinanceStore,
  categoryId: CategoryId
): CurrencyAmount => {
  const spent = Object.values(store.transactions)
    .filter(t => 
      t.type === TransactionType.EXPENSE && 
      t.categoryId === categoryId
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return toCurrencyAmount(spent);
};

const updateBudgetForTransaction = (
  store: FinanceStore,
  transaction: Transaction
): FinanceStore => {
  if (transaction.type !== TransactionType.EXPENSE) return store;

  const budget = store.budgets[transaction.categoryId];
  if (!budget) return store;

  return {
    ...store,
    budgets: {
      ...store.budgets,
      [transaction.categoryId]: {
        ...budget,
        spent: toCurrencyAmount(Number(budget.spent) + Number(transaction.amount)),
        remaining: toCurrencyAmount(Number(budget.amount) - (Number(budget.spent) + Number(transaction.amount)))
      }
    }
  };
};

const reverseBudgetForTransaction = (
  store: FinanceStore,
  transaction: Transaction
): FinanceStore => {
  if (transaction.type !== TransactionType.EXPENSE) return store;

  const budget = store.budgets[transaction.categoryId];
  if (!budget) return store;

  return {
    ...store,
    budgets: {
      ...store.budgets,
      [transaction.categoryId]: {
        ...budget,
        spent: toCurrencyAmount(Number(budget.spent) - Number(transaction.amount)),
        remaining: toCurrencyAmount(Number(budget.amount) - (Number(budget.spent) - Number(transaction.amount)))
      }
    }
  };
};

// Export/Import Operations
export const exportStore = (store: FinanceStore): string => {
  return JSON.stringify(store, null, 2);
};

export const importStore = (data: string): FinanceStore => {
  const parsed = JSON.parse(data);
  return FinanceStoreSchema.parse(parsed);
};