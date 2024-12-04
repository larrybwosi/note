export enum BudgetRuleType {
  RULE_50_30_20 = '50/30/20 Rule',
  RULE_70_20_10 = '70/20/10 Rule',
  RULE_15_65_20 = '15/65/20 Rule',
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
  isSelected?: boolean;
  description?: string;
  icon?: any;
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

export enum IncomeCategory {
  SALARY = 'SALARY',
  BUSINESS = 'BUSINESS',
  INVESTMENTS = 'INVESTMENTS',
  SIDE_HUSTLE = 'SIDE_HUSTLE',
  GIFTS = 'GIFTS',
}

export enum ExpenseGroup {
  HOUSING = 'HOUSING',
  UTILITIES = 'UTILITIES',
  FOOD = 'FOOD',
  HEALTHCARE = 'HEALTHCARE',
  INSURANCE = 'INSURANCE',
  TRANSPORTATION = 'TRANSPORTATION',
  DEBT = 'DEBT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
}

