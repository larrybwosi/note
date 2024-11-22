export enum BudgetRuleType {
  RULE_50_30_20 = '50/30/20 Rule', // Needs/Wants/Savings
  RULE_70_20_10 = '70/20/10 Rule', // Living/Savings/Debt
  RULE_15_65_20 = '15/65/20 Rule', // Savings/Living/Debt
  CUSTOM = 'Custom Rule',
}

export interface CustomRule {
  categoryId: string;
  label: string;
  percentage: number;
  color: string;
  description: string;
}


export interface Insights {
  guiltFreeBalance: number;
  monthlySpendingByCategory: Record<string, number>;
  savingsProgress: Record<string, number>;
  projectedSavings: number;
  unusualSpending: {
    categoryId: string;
    amount: number;
    percentageIncrease: number;
  }[];
  trends: {
    monthly: Record<string, number>;
    categoryTrends: Record<string, {
      average: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
  };
}


export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';
export type CategoryType = 'income' | 'expense';


export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  UPCOMING = 'UPCOMING',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  // SAVINGS = 'SAVINGS',
  // INVESTMENT = 'INVESTMENT',
  // DEBT_PAYMENT = 'DEBT_PAYMENT'
}

export interface Category {
  name: string;
  type: CategoryType;
  budget?: number;
  isSelected?:boolean;
  description?:string;
  icon?:any
}

export enum RecurrenceFrequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  createdAt: Date;
  type: TransactionType;
  category: Category;
  status: TransactionStatus;
  tags?: string[];
  notes?: string;
  attachments?: string[];
  paymentMethod?: string;
  location?: string;
  isEssential?: boolean;
  metadata?: Record<string, unknown>;
  recurrence?: {
    frequency: RecurrenceFrequency;
    endDate?: string;
    reminderEnabled: boolean;
    lastProcessed?: string;
  };
}

export interface BudgetConfig {
  rule: BudgetRuleType;
  monthlyIncome: number;
  savingsGoals: Record<string, SavingsGoal>;
  paymentSchedule: {
    payFrequency: PaymentFrequency;
    nextPayday: string;
  };
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  currentAmount: number;
  deadline?: string;
}


export interface IncomeExpenseSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  savingsRate: number;
}

export interface MonthlyBreakdown {
  month: string;
  income: number;
  expenses: number;
  net: number;
  categories: Record<string, number>;
}


export interface FinanceInsights {
  guiltFreeBalance: number;
  monthlySpendingByCategory: Record<string, number>;
  savingsProgress: Record<string, number>;
  projectedSavings: number;
  unusualSpending: any[];
  trends: {
    monthly: Record<string, number>;
    categoryTrends: Record<string, { trend: number; average: number }>;
  };
  monthlyIncome?: number;
  monthlyExpenses?: number;
}


export interface FinanceMetadata {
  lastUpdated: string;
  version: string;
  currency: string;
  timezone: string;
  incomeCategories: string[];
  expenseCategories: string[];
}

export interface FinanceAlerts {
  categoryOverspend: Alert[];
  upcomingBills: Alert[];
  savingsGoalProgress: Record<string, Alert>;
  unusualTransactions: Alert[];
  upcomingRecurringTransactions: Alert[];
}


export interface Alert {
  categoryId: string;
  type: 'categoryOverspend' | 'upcomingBill' | 'savingsGoal' | 'unusualTransaction' | 'recurringTransaction';
  message: string;
  severity: 'low' | 'medium' | 'high';
  date: string;
  read: boolean;
  metadata?: Record<string, any>;
  currentSpending?: number;
  budgetLimit?: number;
  // percentage?: number;
}

export interface FinanceStore {
  transactions: Record<string, Transaction>;
  categories: Record<string, Category>;
  customCategories: Category[];
  budgetConfig: BudgetConfig;
  insights: {
    guiltFreeBalance: number;
    monthlySpendingByCategory: Record<string, number>;
    savingsProgress: Record<string, number>;
    projectedSavings: number;
    unusualSpending: any[]; // Define a proper type if needed
    trends: {
      monthly: Record<string, number>;
      categoryTrends: Record<string, { trend: number; average: number }>;
    };
    monthlyIncome?: number;
    monthlyExpenses?: number;
  };
  alerts: {
    categoryOverspend: Alert[];
    upcomingBills: Alert[];
    savingsGoalProgress: Record<string, Alert>;
    unusualTransactions: Alert[];
    upcomingRecurringTransactions: Alert[];
  };
  metadata: {
    lastUpdated: string;
    version: string;
    currency: string;
    timezone: string;
    incomeCategories: string[];
    expenseCategories: string[];
  };
}

