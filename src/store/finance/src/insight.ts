import { store } from "../store";
import { transactionService } from "./transaction";
import { Transaction } from "./types";

export const insightService = {
  updateInsights: async (): Promise<void> => {
    await insightService.updateSpendingTrends();
    await insightService.updateSavingsInsights();
    await insightService.detectUnusualSpending();
    store.metadata.lastUpdated.set(new Date().toISOString());
  },

  updateSpendingTrends: async (): Promise<void> => {
    const categories = Object.keys(store.categories.get());
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    for (const categoryId of categories) {
      const transactions = transactionService.getTransactionsByCategory(categoryId, sixMonthsAgo, now);
      const monthlyTotals = insightService.calculateMonthlyTotals(transactions);
      store.insights.trends.categoryTrends[categoryId].set({
        trend: insightService.calculateTrend(monthlyTotals),
        average: insightService.calculateAverage(monthlyTotals),
      });
    }
  },

  updateSavingsInsights: async (): Promise<void> => {
    const goals = Object.values(store.budgetConfig.savingsGoals.get());
    const progress: Record<string, number> = {};
    
    for (const goal of goals) {
      const progressPercentage = (goal.currentAmount / goal.target) * 100;
      progress[goal.id] = progressPercentage;
    }
    
    store.insights.savingsProgress.set(progress);
  },

  detectUnusualSpending: async (): Promise<void> => {
    // Implementation for detecting unusual spending
    // This is a placeholder and should be replaced with actual logic
  },

  calculateMonthlyTotals: (transactions: Transaction[]): Record<string, number> => {
    return transactions.reduce((acc, tx) => {
      const month = new Date(tx.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  },

  calculateTrend: (monthlyTotals: Record<string, number>): number => {
    const values = Object.values(monthlyTotals);
    if (values.length < 2) return 0;
    
    const firstMonth = values[0];
    const lastMonth = values[values.length - 1];
    return ((lastMonth - firstMonth) / firstMonth) * 100;
  },

  calculateAverage: (monthlyTotals: Record<string, number>): number => {
    const values = Object.values(monthlyTotals);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  },
};
