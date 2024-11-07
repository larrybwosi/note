import { Category, BudgetRuleType, MonthlyBreakdown, TransactionType, IncomeExpenseSummary, SavingsGoal, Transaction, CategoryType } from './types';
import { calculateGuiltFreeBalance } from './calculations';
import { store } from './store';



export const categoryService = {
  addCategory: ( category: Category): void => {
    store.categories[category.name].set(category);
  },

  getCategories: (): Category[] => {
    return Object.values(store.categories).map((cat) => cat.get());
  },

  getCategoriesByType: (type: CategoryType): Category[] => {
    const categories: Category[] = Object.values(store.categories.get());
  
    return categories.filter(cat => cat.type === type);
  },

  updateCategory: ( id: string, updates: Partial<Category>): void => {
    if (store.categories[id].get()) {
      store.categories[id].assign(updates);
    }
  },

  getCategoryBudget: ( name: string): number => {
    const category = store.categories[name].get();
    const monthlyIncome = store.budgetConfig.monthlyIncome.get();
    const rule = store.budgetConfig.rule.get();
    
    if (category && monthlyIncome) {
      return budgetService.calculateCategoryBudget(category.type, monthlyIncome, rule);
    }
    return 0;
  },
};

export const transactionService = {
  addTransaction: async ( transaction: Transaction): Promise<void> => {
    store.transactions[transaction.id].set(transaction);
    await insightService.updateInsights();
    budgetService.checkAlerts();
  },

  updateTransaction: async ( id: string, updates: Partial<Transaction>): Promise<void> => {
    if (store.transactions[id].get()) {
      store.transactions[id].assign(updates);
      await insightService.updateInsights();
    }
  },

  getTransactionsByCategory: ( categoryName: string, startDate?: Date, endDate?: Date): Transaction[] => {
    const transactions = Object.values(store.transactions.get());
    return transactions.filter((tx) => {
      const withinDateRange = startDate && endDate 
        ? new Date(tx.createdAt) >= startDate && new Date(tx.createdAt) <= endDate
        : true;
      return tx.category.name === categoryName && withinDateRange;
    });
  },

  getTransactionsByDateRange: ( startDate: Date, endDate: Date): Transaction[] => {
    return Object.values(store.transactions.get()).filter((tx) =>
      new Date(tx.createdAt) >= startDate && new Date(tx.createdAt) <= endDate
    );
  },
};

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


export const incomeExpenseService = {
  addIncome: async ( transaction: Transaction): Promise<void> => {
    if (!incomeExpenseService.validateIncomeTransaction(transaction)) {
      throw new Error('Invalid income transaction');
    }

    transaction.type = TransactionType.INCOME;
    await transactionService.addTransaction(transaction);
    await incomeExpenseService.updateIncomeStats();
  },

  addExpense: async ( transaction: Transaction): Promise<void> => {
    if (!incomeExpenseService.validateExpenseTransaction(transaction)) {
      throw new Error('Invalid expense transaction');
    }

    transaction.type = TransactionType.EXPENSE;
    transaction.amount = Math.abs(transaction.amount) * -1; // Ensure negative amount
    await transactionService.addTransaction(transaction);
    await incomeExpenseService.updateExpenseStats();
  },

  getIncomeExpenseSummary: async ( startDate: Date, endDate: Date): Promise<IncomeExpenseSummary> => {
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
    
    const summary: IncomeExpenseSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      netIncome: 0,
      incomeByCategory: {},
      expensesByCategory: {},
      savingsRate: 0
    };

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        summary.totalIncome += tx.amount;
        summary.incomeByCategory[tx.category.name] = (summary.incomeByCategory[tx.category.name] || 0) + tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        summary.totalExpenses += Math.abs(tx.amount);
        summary.expensesByCategory[tx.category.name] = (summary.expensesByCategory[tx.category.name] || 0) + Math.abs(tx.amount);
      }
    }

    summary.netIncome = summary.totalIncome - summary.totalExpenses;
    summary.savingsRate = summary.totalIncome > 0 
      ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 
      : 0;

    return summary;
  },

  getMonthlyBreakdown: async ( year: number, month: number): Promise<MonthlyBreakdown> => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate);
    
    const breakdown: MonthlyBreakdown = {
      month: `${year}-${String(month).padStart(2, '0')}`,
      income: 0,
      expenses: 0,
      net: 0,
      categories: {}
    };

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        breakdown.income += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        breakdown.expenses += Math.abs(tx.amount);
      }
      breakdown.categories[tx.category.name] = (breakdown.categories[tx.category.name] || 0) + 
        (tx.type === TransactionType.INCOME ? tx.amount : Math.abs(tx.amount));
    }

    breakdown.net = breakdown.income - breakdown.expenses;
    return breakdown;
  },

  getTotalIncome: () => {
    const transactions = Object.values(store.transactions.get());
    return transactions.reduce((sum, tx) => sum + (tx.type === TransactionType.INCOME ? tx.amount : 0), 0);
  },

  getTotalExpenses: () => {
    const transactions = Object.values(store.transactions.get());
    return transactions.reduce((sum, tx) => sum + (tx.type === TransactionType.EXPENSE ? Math.abs(tx.amount) : 0), 0);
  },

  getAnnualSummary: async ( year: number): Promise<Record<string, MonthlyBreakdown>> => {
    const summary: Record<string, MonthlyBreakdown> = {};
    
    for (let month = 1; month <= 12; month++) {
      summary[String(month).padStart(2, '0')] = await incomeExpenseService.getMonthlyBreakdown(year, month);
    }
    
    return summary;
  },

  updateIncomeStats: async (): Promise<void> => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyIncome = await incomeExpenseService.getIncomeExpenseSummary(startOfMonth, today);
    store.insights.monthlyIncome?.set(monthlyIncome.totalIncome);
    
    await insightService.updateInsights();
  },

  updateExpenseStats: async (): Promise<void> => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthlyExpenses = await incomeExpenseService.getIncomeExpenseSummary(startOfMonth, today);
    store.insights.monthlyExpenses.set(monthlyExpenses.totalExpenses);
    
    await insightService.updateInsights();
    await budgetService.checkBudgetAlerts();
  },

  validateIncomeTransaction: ( transaction: Transaction): boolean => {
    return (
      transaction.amount > 0 &&
      !!transaction.createdAt &&
      !!transaction.category.name &&
      store.metadata.incomeCategories.get().includes(transaction.category.name)
    );
  },

  validateExpenseTransaction: ( transaction: Transaction): boolean => {
    return (
      transaction.amount !== 0 &&
      !!transaction.createdAt &&
      !!transaction.category.name &&
      store.metadata.expenseCategories.get().includes(transaction.category.name)
    );
  },
};


