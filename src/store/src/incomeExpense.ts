import { store } from '../store';
import { budgetService } from './budget';
import { insightService } from './insight';
import { transactionService } from './transaction';
import {
  TransactionSchema,
  Transaction,
  TransactionTypeSchema,
  IncomeExpenseSummarySchema,
  MonthlyBreakdownSchema,
} from './types';
import { z } from 'zod';

export const incomeExpenseService = {
  addIncome: async (transaction: Transaction): Promise<void> => {
    try {
      if (!incomeExpenseService.validateIncomeTransaction(transaction)) {
        throw new Error('Invalid income transaction');
      }

      transaction.type = TransactionTypeSchema.enum.INCOME;
      const validatedTransaction = TransactionSchema.parse(transaction);
      await transactionService.addTransaction(validatedTransaction);
      await incomeExpenseService.updateIncomeStats();
    } catch (error) {
      console.error('Error adding income:', error);
      throw error;
    }
  },

  addExpense: async (transaction: Transaction): Promise<void> => {
    try {
      if (!incomeExpenseService.validateExpenseTransaction(transaction)) {
        throw new Error('Invalid expense transaction');
      }

      transaction.type = TransactionTypeSchema.enum.EXPENSE;
      transaction.amount = Math.abs(transaction.amount) * -1;
      const validatedTransaction = TransactionSchema.parse(transaction);
      await transactionService.addTransaction(validatedTransaction);
      await incomeExpenseService.updateExpenseStats();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  getIncomeExpenseSummary: async (
    startDate: Date,
    endDate: Date
  ): Promise<z.infer<typeof IncomeExpenseSummarySchema>> => {
    try {
      const transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);

      const summary = IncomeExpenseSummarySchema.parse({
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        incomeByCategory: {},
        expensesByCategory: {},
        savingsRate: 0,
      });

      for (const tx of transactions) {
        if (tx.type === TransactionTypeSchema.enum.INCOME) {
          summary.totalIncome += tx.amount;
          summary.incomeByCategory[tx.category.name] =
            (summary.incomeByCategory[tx.category.name] || 0) + tx.amount;
        } else if (tx.type === TransactionTypeSchema.enum.EXPENSE) {
          summary.totalExpenses += Math.abs(tx.amount);
          summary.expensesByCategory[tx.category.name] =
            (summary.expensesByCategory[tx.category.name] || 0) + Math.abs(tx.amount);
        }
      }

      summary.netIncome = summary.totalIncome - summary.totalExpenses;
      summary.savingsRate =
        summary.totalIncome > 0
          ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100
          : 0;

      return summary;
    } catch (error) {
      console.error('Error getting income expense summary:', error);
      throw error;
    }
  },

  getMonthlyBreakdown: async (
    year: number,
    month: number
  ): Promise<z.infer<typeof MonthlyBreakdownSchema>> => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);

      const breakdown = MonthlyBreakdownSchema.parse({
        month: `${year}-${String(month).padStart(2, '0')}`,
        income: 0,
        expenses: 0,
        net: 0,
        categories: {},
      });

      for (const tx of transactions) {
        if (tx.type === TransactionTypeSchema.enum.INCOME) {
          breakdown.income += tx.amount;
        } else if (tx.type === TransactionTypeSchema.enum.EXPENSE) {
          breakdown.expenses += Math.abs(tx.amount);
        }
        breakdown.categories[tx.category.name] =
          (breakdown.categories[tx.category.name] || 0) +
          (tx.type === TransactionTypeSchema.enum.INCOME ? tx.amount : Math.abs(tx.amount));
      }

      breakdown.net = breakdown.income - breakdown.expenses;
      return breakdown;
    } catch (error) {
      console.error('Error getting monthly breakdown:', error);
      throw error;
    }
  },

  getTotalIncome: (): number => {
    try {
      const transactions = Object.values(store.transactions.get());
      return transactions.reduce(
        (sum, tx) => sum + (tx.type === TransactionTypeSchema.enum.INCOME ? tx.amount : 0),
        0
      );
    } catch (error) {
      console.error('Error getting total income:', error);
      throw error;
    }
  },

  getTotalExpenses: (): number => {
    try {
      const transactions = Object.values(store.transactions.get());
      return transactions.reduce(
        (sum, tx) =>
          sum + (tx.type === TransactionTypeSchema.enum.EXPENSE ? Math.abs(tx.amount) : 0),
        0
      );
    } catch (error) {
      console.error('Error getting total expenses:', error);
      throw error;
    }
  },

  getMonthlyIncome: (): number => {
    try {
      const transactions = Object.values(store.transactions.get());
      return transactions.reduce(
        (sum, tx) => sum + (tx.type === TransactionTypeSchema.enum.INCOME ? tx.amount : 0),
        0
      );
    } catch (error) {
      console.error('Error getting monthly income:', error);
      throw error;
    }
  },

  getMonthlyExpenses: (): number => {
    try {
      const transactions = Object.values(store.transactions.get());
      return transactions.reduce(
        (sum, tx) =>
          sum + (tx.type === TransactionTypeSchema.enum.EXPENSE ? Math.abs(tx.amount) : 0),
        0
      );
    } catch (error) {
      console.error('Error getting monthly expenses:', error);
      throw error;
    }
  },

  getAnnualSummary: async (
    year: number
  ): Promise<Record<string, z.infer<typeof MonthlyBreakdownSchema>>> => {
    try {
      const summary: Record<string, z.infer<typeof MonthlyBreakdownSchema>> = {};

      for (let month = 1; month <= 12; month++) {
        summary[String(month).padStart(2, '0')] = await incomeExpenseService.getMonthlyBreakdown(
          year,
          month
        );
      }

      return summary;
    } catch (error) {
      console.error('Error getting annual summary:', error);
      throw error;
    }
  },

  updateIncomeStats: async (): Promise<void> => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthlyIncome = await incomeExpenseService.getIncomeExpenseSummary(startOfMonth, today);
      store.insights.monthlyIncome?.set(monthlyIncome.totalIncome);

      await insightService.updateInsights();
    } catch (error) {
      console.error('Error updating income stats:', error);
      throw error;
    }
  },

  updateExpenseStats: async (): Promise<void> => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const monthlyExpenses = await incomeExpenseService.getIncomeExpenseSummary(
        startOfMonth,
        today
      );
      store.insights.monthlyExpenses.set(monthlyExpenses.totalExpenses);

      await insightService.updateInsights();
      await budgetService.checkBudgetAlerts();
    } catch (error) {
      console.error('Error updating expense stats:', error);
      throw error;
    }
  },

  validateIncomeTransaction: (transaction: Transaction): boolean => {
    return (
      transaction.amount > 0 &&
      !!transaction.createdAt &&
      !!transaction.category.name &&
      store.metadata.incomeCategories.get().includes(transaction.category.name)
    );
  },

  validateExpenseTransaction: (transaction: Transaction): boolean => {
    return (
      transaction.amount !== 0 &&
      !!transaction.createdAt &&
      !!transaction.category.name &&
      store.metadata.expenseCategories.get().includes(transaction.category.name)
    );
  },
};
