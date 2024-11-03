import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Category Interface
interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Transaction Status
export const TRANSACTION_STATUS = ['Pending', 'Completed', 'Failed', 'Cancelled'] as const;
export type TransactionStatus = typeof TRANSACTION_STATUS[number];

// Base Entry Interface
export interface BaseEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  amount: number;
  category: Category;
  status: TransactionStatus;
  isRecurring?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// FinanceStore Interface
interface FinanceStore<T extends BaseEntry> {
  entries: Record<string, T>;
  categories: Category[];
  newEntry: Partial<T>;
  showNewEntryForm: boolean;
}

// Income and Expense Store Interfaces
interface IncomeStore extends FinanceStore<BaseEntry> {
  totalIncome: number;
}

interface ExpenseStore extends FinanceStore<BaseEntry> {
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
}

// Utility Functions
export const financeUtils = {
  generateId: () => uuidv4(),
  createEntry: <T extends BaseEntry>(partialEntry: Partial<T> = {}): T => {
    const now = new Date();
    return {
      id: partialEntry.id || financeUtils.generateId(),
      date: partialEntry.date || format(now, 'yyyy-MM-dd'),
      time: partialEntry.time || format(now, 'HH:mm'),
      title: partialEntry.title || '',
      description: partialEntry.description || '',
      amount: partialEntry.amount || 0,
      category: partialEntry.category || { id: 'default', name: 'Uncategorized', icon: '❓', color: '#CCCCCC' },
      status: partialEntry.status || 'Pending',
      ...partialEntry
    } as T;
  },

  addEntry: <T extends BaseEntry>(store: FinanceStore<T>, entry: Partial<T>) => {
    const newEntry = financeUtils.createEntry(entry);
    store.entries[newEntry.id] = newEntry;
    return newEntry;
  },

  calculateTotal: <T extends BaseEntry>(entries: Record<string, T>) => {
    return Object.values(entries).reduce((total, entry) => total + entry.amount, 0);
  },

  filterByCategory: <T extends BaseEntry>(entries: Record<string, T>, categoryId: string) => {
    return Object.values(entries).filter(entry => entry.category.id === categoryId);
  },

  addCategory: (store: FinanceStore<BaseEntry>, newCategory: Category) => {
    store.categories.push(newCategory);
  },

  editCategory: (store: FinanceStore<BaseEntry>, categoryId: string, updates: Partial<Category>) => {
    const category = store.categories.find(cat => cat.id === categoryId);
    if (category) Object.assign(category, updates);
  },

  deleteCategory: (store: FinanceStore<BaseEntry>, categoryId: string) => {
    store.categories = store.categories.filter(cat => cat.id !== categoryId);
    Object.values(store.entries).forEach(entry => {
      if (entry.category.id === categoryId) entry.category = { id: 'default', name: 'Uncategorized', icon: '❓', color: '#CCCCCC' };
    });
  }
};

// Default Categories
export const defaultIncomeCategories: Category[] = [
  { id: '1', name: 'Other', icon: '🧾', color: '#4CAF50' },
  { id: '2', name: 'Salary', icon: '💼', color: '#4CAF50' },
  // Additional categories...
];

export const defaultExpenseCategories: Category[] = [
  { id: '1', name: 'Food', icon: '🍲', color: '#FF5722' },
  { id: '2', name: 'Rent', icon: '🏠', color: '#9C27B0' },
  // Additional categories...
];

// Income Store
export const incomeStore = observable(
  synced<IncomeStore>({
    initial: {
      categories: defaultIncomeCategories,
      newEntry: financeUtils.createEntry(),
      showNewEntryForm: false,
      totalIncome: 0,
      entries: {}
    },
    persist: { name: 'income', plugin: ObservablePersistMMKV }
  })
);

// Expense Store
export const expenseStore = observable(
  synced<ExpenseStore>({
    initial: {
      categories: defaultExpenseCategories,
      monthlyBudget: 0,
      showNewEntryForm: false,
      newEntry: financeUtils.createEntry(),
      entries: {},
      categoryBudgets: {}
    },
    persist: { name: 'expenses', plugin: ObservablePersistMMKV }
  })
);