export enum IncomeCategory {
  SALARY = 'SALARY',
  BUSINESS = 'BUSINESS',
  INVESTMENTS = 'INVESTMENTS',
  SIDE_HUSTLE = 'SIDE_HUSTLE',
  GIFTS = 'GIFTS',
}

export enum ExpenseGroup {
  // Essential Expenses
  HOUSING = 'HOUSING',
  UTILITIES = 'UTILITIES',
  FOOD = 'FOOD',
  HEALTHCARE = 'HEALTHCARE',
  INSURANCE = 'INSURANCE',
  TRANSPORTATION = 'TRANSPORTATION',
  DEBT = 'DEBT',

  // Discretionary Expenses
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
}

export const INCOME_CATEGORIES = {
  [IncomeCategory.SALARY]: {
    icon: '💰',
    description: 'Regular employment income, wages, and bonuses',
  },
  [IncomeCategory.INVESTMENTS]: {
    icon: '📈',
    description: 'Returns from stocks, bonds, real estate, and other investments',
  },
  [IncomeCategory.BUSINESS]: {
    icon: '🏢',
    description: 'Income from business operations and side hustles',
  },
  [IncomeCategory.SIDE_HUSTLE]: {
    icon: '💻',
    description: 'Income from freelance work and consulting',
  },
  [IncomeCategory.GIFTS]: {
    icon: '🎁',
    description: 'Monetary gifts and inheritance',
  },
};

export const EXPENSE_CATEGORIES = {
  [ExpenseGroup.HOUSING]: {
    icon: '🏠',
    description: 'Rent, mortgage, utilities, and home maintenance',
  },
  [ExpenseGroup.TRANSPORTATION]: {
    icon: '🚗',
    description: 'Car payments, fuel, public transit, and maintenance',
  },
  [ExpenseGroup.FOOD]: {
    icon: '🍔',
    description: 'Groceries, dining out, and food delivery',
  },
  [ExpenseGroup.UTILITIES]: {
    icon: '⚡',
    description: 'Electricity, water, internet, and phone bills',
  },
  [ExpenseGroup.ENTERTAINMENT]: {
    icon: '🎮',
    description: 'Movies, games, streaming services, and hobbies',
  },
  [ExpenseGroup.HEALTHCARE]: {
    icon: '💊',
    description: 'Medical bills, insurance, and medications',
  },
  [ExpenseGroup.DEBT]: {
    icon: '💳',
    description: 'Credit card payments, loans, and other debt',
  },
  [ExpenseGroup.INSURANCE]: {
    icon: '🛡️',
    description: 'Health, life, home, and vehicle insurance',
  },
  [ExpenseGroup.SHOPPING]: {
    icon: '🛍️',
    description: 'Clothing, electronics, and general shopping',
  },
};


export interface AppState {
  responses: any[];
  isLoading: boolean;
  error: string | null;
  savedPrompts: string[];
  prompt: string;
  successMessage: string | null;
  hasResult: boolean;
}

export const themes: Record<string, Theme> = {
  modern: {
    primary: ['#FF6B6B', '#4ECDC4'],
    secondary: ['#45B7D1', '#FFBE0B'],
    accent: '#FF6B6B',
    text: {
      primary: '#2C3E50',
      secondary: '#95A5A6'
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF'
    }
  },
  nature: {
    primary: ['#00B894', '#81ECEC'],
    secondary: ['#55EFC4', '#74B9FF'],
    accent: '#00B894',
    text: {
      primary: '#2D3436',
      secondary: '#636E72'
    },
    background: {
      main: '#F0FFF4',
      card: '#FFFFFF'
    }
  },
  sunset: {
    primary: ['#FD746C', '#FF9068'],
    secondary: ['#FC8181', '#F6AD55'],
    accent: '#FD746C',
    text: {
      primary: '#2D3748',
      secondary: '#718096'
    },
    background: {
      main: '#FFFAF0',
      card: '#FFFFFF'
    }
  }
};

export interface AICreatorTemplateProps {
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  examplePrompts: string[];
  type: string;
  endpoint: string;
  addManualRoute: string;
  addManualButtonText: string;
  ItemComponent: React.ComponentType<ItemComponentProps>;
  itemComponentProps?: Record<string, any>;
  theme?: keyof typeof themes;
  layout?: 'card' | 'minimal';
  animation?: 'bounce' | 'slide' | 'fade';
  promptStyle?: 'chips' | 'list' | 'carousel';
}

interface ItemComponentProps {
  item: any;
  [key: string]: any;
}

export interface Theme {
  primary: string[];
  secondary: string[];
  accent: string;
  text: {
    primary: string;
    secondary: string;
  };
  background: {
    main: string;
    card: string;
  };
}

export interface HeaderProps {
  title: string;
  subtitle: string;
  theme: Theme;
  layout: 'card' | 'minimal';
}