export const trendAnalysisService = {
  calculateIncomeGrowth: async ( months: number = 12): Promise<number> => {
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

  getMonthlyIncomeTrend: async ( startDate: Date, endDate: Date): Promise<Record<string, number>> => {
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate)
      .filter(tx => tx.type === TransactionType.INCOME);
    
    return transactions.reduce((acc, tx) => {
      const month = new Date(tx.createdAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);
  },

  getTopExpenseCategories: async ( startDate: Date, endDate: Date, limit: number = 5): Promise<Array<{category: string, amount: number, percentage: number}>> => {
    const transactions = transactionService.getTransactionsByDateRange(startDate, endDate)
      .filter(tx => tx.type === TransactionType.EXPENSE);
    
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

  calculateBudgetCompliance: async ( categoryId: string): Promise<{
    withinBudget: boolean;
    currentSpending: number;
    budgetLimit: number;
    remainingBudget: number;
    spendingPercentage: number;
  }> => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const transactions = transactionService.getTransactionsByCategory(categoryId, startOfMonth, today)
      .filter(tx => tx.type === TransactionType.EXPENSE);
    
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

export const budgetService = {
  updateMonthlyIncome: ( amount: number): void => {
    store.budgetConfig.monthlyIncome.set(amount);
    budgetService.recalculateBudgets();
  },

  addSavingsGoal: ( goal: SavingsGoal): void => {
    store.budgetConfig.savingsGoals[goal.id].set(goal);
  },

  updateSavingsProgress: ( goalId: string, amount: number): void => {
    if (store.budgetConfig.savingsGoals[goalId].get()) {
      store.budgetConfig.savingsGoals[goalId].currentAmount.set(amount);
      insightService.updateSavingsInsights();
    }
  },

  checkBudgetAlerts: async (): Promise<void> => {
    const categories = Object.keys(store.categories.get());
    
    for (const categoryId of categories) {
      const compliance = await trendAnalysisService.calculateBudgetCompliance(categoryId);
      
      if (compliance.spendingPercentage >= 90) {
        store.alerts.categoryOverspend.push({
          categoryId,
          currentSpending: compliance.currentSpending,
          budgetLimit: compliance.budgetLimit,
          date: new Date().toISOString(),
          type: 'categoryOverspend',
          message: `You are spending more than 90% of your budget on ${store.categories.get()[categoryId].name}. Consider adjusting your spending habits or increasing your budget.`,
          severity: 'high',
          read: false
        });
      }
    }
  },

  checkAlerts: async (): Promise<void> => {
    await budgetService.checkBudgetAlerts();
  },

  calculateCategoryBudget: (categoryType: string, monthlyIncome: number, budgetRule: BudgetRuleType): number => {
    // Implementation of budget calculation based on category type and budget rule
    // This is a placeholder implementation and should be replaced with actual logic
    switch (budgetRule) {
      case BudgetRuleType.RULE_50_30_20:
        if (categoryType === 'needs') return monthlyIncome * 0.5;
        if (categoryType === 'wants') return monthlyIncome * 0.3;
        if (categoryType === 'savings') return monthlyIncome * 0.2;
        break;
      case BudgetRuleType.RULE_70_20_10:
        if (categoryType === 'needs') return monthlyIncome * 0.7;
        if (categoryType === 'wants') return monthlyIncome * 0.2;
        if (categoryType === 'savings') return monthlyIncome * 0.1;
        break;
      case BudgetRuleType.RULE_15_65_20:
        if (categoryType === 'needs') return monthlyIncome * 0.15;
        if (categoryType === 'wants') return monthlyIncome * 0.65;
        if (categoryType === 'savings') return monthlyIncome * 0.2;
        break;
      case BudgetRuleType.CUSTOM:
        if (categoryType === 'needs') return monthlyIncome * 0.3;
        if (categoryType === 'wants') return monthlyIncome * 0.2;
        if (categoryType === 'savings') return monthlyIncome * 0.5;
        break;
    }
    return 0;
  },
  guiltFreeBalance: (): number => {
    const transactions = store.transactions.get();
    return calculateGuiltFreeBalance(transactions, store.budgetConfig.get());
  },

  recalculateBudgets: (): void => {
    const categories = Object.values(store.categories.get());
    const monthlyIncome = store.budgetConfig.monthlyIncome.get();
    const rule = store.budgetConfig.rule.get();

    for (const category of categories) {
      const budget = budgetService.calculateCategoryBudget(category.type, monthlyIncome, rule);
      store.categories[category.name].budget.set(budget);
    }
  },
};