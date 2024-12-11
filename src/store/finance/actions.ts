import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { budgetService } from "./src/budget";
import { categoryService } from "./src/category";
import { incomeExpenseService } from "./src/incomeExpense";
import { insightService } from "./src/insight";
import { transactionService } from "./src/transaction";
import { trendAnalysisService } from "./src/trend";
import { store } from "./store";

const useFinanceStore = () => {
  return {
    isSetUP:  store.isSetUP,
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
    getTotalBalance: budgetService.getTotalBalance,
    recalculateBudgets: budgetService.recalculateBudgets,
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
    getMonthlyIncome: incomeExpenseService.getMonthlyIncome,
    getTotalExpenses: incomeExpenseService.getTotalExpenses,
    getMonthlyExpenses: incomeExpenseService.getMonthlyExpenses,
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

export default useFinanceStore;