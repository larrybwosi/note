import {
  Category,
  Transaction,
  CurrencyAmount,
  TransactionType,
  FinanceStoreSchema,
  CategorySchema,
  TransactionSchema,
  Percentage,
  BudgetRule,
  PREDEFINED_BUDGET_RULES,
  PredefinedBudgetRuleId,
  PREDEFINED_CATEGORY_GROUPS,
  Id,
  CategoryBudget,
  CategoryHealth,
  BudgetAlert,
  CategoryId,
  TransactionId,
} from './types';
import { createStore } from './store';

const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36)}`;

export const useFinanceStore = () => {
  const store = createStore();

  // ============================================================================
  // Category Management
  // ============================================================================

  const createCategory = (categoryData: Omit<Category, 'id' | 'isCustom'>): Category => {
    const id = generateId('ctg');
    const category = CategorySchema.parse({
      ...categoryData,
      id,
      isCustom: true,
    });

    store.categories[id].set(category);
    return category;
  };

  const updateCategory = (
    categoryId: Id,
    updates: Partial<Omit<Category, 'id' | 'type' | 'groupId'>>
  ): Category => {
    const existingCategory = store.categories[categoryId].get();
    if (!existingCategory) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    const updatedCategory = CategorySchema.parse({
      ...existingCategory,
      ...updates,
    });

    store.categories[categoryId].set(updatedCategory);
    updateCategoryHealth(categoryId);
    return updatedCategory;
  };

  const deleteCategory = (categoryId: Id): void => {
    const hasTransactions = Object.values(store.transactions.get()).some(
      (t) => t.categoryId === categoryId
    );

    if (hasTransactions) {
      throw new Error('Cannot delete category with existing transactions');
    }

    store.categories[categoryId].delete();
    store.categoryHealth[categoryId].delete();
  };

  // ============================================================================
  // Transaction Management
  // ============================================================================

  const createTransaction = (transactionData: Omit<Transaction, 'id'>): Transaction => {
    const id = generateId('txn');
    const transaction = TransactionSchema.parse({
      ...transactionData,
      id,
    });

    store.transactions[id].set(transaction);
    updateBudgetForTransaction(transaction);
    updateCategoryHealth(transaction.categoryId);
    updateFinancialInsights();
    return transaction;
  };

  const updateTransaction = (
    transactionId: Id,
    updates: Partial<Omit<Transaction, 'id' | 'type'>>
  ): Transaction => {
    const existingTransaction = store.transactions[transactionId].get();
    if (!existingTransaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    reverseBudgetForTransaction(existingTransaction);

    const updatedTransaction = TransactionSchema.parse({
      ...existingTransaction,
      ...updates,
    });

    store.transactions[transactionId].set(updatedTransaction);
    updateBudgetForTransaction(updatedTransaction);
    updateCategoryHealth(updatedTransaction.categoryId);
    updateFinancialInsights();

    return updatedTransaction;
  };

  const deleteTransaction = (transactionId: Id): void => {
    const transaction = store.transactions[transactionId].get();
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    reverseBudgetForTransaction(transaction);
    store.transactions[transactionId].delete();
    updateCategoryHealth(transaction.categoryId);
    updateFinancialInsights();
  };

  // ============================================================================
  // Budget Management
  // ============================================================================

  const setBudgetRule = (ruleId: PredefinedBudgetRuleId | Id) => {
    const predefinedRule = PREDEFINED_BUDGET_RULES[ruleId as PredefinedBudgetRuleId];
    const customRule = store.budgetRules.rules[ruleId].get();

    if (!predefinedRule && !customRule) {
      throw new Error(`Budget rule not found: ${ruleId}`);
    }

    store.budgetRules.active.set(ruleId);
    reallocateBudgets();
  };

  const createCustomBudgetRule = (
    name: string,
    allocations: { needs: number; wants: number; savings: number },
    categoryAllocations?: Record<Id, number>
  ): BudgetRule => {
    const id = generateId('bgr');
    const rule: BudgetRule = {
      name,
      allocations,
    };

    store.budgetRules.rules[id].set(rule);
    return rule;
  };

  const setCategoryBudget = (
    categoryId: Id,
    amount: CurrencyAmount,
    options?: {
      rollover?: boolean;
      alerts?: {
        warningThreshold?: number;
        criticalThreshold?: number;
      };
    }
  ): CategoryBudget => {
    const category = store.categories[categoryId].get();
    if (!category || category.type !== TransactionType.EXPENSE) {
      throw new Error(`Invalid expense category: ${categoryId}`);
    }

    const budget: CategoryBudget = {
      categoryId,
      amount,
      spent: calculateCategorySpent(categoryId),
      remaining: amount,
      rollover: options?.rollover ?? false,
      alerts: options?.alerts
        ? {
            warningThreshold: options.alerts.warningThreshold ?? 80,
            criticalThreshold: options.alerts.criticalThreshold ?? 95,
          }
        : undefined,
    };

    // store.categoryBudgets[categoryId].set(budget);
    updateCategoryHealth(categoryId);
    return budget;
  };

  // ============================================================================
  // Analysis and Insights
  // ============================================================================

  const updateCategoryHealth = (categoryId: Id): void => {
    const category = store.categories[categoryId].get();
    // const budget = store.categoryBudgets[categoryId].get();

    if (!category || category.type !== TransactionType.EXPENSE) {
      return;
    }

    const spending = calculateMonthlySpending(categoryId, 3);
    const averageSpending = (spending.reduce((sum, amount) => sum + amount, 0) /
      3) as CurrencyAmount;
    const trend = determineTrend(spending);
    const budget = store.budgets[categoryId].get();
    const budgetUtilization = budget ? (Number(budget.spent) / Number(budget.amount)) * 100 : 0;
    const status = getHealthStatus(budgetUtilization);

    const health: CategoryHealth = {
      categoryId,
      status,
      trend,
      averageSpending,
      recommendation: generateRecommendation(category, {
        budgetUtilization,
        trend,
        averageSpending,
      }),
    };

    store.categoryHealth[categoryId].set(health);
  };

  const updateFinancialInsights = (): void => {
    // const totalIncome = calculateTotalByType(TransactionType.INCOME);
    // const totalExpenses = calculateTotalByType(TransactionType.EXPENSE);
    // const netSavings = Math.max(0, totalIncome - totalExpenses) as CurrencyAmount;
    // const savingsRate =
    //   totalIncome > 0 ? (((netSavings / totalIncome) * 100) as Percentage) : (0 as Percentage);

    // store.insights.set({
    //   summary: {
    //     totalIncome: totalIncome as CurrencyAmount,
    //     totalExpenses: totalExpenses as CurrencyAmount,
    //     netSavings,
    //     savingsRate,
    //   },
    //   categoryAnalysis: store.categoryHealth.get(),
    //   trends: {
    //     income: calculateTrend(TransactionType.INCOME),
    //     expenses: calculateTrend(TransactionType.EXPENSE),
    //     savings: calculateSavingsTrend(),
    //   },
    // });
  };

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const calculateCategorySpent = (categoryId: Id): CurrencyAmount => {
    const transactions = store.transactions.get();
    return Object.values(transactions)
      .filter((t) => t.categoryId === categoryId && t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0) as CurrencyAmount;
  };

  const calculateTotalByType = (type: TransactionType): number => {
    const transactions = store.transactions.get();
    return Object.values(transactions)
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const updateBudgetForTransaction = (transaction: Transaction): void => {
    if (transaction.type !== TransactionType.EXPENSE) return;

    const budget = store.budgets[transaction.categoryId].get();
    if (!budget) return;

    const newSpent = Number(budget.spent) + Number(transaction.amount);
    const newRemaining = Math.max(0, Number(budget.amount) - newSpent);

    store.budgets[transaction.categoryId].set({
      ...budget,
      spent: newSpent as CurrencyAmount,
      remaining: newRemaining as CurrencyAmount,
    });
  };

  const reverseBudgetForTransaction = (transaction: Transaction): void => {
    if (transaction.type !== TransactionType.EXPENSE) return;

    const budget = store.budgets[transaction.categoryId].get();
    if (!budget) return;

    const newSpent = Math.max(0, Number(budget.spent) - Number(transaction.amount));
    const newRemaining = Number(budget.amount) - newSpent;

    store.budgets[transaction.categoryId].set({
      ...budget,
      spent: newSpent as CurrencyAmount,
      remaining: newRemaining as CurrencyAmount,
    });
  };

  const reallocateBudgets = (): void => {
    const totalIncome = calculateTotalByType(TransactionType.INCOME);
    const activeRule = getActiveBudgetRule();
    const categories = store.categories.get();

    Object.values(categories)
      .filter((category) => category.type === TransactionType.EXPENSE)
      .forEach((category) => {
        const groupData = PREDEFINED_CATEGORY_GROUPS[category.group];
        if (!groupData?.defaultBudgetAllocation) return;

        const allocation =
          activeRule.allocations?.[category.id as keyof typeof activeRule.allocations] ?? groupData.defaultBudgetAllocation;

        const amount = (totalIncome * (allocation / 100)) as CurrencyAmount;
        setCategoryBudget(category.id, amount);
      });
  };

  const getActiveBudgetRule = (): BudgetRule => {
    const activeRuleId = store.budgetRules.active.get();
    const predefinedRule = PREDEFINED_BUDGET_RULES[activeRuleId as PredefinedBudgetRuleId];
    const customRule = store.budgetRules.rules[activeRuleId].get();

    if (!predefinedRule && !customRule) {
      throw new Error('No active budget rule found');
    }

    return (
      customRule ?? {
        id: activeRuleId,
        name: predefinedRule.name,
        isCustom: false,
        allocations: predefinedRule.allocations,
      }
    );
  };

  // Budget Management
  const createBudget = (
    categoryId: CategoryId,
    amount: CurrencyAmount,
    options?: {
      rollover?: boolean;
      alerts?: {
        warningThreshold?: number;
        criticalThreshold?: number;
      };
    }
  ) => {
    const category = store.categories[categoryId].get();
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    const budget = {
      categoryId,
      amount,
      spent: calculateCategorySpent(categoryId),
      remaining: amount as CurrencyAmount,
      rollover: options?.rollover ?? false,
      alerts: {
        warningThreshold: options?.alerts?.warningThreshold ?? 80,
        criticalThreshold: options?.alerts?.criticalThreshold ?? 95,
      },
    };

    store.budgets[categoryId].set(budget);
    updateCategoryHealth(categoryId);
    return budget;
  };

  // Guilt-Free Balance Management
  const calculateGuiltFreeBalance = (): number => {
    const totalIncome = calculateTotalIncome();
    const rule = PREDEFINED_BUDGET_RULES[store.budgetRules.active.get()];
    const wantsAllocation = rule.allocations.wants / 100;

    const currentDate = new Date();
    const nextPayday = getNextPayday(currentDate);

    const wantsBudget = totalIncome * wantsAllocation;
    const wantsSpent = calculateWantsSpending();

    return {
      amount: Math.max(0, wantsBudget - wantsSpent) as CurrencyAmount,
      nextAllowance: nextPayday,
      spentThisPeriod: wantsSpent as CurrencyAmount,
    };
  };

  // Notification System
  const checkBudgetAlerts = () => {
    const budgets = store.budgets.get();
    const alerts: BudgetAlert[] = [];

    Object.values(budgets).forEach((budget) => {
      const percentUsed = (Number(budget.spent) / Number(budget.amount)) * 100;

      if (percentUsed >= budget?.alerts?.criticalThreshold!) {
        alerts.push({
          categoryId: budget.categoryId,
          type: 'critical',
          message: `Critical: ${store.categories[budget.categoryId].get()?.name} budget is at ${percentUsed.toFixed(1)}%`,
          timestamp: new Date(),
          percentage: percentUsed,
        });
      } else if (percentUsed >= budget?.alerts?.warningThreshold!) {
        alerts.push({
          categoryId: budget.categoryId,
          type: 'warning',
          message: `Warning: ${store.categories[budget.categoryId].get()?.name} budget is at ${percentUsed.toFixed(1)}%`,
          timestamp: new Date(),
          percentage: percentUsed,
        });
      }
    });

    store.alerts.set(alerts);
    return alerts;
  };

  // Helper Functions
  const getBudgetAllocation = (category: 'needs' | 'wants' | 'savings'): number => {
    const rule = PREDEFINED_BUDGET_RULES[store.budgetRules.active.get()];
    return rule.allocations[category];
  };

  const calculateTotalIncome = (): number => {
    const transactions = store.transactions.get();
    return Object.values(transactions)
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const calculateWantsSpending = (): number => {
    const transactions = store.transactions.get();
    const categories = store.categories.get();

    return Object.values(transactions)
      .filter((t) => {
        const category = categories[t.categoryId];
        return t.type === TransactionType.EXPENSE && category.budgetCategory === 'wants';
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const calculateMonthlySpending = (categoryId: CategoryId, months: number): number[] => {
    const transactions = store.transactions.get();
    const spending: number[] = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTotal = Object.values(transactions)
        .filter(
          (t) =>
            t.categoryId === categoryId &&
            t.type === TransactionType.EXPENSE &&
            new Date(t.date) >= monthStart &&
            new Date(t.date) <= monthEnd
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      spending.unshift(monthTotal);
    }

    return spending;
  };

  const determineTrend = (amounts: number[]): 'improving' | 'stable' | 'worsening' => {
    if (amounts.length < 2) return 'stable';

    const recentChange = amounts[amounts.length - 1] - amounts[amounts.length - 2];
    const changePercentage = (recentChange / amounts[amounts.length - 2]) * 100;

    if (changePercentage < -5) return 'improving';
    if (changePercentage > 5) return 'worsening';
    return 'stable';
  };

  const getHealthStatus = (percentUsed: number): 'good' | 'warning' | 'critical' => {
    if (percentUsed < 80) return 'good';
    if (percentUsed < 95) return 'warning';
    return 'critical';
  };

  const generateRecommendation = (
    category: Category,
    data: {
      percentUsed: number;
      trend: 'improving' | 'stable' | 'worsening';
      averageSpending: CurrencyAmount;
    }
  ): string => {
    if (data.trend === 'worsening' && data.percentUsed > 90) {
      return `Consider reducing ${category.name} expenses or increasing the budget. Spending trend is increasing.`;
    }
    if (data.trend === 'improving' && data.percentUsed < 70) {
      return `Great job managing ${category.name} expenses! Consider allocating excess to savings.`;
    }
    return `${category.name} spending is within normal ranges.`;
  };

  const getNextPayday = (currentDate: Date): Date => {
    // Assume payday is the 1st and 15th of each month
    const date = new Date(currentDate);
    if (date.getDate() < 15) {
      date.setDate(15);
    } else {
      date.setMonth(date.getMonth() + 1);
      date.setDate(1);
    }
    return date;
  };


  const getCategories = (): Category[] => {
    return Object.values(store.categories.get()).map((c) => c);
  };

  const getCategory = (categoryId: CategoryId): Category => {
    const category = PREDEFINED_CATEGORY_GROUPS[categoryId as keyof typeof PREDEFINED_CATEGORY_GROUPS]
      ? PREDEFINED_CATEGORY_GROUPS[categoryId as keyof typeof PREDEFINED_CATEGORY_GROUPS]
      : store.categories.get()[categoryId];
      console.log(category)
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }
    return category;
  };

  const getTransaction = (transactionId: TransactionId): Transaction => {
    const transaction = store.transactions[transactionId].get();
    if (!transaction) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }
    return transaction;
  };

  const getTransactions = (): Transaction[] => {
    return Object.values(store.transactions.get()).map((t) => t);
  };

  const getTransactionsByCategory = (categoryId: CategoryId): Transaction[] => {
    return getTransactions().filter((t) => t.categoryId === categoryId);
  };
  
  // Helper function to update insights
  const updateInsights = (): void => {
    const incomeTotal = Object.values(calculateCategoryTotals(TransactionType.INCOME)).reduce(
      (sum, amount) => sum + Number(amount),
      0
    );

    const expenseTotal = Object.values(calculateCategoryTotals(TransactionType.EXPENSE)).reduce(
      (sum, amount) => sum + Number(amount),
      0
    );

    const savingsRate = calculateSavingsRate();
    const savingsAmount = Math.max(0, incomeTotal - expenseTotal);

    store.insights.set({
      income: {
        total: incomeTotal as CurrencyAmount,
        byCategory: calculateCategoryTotals(TransactionType.INCOME),
        trend: calculateMonthlyTrend(TransactionType.INCOME),
      },
      expenses: {
        total: expenseTotal as CurrencyAmount,
        byCategory: calculateCategoryTotals(TransactionType.EXPENSE),
        trend: calculateMonthlyTrend(TransactionType.EXPENSE),
      },
      savings: {
        total: savingsAmount as CurrencyAmount,
        rate: savingsRate,
        trend: calculateMonthlyTrend(TransactionType.INCOME).map((income, index) => {
          const expense = calculateMonthlyTrend(TransactionType.EXPENSE)[index];
          return Math.max(0, Number(income) - Number(expense)) as CurrencyAmount;
        }),
      },
    });
  };
  // Budget Operations
  const setBudget = (categoryId: CategoryId, amount: CurrencyAmount) => {
    const category = store.categories[categoryId].get();
    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    if (category.type === TransactionType.INCOME) {
      throw new Error('Cannot set budget for income categories');
    }

    const spent = calculateCategorySpent(categoryId);
    const budget = {
      categoryId,
      amount,
      spent,
      remaining: Math.max(0, Number(amount) - Number(spent)) as CurrencyAmount,
    };

    store.budgets[categoryId].set(budget);
    return budget;
  };

  const calculateSavingsRate = (): Percentage => {
    const transactions = store.transactions.get();

    const totalIncome = Object.values(transactions)
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = Object.values(transactions)
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalIncome === 0) return 0 as Percentage;

    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    // Ensure rate is between 0 and 100
    return Math.max(0, Math.min(100, savingsRate)) as Percentage;
  };

  

  const calculateCategoryTotals = (type: TransactionType): Record<CategoryId, CurrencyAmount> => {
    const transactions = store.transactions.get();
    const totals: Record<string, number> = {};

    Object.values(transactions)
      .filter((t) => t.type === type)
      .forEach((transaction) => {
        const current = totals[transaction.categoryId] || 0;
        totals[transaction.categoryId] = current + Number(transaction.amount);
      });

    // Convert to CurrencyAmount and ensure no negative values
    return Object.entries(totals).reduce(
      (acc, [categoryId, amount]) => ({
        ...acc,
        [categoryId]: Math.max(0, amount) as CurrencyAmount,
      }),
      {} as Record<CategoryId, CurrencyAmount>
    );
  };

  const calculateMonthlyTrend = (type: TransactionType, months: number = 12): CurrencyAmount[] => {
    const transactions = store.transactions.get();
    const now = new Date();
    const trend: CurrencyAmount[] = [];

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

      const monthTotal = Object.values(transactions)
        .filter((t) => {
          const transactionDate = new Date(t.date);
          return t.type === type && transactionDate >= monthStart && transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      trend.unshift(Math.max(0, monthTotal) as CurrencyAmount);
    }

    return trend;
  };

  // Export/Import Operations
  const exportStore = (): string => {
    return JSON.stringify(store.get(), null, 2);
  };

  const importStore = (data: string): void => {
    const parsed = JSON.parse(data);
    const validated = FinanceStoreSchema.parse(parsed);
    store.set(validated);
  };

  return {
    store,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    setBudgetRule,
    getTransaction,
    getCategories,
    getTransactions,
    getTransactionsByCategory,
    calculateCategorySpent,
    calculateGuiltFreeBalance,
    updateBudgetForTransaction,
    reverseBudgetForTransaction,
    calculateCategoryTotals,
    calculateMonthlyTrend,
    checkBudgetAlerts,
    exportStore,
    importStore,
  };
};