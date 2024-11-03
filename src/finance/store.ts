import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { v4 as uuidv4 } from "uuid";


export const TRANSACTION_STATUS = [
  'Pending', 
  'Completed', 
  'Failed', 
  'Cancelled'
] as const;


export const TRANSACTION_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  TRANSFER: 'transfer',
  INVESTMENT: 'investment',
  SAVINGS: 'savings',
  DEBT_PAYMENT: 'debt_payment'
} as const;

export type TransactionStatus = typeof TRANSACTION_STATUS[number];
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
 const financeUtils = {
  // Generate a unique ID
  generateId: () => uuidv4(),

  // Create a new entry with default values
  createEntry: <T extends BaseEntry>(partialEntry: Partial<T> = {}): T => {
    const now = new Date();
    return {
      id: partialEntry.id || financeUtils.generateId(),
      date: partialEntry.date || format(now, 'yyyy-MM-dd'),
      time: partialEntry.time || format(now, 'HH:mm'),
      title: partialEntry.title || '',
      description: partialEntry.description || '',
      amount: partialEntry.amount || 0,
      category: partialEntry.category || { 
        id: 'default', 
        name: 'Uncategorized', 
        icon: '❓', 
        color: '#CCCCCC' 
      },
      status: partialEntry.status || 'Pending',
      ...partialEntry
    } as T;
  },

  // Add a new entry to the store
  addEntry: <T extends BaseEntry>(
    store: FinanceStore<T>, 
    entry: Partial<T>
  ) => {
    const newEntry = financeUtils.createEntry(entry);
    store.entries[newEntry.id] = newEntry;
    return newEntry;
  },

  // Calculate total amount for entries
  calculateTotal: <T extends BaseEntry>(entries: Record<string, T>) => {
    return Object.values(entries).reduce((total, entry) => total + entry.amount, 0);
  },

  // Filter entries by category
  filterByCategory: <T extends BaseEntry>(
    entries: Record<string, T>, 
    categoryId: string
  ) => {
    return Object.values(entries).filter(entry => 
      entry.category.id === categoryId
    );
  }
};

export const defaultIncomeCategories: Category[] = [
  { id: '1', name: 'Other', icon: '🧾', color: '#4CAF50' },
  { id: '2', name: 'Salary', icon: '💼', color: '#4CAF50' },
  { id: '3', name: 'Investment', icon: '📈', color: '#2196F3' },
  { id: '4', name: 'Savings', icon: '💸', color: '#FF9800' },
  { id: '5', name: 'Gift', icon: '🎁', color: '#9C27B0' },
  { id: '6', name: 'Side Hustle', icon: '💻', color: '#3F51B5' },
];

export const defaultExpenseCategories: Category[] = [
  { id: '1', name: 'Food', icon: '🍲', color: '#FF5722' },
  { id: '2', name: 'Rent', icon: '🏠', color: '#9C27B0' },
  { id: '3', name: 'Entertainment', icon: '🎉', color: '#3F51B5' },
  { id: '4', name: 'Transportation', icon: '🚗', color: '#FF5722' },
  { id: '5', name: 'Utilities', icon: '🔌', color: '#9C27B0' },
  { id: '6', name: 'Insurance', icon: '🛡️', color: '#3F51B5' },
  { id: '7', name: 'Clothing', icon: '👚', color: '#FF5722' },
  { id: '8', name: 'Medical', icon: '💊', color: '#9C27B0' },
  { id: '9', name: 'Other', icon: '🧾', color: '#4CAF50' }
];

// Budget Rule Types
export const BUDGET_RULES = {
  RULE_15_65_20: '15/65/20 Rule', // 65% Needs, 15% Wants, 20% Savings
  RULE_50_30_20: '50/30/20 Rule', // 50% Needs, 30% Wants, 20% Savings
  RULE_70_20_10: '70/20/10 Rule', // 70% Expenses, 20% Savings, 10% Debt/Donation
  CUSTOM: 'Custom Rule'
} as const;

export type BudgetRuleType = typeof BUDGET_RULES[keyof typeof BUDGET_RULES];

// Enhanced Category Interface
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type?: 'need' | 'want' | 'savings' | 'custom'; // Maps to budget rules
  budgetPercentage?: number; // For custom allocation
  monthlyLimit?: number; // Optional specific limit
  warningThreshold?: number; // Percentage at which to warn user
}

// Enhanced Transaction Interface
export interface Transaction extends BaseEntry {
  paymentMethod?: string;
  tags?: string[];
  location?: string;
  receipt?: string; // URL or file reference
  isEssential?: boolean;
  category: Category;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: string;
    reminderEnabled: boolean;
  };
}

// Budget Configuration Interface
interface BudgetConfig {
  selectedRule: BudgetRuleType;
  monthlyIncome: number;
  customRules?: {
    categoryId: string;
    percentage: number;
  }[];
  savingsGoal?: {
    target: number;
    deadline: string;
    currentAmount: number;
  };
  debtPayment?: {
    totalDebt: number;
    minimumPayment: number;
    interestRate: number;
  };
}

// Enhanced Finance Store Interface
export interface EnhancedFinanceStore {
  transactions: Record<string, Transaction>;
  categories: Category[];
  budgetConfig: BudgetConfig;
  insights: {
    guiltFreeBalance: number; // Amount available for discretionary spending
    monthlySpendingByCategory: Record<string, number>;
    savingsProgress: number; // Percentage towards savings goal
    projectedSavings: number; // Based on current spending patterns
    unusualSpending: {
      categoryId: string;
      amount: number;
      percentageIncrease: number;
    }[];
  };
  alerts: {
    categoryOverspend: string[];
    upcomingBills: Transaction[];
    savingsGoalProgress: number;
    unusualTransactions: Transaction[];
  };
}

