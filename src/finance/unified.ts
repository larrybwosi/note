import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval,
  differenceInMonths 
} from "date-fns";

// Core Types and Enums
export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
  TRANSFER = 'TRANSFER',
  INVESTMENT = 'INVESTMENT',
  SAVINGS = 'SAVINGS',
  DEBT_PAYMENT = 'DEBT_PAYMENT'
}

export enum BudgetRuleType {
  RULE_15_65_20 = '15/65/20 Rule',
  RULE_50_30_20 = '50/30/20 Rule',
  RULE_70_20_10 = '70/20/10 Rule',
  CUSTOM = 'Custom Rule'
}

export enum CategoryType {
  NEEDS = 'need',
  WANT = 'want',
  SAVINGS = 'savings',
  CUSTOM = 'custom'
}

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum CategoryGroup {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum IncomeCategory {
  SALARY = 'SALARY',
  BUSINESS = 'BUSINESS',
  INVESTMENTS = 'INVESTMENTS',
  GIFTS = 'GIFTS',
  SIDE_HUSTLE = 'SIDE_HUSTLE',
  OTHER = 'OTHER'
}

export enum ExpenseGroup {
  UTILITIES = 'UTILITIES',
  HOUSING = 'HOUSING',
  TRANSPORTATION = 'TRANSPORTATION',
  INSURANCE = 'INSURANCE',
  DEBT = 'DEBT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  HEALTHCARE = 'HEALTHCARE',
  OTHER = 'OTHER'
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  status: TransactionStatus;
  paymentMethod?: string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isEssential?: boolean;
  metadata?: Record<string, unknown>;
  recurrence?: {
    frequency: RecurrenceFrequency;
    endDate?: string;
    reminderEnabled: boolean;
    lastProcessed?: string;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  deadline: string;
  currentAmount: number;
  categoryId: string;
  priority: number;
  autoContribute?: {
    enabled: boolean;
    amount: number;
    frequency: RecurrenceFrequency;
  };
}

export interface BudgetRule {
  categoryId: string;
  percentage: number;
  maxAmount?: number;
  rollover?: boolean;
}

export interface BudgetConfig {
  selectedRule: BudgetRuleType;
  monthlyIncome: number;
  customRules: BudgetRule[];
  savingsGoals: Record<string, SavingsGoal>;
  paymentSchedule?: {
    payFrequency: 'weekly' | 'biweekly' | 'monthly';
    nextPayday: string;
  };
}

export interface FinanceInsights {
  guiltFreeBalance: number;
  monthlySpendingByCategory: Record<string, number>;
  savingsProgress: Record<string, number>;
  projectedSavings: number;
  unusualSpending: Array<{
    categoryId: string;
    amount: number;
    percentageIncrease: number;
  }>;
  trends: {
    monthly: Record<string, number>;
    categoryTrends: Record<string, {
      trend: number;
      average: number;
    }>;
  };
}

// Enhanced Category System
export enum IncomeCategoryId {
  SALARY = 'income_salary',
  BUSINESS = 'income_business',
  INVESTMENTS = 'income_investments',
  GIFTS = 'income_gifts',
  SIDE_HUSTLE = 'income_side_hustle',
  OTHER = 'income_other'
}

export enum ExpenseCategoryId {
  UTILITIES = 'expense_utilities',
  RENT = 'expense_rent',
  GROCERIES = 'expense_groceries',
  TRANSPORTATION = 'expense_transportation',
  INSURANCE = 'expense_insurance',
  HEALTHCARE = 'expense_healthcare',
  ENTERTAINMENT = 'expense_entertainment',
  DINING = 'expense_dining',
  SHOPPING = 'expense_shopping',
  EDUCATION = 'expense_education',
  DEBT = 'expense_debt',
  OTHER = 'expense_other'
}

export type CategoryId = IncomeCategoryId | ExpenseCategoryId | string;

// Updated Interfaces
export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  group: CategoryGroup;
  subgroup?: ExpenseGroup | IncomeCategory;
  isDefault: boolean;
  isArchived: boolean;
  budgetPercentage?: number;
  monthlyLimit?: number;
  warningThreshold?: number;
  metadata?: {
    description?: string;
    tags?: string[];
    priority?: number;
  };
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: CategoryId;
  status: TransactionStatus;
  paymentMethod?: string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isEssential?: boolean;
  metadata?: Record<string, unknown>;
  recurrence?: {
    frequency: RecurrenceFrequency;
    endDate?: string;
    reminderEnabled: boolean;
    lastProcessed?: string;
  };
}

// Default Categories Configuration
const DEFAULT_INCOME_CATEGORIES: Category[] = [
  {
    id: IncomeCategoryId.SALARY,
    name: 'Salary',
    icon: '💰',
    color: '#4CAF50',
    type: CategoryType.NEEDS,
    group: CategoryGroup.INCOME,
    isDefault: true,
    isArchived: false
  },
  {
    id: IncomeCategoryId.BUSINESS,
    name: 'Business Income',
    icon: '💼',
    color: '#2196F3',
    type: CategoryType.NEEDS,
    group: CategoryGroup.INCOME,
    isDefault: true,
    isArchived: false
  },
  {
    id: IncomeCategoryId.INVESTMENTS,
    name: 'Investment Returns',
    icon: '📈',
    color: '#9C27B0',
    type: CategoryType.SAVINGS,
    group: CategoryGroup.INCOME,
    isDefault: true,
    isArchived: false
  }
];

const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  {
    id: ExpenseCategoryId.UTILITIES,
    name: 'Utilities',
    icon: '⚡',
    color: '#F44336',
    type: CategoryType.NEEDS,
    group: CategoryGroup.EXPENSE,
    isDefault: true,
    isArchived: false
  },
  {
    id: ExpenseCategoryId.RENT,
    name: 'Rent/Mortgage',
    icon: '🏠',
    color: '#E91E63',
    type: CategoryType.NEEDS,
    group: CategoryGroup.EXPENSE,
    isDefault: true,
    isArchived: false
  },
  {
    id: ExpenseCategoryId.GROCERIES,
    name: 'Groceries',
    icon: '🛒',
    color: '#4CAF50',
    type: CategoryType.NEEDS,
    group: CategoryGroup.EXPENSE,
    isDefault: true,
    isArchived: false
  }
];

