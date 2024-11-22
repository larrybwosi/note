import { categoryService } from "./category";
import { transactionService } from "./transaction";
import { TransactionTypeSchema } from "./types";

export const trendAnalysisService = {
  calculateIncomeGrowth: async (months: number = 12): Promise<number> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const monthlyIncomes = await trendAnalysisService.getMonthlyIncomeTrend(startDate, endDate);
    const values = Object.values(monthlyIncomes);
    
    if (values.length < 2) return 0;
    
    const firstMonth = values[0];
    const lastMonth = values[values.length - 1];
    
    return firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;
  },

  getMonthlyIncomeTrend: async (startDate: Date, endDate: Date): Promise<Record<string, number>> => {
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate)
      .filter(tx => tx.type === TransactionTypeSchema.enum.INCOME);
    
    return transactions.reduce((acc, tx) => {
      const month = new Date(tx.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  },

  getTopExpenseCategories: async (startDate: Date, endDate: Date, limit: number = 5): Promise<{category: string, amount: number, percentage: number}[]> => {
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate)
      .filter(tx => tx.type === TransactionTypeSchema.enum.EXPENSE);
    
    const categoryTotals: Record<string, number> = {};
    let totalExpenses = 0;
    
    for (const tx of transactions) {
      const amount = Math.abs(tx.amount);
      categoryTotals[tx.category.name] = (categoryTotals[tx.category.name] || 0) + amount;
      totalExpenses += amount;
    }
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  },

  calculateBudgetCompliance: async (categoryId: string): Promise<{
    withinBudget: boolean;
    currentSpending: number;
    budgetLimit: number;
    remainingBudget: number;
    spendingPercentage: number;
  }> => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const transactions = transactionService.getTransactionsByCategory(categoryId, startOfMonth, today)
      .filter(tx => tx.type === TransactionTypeSchema.enum.EXPENSE);
    
    const currentSpending = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const budgetLimit = categoryService.getCategoryBudget(categoryId);
    
    return {
      withinBudget: currentSpending <= budgetLimit,
      currentSpending,
      budgetLimit,
      remainingBudget: budgetLimit - currentSpending,
      spendingPercentage: budgetLimit > 0 ? (currentSpending / budgetLimit) * 100 : 0
    };
  },
};

