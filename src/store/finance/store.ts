import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import { FinanceStore, BudgetRuleType } from './types';
import { trendAnalysisService, budgetService, incomeExpenseService, categoryService, insightService, transactionService } from './services';


  const initial: FinanceStore = {
    transactions: {},
    categories: {},
    customCategories: [],
    budgetConfig: {
      rule: BudgetRuleType.RULE_50_30_20,
      monthlyIncome: 0,
      savingsGoals: {},
      paymentSchedule: {
        payFrequency: 'monthly',
        nextPayday: new Date().toISOString(),
      },
    },
    insights: {
      guiltFreeBalance: 0,
      monthlySpendingByCategory: {},
      savingsProgress: {},
      projectedSavings: 0,
      unusualSpending: [],
      trends: {
        monthly: {},
        categoryTrends: {},
      },
    },
    alerts: {
      categoryOverspend: [],
      upcomingBills: [],
      savingsGoalProgress: {},
      unusualTransactions: [],
      upcomingRecurringTransactions: [],
    },
    metadata: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      incomeCategories: ['salary', 'investments', 'freelance', 'other'],
      expenseCategories: ['housing', 'transportation', 'food', 'utilities', 'entertainment', 'healthcare'],
    },
  };

 export const store = observable(
    synced<FinanceStore>({
      initial,
      persist: {
        name: 'finance',
        plugin: ObservablePersistMMKV,
      },
    })
  );
const useFinancialStore = () => {

  return {
    // Transaction Management
    addTransaction: transactionService.addTransaction,
    updateTransaction: transactionService.updateTransaction,
    getTransactionsByCategory: transactionService.getTransactionsByCategory,
    getTransactions: transactionService.getTransactions,
    getTransactionsByDateRange: transactionService.getTransactionsByDateRange,

    // Category Management
    addCategory: categoryService.addCategory,
    updateCategory: categoryService.updateCategory,
    getCategoryBudget: categoryService.getCategoryBudget,
    getCategories: categoryService.getCategories,
    getCategoriesByType: categoryService.getCategoriesByType,

    // Budget Management
    updateMonthlyIncome: budgetService.updateMonthlyIncome,
    addSavingsGoal: budgetService.addSavingsGoal,
    updateSavingsProgress: budgetService.updateSavingsProgress,
    getSavingsProgress: budgetService.getSavingsProgress,

    // Insights & Analytics
    updateInsights: insightService.updateInsights,
    updateSpendingTrends: insightService.updateSpendingTrends,
    updateSavingsInsights: insightService.updateSavingsInsights,

    // Income/Expense Management and Analysis
    addIncome: incomeExpenseService.addIncome,
    addExpense: incomeExpenseService.addExpense,
    getTotalIncome: incomeExpenseService.getTotalIncome,
    getTotalExpenses: incomeExpenseService.getTotalExpenses,
    getIncomeExpenseSummary: incomeExpenseService.getIncomeExpenseSummary,
    getMonthlyBreakdown: incomeExpenseService.getMonthlyBreakdown,
    getAnnualSummary: incomeExpenseService.getAnnualSummary,
    getGuiltFreeBalance: budgetService.guiltFreeBalance,

    // Trend Analysis
    calculateIncomeGrowth: trendAnalysisService.calculateIncomeGrowth,
    getMonthlyIncomeTrend: trendAnalysisService.getMonthlyIncomeTrend,
    getTopExpenseCategories: trendAnalysisService.getTopExpenseCategories,
    calculateBudgetCompliance: trendAnalysisService.calculateBudgetCompliance,

    // Utility Methods
    updateIncomeStats: incomeExpenseService.updateIncomeStats,
    updateExpenseStats: incomeExpenseService.updateExpenseStats,
    checkBudgetAlerts: budgetService.checkBudgetAlerts,
    checkAlerts: budgetService.checkAlerts,

    // Export store for external access
    store,
  };
};

export default useFinancialStore;