// Category Management Functions
export const createCategory = (partial: Omit<Category, 'id' | 'isDefault' | 'isArchived'>): Category => {
  return {
    id: `custom_${Math.floor(Math.random() * 1000000)}`,
    isDefault: false,
    isArchived: false,
    ...partial
  };
};

export const isCategoryValid = (categoryId: CategoryId, store: FinanceStore): boolean => {
  return categoryId in store.categories;
};
export interface CategoryStore {
  categories: Record<string, Category>;
  groups: {
    income: Record<IncomeCategory, string[]>;
    expense: Record<ExpenseGroup, string[]>;
  };
}

export interface FinanceAlerts {
  categoryOverspend: string[];
  upcomingBills: Transaction[];
  savingsGoalProgress: Record<string, number>;
  unusualTransactions: Transaction[];
  lowBalanceWarning?: boolean;
  upcomingRecurringTransactions: Transaction[];
}
export interface CategoryStore {
  categories: Record<CategoryId, Category>;
  customCategories: CategoryId[];
}

export interface FinanceStore {
  transactions: Record<string, Transaction>;
  categories: Record<CategoryId, Category>;
  customCategories: CategoryId[];
  budgetConfig: BudgetConfig;
  insights: FinanceInsights;
  alerts: FinanceAlerts;
  metadata: {
    lastUpdated: string;
    version: string;
    currency: string;
    timezone: string;
  };
}

export const createTransaction = (partial: Partial<Transaction>): Transaction => {
  const now = new Date();
  return {
    id: partial.id || Math.floor(Math.random() * 1000000).toString(),
    date: partial.date || format(now, 'yyyy-MM-dd'),
    time: partial.time || format(now, 'HH:mm'),
    title: partial.title || '',
    description: partial.description || '',
    amount: partial.amount || 0,
    type: partial.type || TransactionType.EXPENSE,
    categoryId: partial.categoryId || 'default',
    status: partial.status || TransactionStatus.PENDING,
    ...partial
  };
};

export const getMonthlyTransactions = (
  transactions: Record<string, Transaction>,
  date: Date = new Date()
): Transaction[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  return Object.values(transactions).filter(transaction => 
    isWithinInterval(new Date(transaction.date), {
      start: monthStart,
      end: monthEnd
    })
  );
};

