
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
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT',
  DEBT_PAYMENT = 'DEBT_PAYMENT'
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
    unusualSpending: any[];
    trends: {
      monthly: Record<string, number>;
      categoryTrends: Record<string, { trend: number; average: number }>;
    };
    monthlyIncome?: number;
    monthlyExpenses?: number;
  };
  metadata: FinanceMetadata;
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
