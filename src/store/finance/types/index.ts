import { z } from "zod";
import { BudgetConfigSchema, BudgetRuleTypeSchema, CategorySchema, IncomeExpenseSummarySchema, MonthlyBreakdownSchema, SavingsGoalSchema, TransactionSchema } from "../src/types";

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


export enum RecurrenceFrequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
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
  isSetUP: boolean;
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


export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type BudgetRuleType = z.infer<typeof BudgetRuleTypeSchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;
export type IncomeExpenseSummary = z.infer<typeof IncomeExpenseSummarySchema>;
export type MonthlyBreakdown = z.infer<typeof MonthlyBreakdownSchema>;