export const calculateCategorySpending = (
  transactions: Record<string, Transaction>,
  categoryId: string,
  date: Date = new Date()
): number => {
  return getMonthlyTransactions(transactions, date)
    .filter(t => t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateIncomeByCategory = (
  store: FinanceStore,
  categoryId: string,
  date: Date = new Date()
): number => {
  return getMonthlyTransactions(store.transactions, date)
    .filter(t => t.categoryId === categoryId && t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateExpensesByGroup = (
  store: FinanceStore,
  group: ExpenseGroup,
  date: Date = new Date()
): number => {
  const categories = Object.values(store.categories)
    .filter(cat => 
      cat.group === CategoryGroup.EXPENSE && 
      cat.subgroup === group
    )
    .map(cat => cat.id);

  return getMonthlyTransactions(store.transactions, date)
    .filter(t => 
      categories.includes(t.categoryId) && 
      t.type === TransactionType.EXPENSE
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateBudgetAllocations = (
  budgetConfig: BudgetConfig
): Record<string, number> => {
  const { monthlyIncome, selectedRule, customRules } = budgetConfig;
  
  switch (selectedRule) {
    case BudgetRuleType.RULE_15_65_20:
      return {
        needs: monthlyIncome * 0.65,
        wants: monthlyIncome * 0.15,
        savings: monthlyIncome * 0.20
      };
    case BudgetRuleType.RULE_50_30_20:
      return {
        needs: monthlyIncome * 0.50,
        wants: monthlyIncome * 0.30,
        savings: monthlyIncome * 0.20
      };
    case BudgetRuleType.RULE_70_20_10:
      return {
        expenses: monthlyIncome * 0.70,
        savings: monthlyIncome * 0.20,
        debtOrDonation: monthlyIncome * 0.10
      };
    case BudgetRuleType.CUSTOM:
      return customRules.reduce((acc, rule) => ({
        ...acc,
        [rule.categoryId]: monthlyIncome * (rule.percentage / 100)
      }), {});
  }
};

export const calculateGuiltFreeBalance = (
  store: FinanceStore,
  allocations: Record<string, number>
): number => {
  const monthlyTransactions = getMonthlyTransactions(store.transactions);
  
  const essentialExpenses = monthlyTransactions
    .filter(t => t.isEssential)
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsContribution = monthlyTransactions
    .filter(t => store.categories[t.categoryId]?.type === CategoryType.SAVINGS)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    store.budgetConfig.monthlyIncome -
    essentialExpenses -
    savingsContribution -
    (allocations.savings || 0)
  );
};

export const calculateSavingsProgress = (
  savingsGoals: Record<string, SavingsGoal>
): Record<string, number> => {
  return Object.entries(savingsGoals).reduce((acc, [id, goal]) => {
    const progress = (goal.currentAmount / goal.target) * 100;
    return { ...acc, [id]: progress };
  }, {});
};

export const projectSavings = (
  store: FinanceStore,
  monthsAhead: number = 12
): number => {
  const monthlyIncome = store.budgetConfig.monthlyIncome;
  const averageMonthlyExpenses = Object.values(store.transactions)
    .reduce((sum, t) => {
      const months = differenceInMonths(new Date(), new Date(t.date));
      return sum + (t.amount / Math.max(1, months));
    }, 0);

  const projectedMonthlySavings = monthlyIncome - averageMonthlyExpenses;
  return projectedMonthlySavings * monthsAhead;
};

export const detectUnusualSpending = (
  store: FinanceStore,
  threshold: number = 0.2
): Array<{ categoryId: string; amount: number; percentageIncrease: number }> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

  return Object.keys(store.categories)
    .map(categoryId => {
      const currentSpending = calculateCategorySpending(store.transactions, categoryId, now);
      const lastMonthSpending = calculateCategorySpending(store.transactions, categoryId, lastMonth);

      if (lastMonthSpending === 0) return null;

      const percentageIncrease = (currentSpending - lastMonthSpending) / lastMonthSpending;

      return percentageIncrease > threshold ? {
        categoryId,
        amount: currentSpending,
        percentageIncrease
      } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

export const updateInsights = (store: FinanceStore): FinanceInsights => {
  const allocations = calculateBudgetAllocations(store.budgetConfig);
  const monthlySpendingByCategory = Object.keys(store.categories).reduce(
    (acc, categoryId) => ({
      ...acc,
      [categoryId]: calculateCategorySpending(store.transactions, categoryId)
    }),
    {}
  );

  return {
    monthlySpendingByCategory,
    guiltFreeBalance: calculateGuiltFreeBalance(store, allocations),
    savingsProgress: calculateSavingsProgress(store.budgetConfig.savingsGoals),
    projectedSavings: projectSavings(store),
    unusualSpending: detectUnusualSpending(store),
    trends: {
      monthly: {},
      categoryTrends: {}
    }
  };
};

export const getCategoriesByGroup = (
  store: FinanceStore,
  group: CategoryGroup
): Category[] => {
  return Object.values(store.categories).filter(cat => cat.group === group);
};

export const getCategoriesBySubgroup = (
  store: FinanceStore,
  group: CategoryGroup,
  subgroup: ExpenseGroup | IncomeCategory
): Category[] => {
  return Object.values(store.categories).filter(
    cat => cat.group === group && cat.subgroup === subgroup
  );
};

// Store Creation
const createFinanceStore = () => {
  const defaultCategories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES].reduce(
    (acc, category) => ({
      ...acc,
      [category.id]: category
    }),
    {} as Record<CategoryId, Category>
  );

  const initial: FinanceStore = {
    transactions: {},
    categories: defaultCategories,
    customCategories: [],
    budgetConfig: {
      selectedRule: BudgetRuleType.RULE_50_30_20,
      monthlyIncome: 0,
      customRules: [],
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
        categoryTrends: {}
      }
    },
    alerts: {
      categoryOverspend: [],
      upcomingBills: [],
      savingsGoalProgress: {},
      unusualTransactions: [],
      upcomingRecurringTransactions: []
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  };

  return observable(
    synced<FinanceStore>({
      initial,
      persist: {
        name: 'finance',
        plugin: ObservablePersistMMKV
      }
    })
  );
};

// Main Hook for Using the Finance Store
export const useFinanceStore = () => {
  const store = createFinanceStore();
 const addNewTransaction = (transaction: Omit<Transaction, 'id' | 'date' | 'time' | 'status'>) => {
    if (!isCategoryValid(transaction.categoryId, store.get())) {
      throw new Error(`Invalid category ID: ${transaction.categoryId}`);
    }

    const newTransaction = createTransaction(transaction);
    store.transactions[newTransaction.id].set(newTransaction);
    updateInsights(store.get());
    return newTransaction;
  };

  const addCustomCategory = (categoryData: Omit<Category, 'id' | 'isDefault' | 'isArchived'>) => {
    const newCategory = createCategory(categoryData);
    store.categories[newCategory.id].set(newCategory);
    store.customCategories.push(newCategory.id);
    return newCategory;
  };

  const getAvailableCategories = (group: CategoryGroup): Category[] => {
    return Object.values(store.categories.get()).filter(
      category => category.group === group && !category.isArchived
    );
  };

  const archiveCategory = (categoryId: CategoryId) => {
    const category = store.categories[categoryId].get();
    if (!category.isDefault) {
      store.categories[categoryId].isArchived.set(true);
    } else {
      throw new Error('Cannot archive default categories');
    }
  };

  const getIncomeSummary = (date: Date = new Date()) => {
    return Object.values(IncomeCategory).reduce((summary, group) => {
      const total = calculateIncomeByCategory(store.get(), group, date);
      return { ...summary, [group]: total };
    }, {} as Record<IncomeCategory, number>);
  };

  const getExpenseSummary = (date: Date = new Date()) => {
    return Object.values(ExpenseGroup).reduce((summary, group) => {
      const total = calculateExpensesByGroup(store.get(), group, date);
      return { ...summary, [group]: total };
    }, {} as Record<ExpenseGroup, number>);
  };

  const updateBudgetRule = (rule: BudgetRuleType, monthlyIncome?: number) => {
    store.budgetConfig.selectedRule.set(rule);
    if (monthlyIncome !== undefined) {
      store.budgetConfig.monthlyIncome.set(monthlyIncome);
    }
    const updatedInsights = updateInsights(store.get());
    store.insights.set(updatedInsights);
  };

  return {
    store,
    // Transaction Management
    addTransaction: addNewTransaction,
    getMonthlyTransactions: (date?: Date) => getMonthlyTransactions(store.transactions.get(), date),
    
    // Category Management
    addCustomCategory,
    archiveCategory,
    getCategoriesByGroup: (group: CategoryGroup) =>
      getCategoriesByGroup(store.get(), group),
    getCategoriesBySubgroup: (group: CategoryGroup, subgroup: ExpenseGroup | IncomeCategory) =>
      getCategoriesBySubgroup(store.get(), group, subgroup),
    
    // Financial Analysis
    getIncomeSummary,
    getExpenseSummary,
    calculateBudgetAllocations: () => 
      calculateBudgetAllocations(store.budgetConfig.get()),
    
    // Budget Management
    updateBudgetRule,
    
    // Insights
    updateInsights: () => {
      store.insights.set(updateInsights(store.get()));
    }
  };
};

export default useFinanceStore;