// Utility Functions
export const enhancedFinanceUtils = {
  ...financeUtils,

  // Calculate budget allocations based on selected rule
  calculateBudgetAllocations: (config: BudgetConfig) => {
    const { monthlyIncome, selectedRule } = config;
    
    switch (selectedRule) {
      case BUDGET_RULES.RULE_15_65_20:
        return {
          needs: monthlyIncome * 0.65,
          wants: monthlyIncome * 0.15,
          savings: monthlyIncome * 0.20
        };
      case BUDGET_RULES.RULE_50_30_20:
        return {
          needs: monthlyIncome * 0.50,
          wants: monthlyIncome * 0.30,
          savings: monthlyIncome * 0.20
        };
      case BUDGET_RULES.RULE_70_20_10:
        return {
          expenses: monthlyIncome * 0.70,
          savings: monthlyIncome * 0.20,
          debtOrDonation: monthlyIncome * 0.10
        };
      case BUDGET_RULES.CUSTOM:
        return config.customRules?.reduce((acc, rule) => ({
          ...acc,
          [rule.categoryId]: monthlyIncome * (rule.percentage / 100)
        }), {});
      default:
        return null;
    }
  },

  // Calculate guilt-free balance
  calculateGuiltFreeBalance: (
    store: EnhancedFinanceStore,
    currentDate = new Date()
  ) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get all transactions within current month
    const monthlyTransactions = Object.values(store.transactions).filter(
      transaction => isWithinInterval(new Date(transaction.date), {
        start: monthStart,
        end: monthEnd
      })
    );

    const allocations = enhancedFinanceUtils.calculateBudgetAllocations(
      store.budgetConfig,
    );
    
    // Calculate essential expenses
    const essentialExpenses = monthlyTransactions
      .filter(t => t.isEssential)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate savings contribution
    const savingsContribution = monthlyTransactions
      .filter(t => t.category.type === 'savings')
      .reduce((sum, t) => sum + t.amount, 0);

    // Return remaining guilt-free amount
    return (
      store.budgetConfig.monthlyIncome -
      essentialExpenses -
      savingsContribution -
      (allocations?.savings || 0)
    );
  },

  // Detect unusual spending patterns
  detectUnusualSpending: (
    store: EnhancedFinanceStore,
    threshold = 0.2 // 20% increase is considered unusual
  ) => {
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    
    const unusualSpending = store.categories.map(category => {
      const currentMonthSpending = enhancedFinanceUtils.calculateCategorySpending(
        store,
        category.id,
        currentMonth
      );
      const lastMonthSpending = enhancedFinanceUtils.calculateCategorySpending(
        store,
        category.id,
        lastMonth
      );
      
      const percentageIncrease = 
        (currentMonthSpending - lastMonthSpending) / lastMonthSpending;
      
      if (percentageIncrease > threshold) {
        return {
          categoryId: category.id,
          amount: currentMonthSpending,
          percentageIncrease
        };
      }
      return null;
    }).filter(Boolean);

    return unusualSpending;
  },

  // Calculate category spending for a given month
  calculateCategorySpending: (
    store: EnhancedFinanceStore,
    categoryId: string,
    month: Date
  ) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    return Object.values(store.transactions)
      .filter(
        transaction =>
          transaction.category.id === categoryId &&
          isWithinInterval(new Date(transaction.date), {
            start: monthStart,
            end: monthEnd
          })
      )
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  },

  // Project savings based on current spending patterns
  projectSavings: (store: EnhancedFinanceStore, monthsAhead = 12) => {
    const currentSavings = store.budgetConfig.savingsGoal?.currentAmount || 0;
    const monthlyIncome = store.budgetConfig.monthlyIncome;
    const averageMonthlyExpenses = Object.values(store.transactions)
      .filter(t => !t?.category?.type?.includes('savings'))
      .reduce((sum, t) => sum + t.amount, 0) / 12; // Assuming 1 year of data

    const projectedMonthlySavings = monthlyIncome - averageMonthlyExpenses;
    return currentSavings + (projectedMonthlySavings * monthsAhead);
  }
};

// Enhanced Store Creation
export const createEnhancedFinanceStore = () => observable(
  synced<EnhancedFinanceStore>({
    initial: {
      transactions: {},
      categories: [
        ...defaultIncomeCategories.map(cat => ({
          ...cat,
          type: 'custom' as const,
          warningThreshold: 0.8
        })),
        ...defaultExpenseCategories.map(cat => ({
          ...cat,
          type: 'need' as const,
          warningThreshold: 0.8
        }))
      ],
      budgetConfig: {
        selectedRule: BUDGET_RULES.RULE_50_30_20,
        monthlyIncome: 0,
        savingsGoal: {
          target: 0,
          deadline: '',
          currentAmount: 0
        }
      },
      insights: {
        guiltFreeBalance: 0,
        monthlySpendingByCategory: {},
        savingsProgress: 0,
        projectedSavings: 0,
        unusualSpending: []
      },
      alerts: {
        categoryOverspend: [],
        upcomingBills: [],
        savingsGoalProgress: 0,
        unusualTransactions: []
      }
    },
    persist: {
      name: 'enhanced-finance',
      plugin: ObservablePersistMMKV
    }
  })
);