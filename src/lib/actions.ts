import { FinanceStore, FinanceProfile, Transaction, SavingsGoal, BudgetRuleType, TransactionSchema, FinanceProfileSchema, SavingsGoalSchema, IncomeCategory, ExpenseGroup, Category, CategorySchema } from './types';
import { store } from './store';
import { LucideIcon } from 'lucide-react-native';

interface SetupFinanceParams {
  monthlyIncome: number;
  currency: string;
  budgetRule: BudgetRuleType;
  savingsGoal: number;
}

interface CreateTransactionParams {
  amount: number;
  categoryId: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
}

interface UpdateTransactionParams extends Partial<Omit<CreateTransactionParams, 'type'>> {
  id: string;
}

interface CreateSavingsGoalParams {
  name: string;
  target: number;
  deadline?: string;
}


interface CreateCustomCategoryParams {
  name: string;
  type: 'income' | 'expense';
  group: IncomeCategory | ExpenseGroup;
  icon: LucideIcon;
  color: string;
  description: string;
  budget?: number;
}

interface UpdateBudgetParams {
  categoryId: string;
  amount: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

const randomId =() => Math.random().toString()
export const useFinance = () => {
  // Setup Functions
  const setupFinance = (params: SetupFinanceParams): boolean => {
    try {
      const profile: FinanceProfile = {
        monthlyIncome: params.monthlyIncome,
        currency: params.currency,
        budgetRule: params.budgetRule,
        savingsGoal: params.savingsGoal,
      };

      // Validate profile data
      FinanceProfileSchema.parse(profile);

      // Update store
      store.set((prev: FinanceStore) => ({
        ...prev,
        isSetUp: true,
        profile,
        budgetConfig: {
          ...prev.budgetConfig,
          monthlyIncome: params.monthlyIncome,
          rule: params.budgetRule,
        },
        metadata: {
          ...prev.metadata,
          currency: params.currency,
          lastUpdated: new Date().toISOString(),
        },
      }));

      return true;
    } catch (error) {
      console.error('Setup failed:', error);
      return false;
    }
  };

  // Transaction Functions
  const createTransaction = (params: CreateTransactionParams): string | null => {
    try {
      const transaction: Transaction = {
        id: randomId(),
        amount: params.amount,
        category: params.categoryId,
        type: params.type,
        description: params.description,
        createdAt: new Date().toISOString(),
      };

      // Validate transaction data
      TransactionSchema.parse(transaction);

      // Update store
      store.transactions[transaction.id].set(transaction);
      updateInsights();

      return transaction.id;
    } catch (error) {
      console.error('Transaction creation failed:', error);
      return null;
    }
  };

  const updateTransaction = (params: UpdateTransactionParams): boolean => {
    try {
      const currentTransaction = store.transactions[params.id].get();
      if (!currentTransaction) return false;

      const updatedTransaction: Transaction = {
        ...currentTransaction,
        ...params,
      };

      // Validate updated transaction
      TransactionSchema.parse(updatedTransaction);

      // Update store
      store.transactions[params.id].set(updatedTransaction);
      updateInsights();

      return true;
    } catch (error) {
      console.error('Transaction update failed:', error);
      return false;
    }
  };

  const deleteTransaction = (id: string): boolean => {
    try {
      if (!store.transactions[id].get()) return false;

      // Remove from store
      store.transactions[id].delete();
      updateInsights();

      return true;
    } catch (error) {
      console.error('Transaction deletion failed:', error);
      return false;
    }
  };

  // Savings Goals Functions
  const createSavingsGoal = (params: CreateSavingsGoalParams): string | null => {
    try {
      const goal: SavingsGoal = {
        id: randomId(),
        name: params.name,
        target: params.target,
        currentAmount: 0,
        deadline: params.deadline,
      };

      // Validate savings goal
      SavingsGoalSchema.parse(goal);

      // Update store
      store.budgetConfig.savingsGoals[goal.id].set(goal);
      updateInsights();

      return goal.id;
    } catch (error) {
      console.error('Savings goal creation failed:', error);
      return null;
    }
  };

  // Private helper functions
  const updateInsights = () => {
    const transactions = store.transactions.get();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate monthly spending by category
    const monthlySpending: Record<string, number> = {};
    Object.values(transactions).forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear &&
        transaction.type === 'EXPENSE'
      ) {
        monthlySpending[transaction.category] =
          (monthlySpending[transaction.category] || 0) + transaction.amount;
      }
    });

    // Update insights in store
    store.insights.monthlySpendingByCategory.set(monthlySpending);
    store.metadata.lastUpdated.set(new Date().toISOString());

    // Calculate other insights (simplified for example)
    const totalExpenses = Object.values(monthlySpending).reduce((sum, amount) => sum + amount, 0);
    const monthlyIncome = store.profile.get()?.monthlyIncome || 0;
    store.insights.guiltFreeBalance.set(Math.max(0, monthlyIncome - totalExpenses));
  };


  // Category Management Functions
  const createCustomCategory = (params: CreateCustomCategoryParams): string | null => {
    try {
      const category: Category = {
        id: randomId(),
        name: params.name,
        type: params.type,
        group: params.group,
        icon: params.icon,
        color: params.color,
        description: params.description,
        budget: params.budget || 0,
        isCustom: true,
      };

      // Validate category
      CategorySchema.parse(category);

      // Update store
      store.categories[category.id].set(category);
      // store.categories.push(category.id);

      return category.id;
    } catch (error) {
      console.error('Custom category creation failed:', error);
      return null;
    }
  };

  const deleteCustomCategory = (categoryId: string): boolean => {
    try {
      const category = store.categories[categoryId].get();
      if (!category || !category.isCustom) return false;

      // Check if category is in use
      const transactions = Object.values(store.transactions.get());
      const isInUse = transactions.some(t => t.category === categoryId);
      if (isInUse) {
        throw new Error('Category is in use by existing transactions');
      }

      // Remove from store
      store.categories[categoryId].delete();

      return true;
    } catch (error) {
      console.error('Custom category deletion failed:', error);
      return false;
    }
  };

  // Budget Management Functions
  const updateCategoryBudget = (params: UpdateBudgetParams): boolean => {
    try {
      const category = store.categories[params.categoryId].get();
      if (!category) return false;

      store.categories[params.categoryId].set({
        ...category,
        budget: params.amount
      });
      updateBudgetInsights();
      return true;
    } catch (error) {
      console.error('Budget update failed:', error);
      return false;
    }
  };

  const updateBudgetRule = (rule: BudgetRuleType): boolean => {
    try {
      store.budgetConfig.rule.set(rule);
      updateBudgetInsights();
      return true;
    } catch (error) {
      console.error('Budget rule update failed:', error);
      return false;
    }
  };

  // Analysis Functions
  const getTransactionsByDate = (range: DateRange) => {
    const transactions = store.transactions.get();
    return Object.values(transactions).filter(transaction => {
      const date = new Date(transaction.createdAt);
      return date >= range.startDate && date <= range.endDate;
    });
  };

  const getMonthlyTransactions = (month: number = new Date().getMonth(), year: number = new Date().getFullYear()) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return getTransactionsByDate({ startDate, endDate });
  };

  const getMonthlyStats = () => {
    const transactions = getMonthlyTransactions();
    const incomes = transactions.filter(t => t.type === 'INCOME');
    const expenses = transactions.filter(t => t.type === 'EXPENSE');

    return {
      totalIncome: incomes.reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      netIncome: incomes.reduce((sum, t) => sum + t.amount, 0) - expenses.reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactions.length,
      averageTransaction: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length || 0,
    };
  };

  const getCategorySpending = (categoryId: string, months: number = 1) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = getTransactionsByDate({ startDate, endDate });
    return transactions
      .filter(t => t.category === categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTrends = () => {
    const currentMonth = new Date().getMonth();
    const monthlyTrends: Record<string, number> = {};
    const categoryTrends: Record<string, { trend: number; average: number }> = {};

    // Calculate last 6 months of trends
    for (let i = 0; i < 6; i++) {
      const month = (currentMonth - i + 12) % 12;
      const year = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      const transactions = getMonthlyTransactions(month, year);
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      monthlyTrends[`${year}-${month + 1}`] = total;
    }

    // Calculate category trends
    const categories = store.categories.get();
    Object.keys(categories).forEach(categoryId => {
      const sixMonthSpending = getCategorySpending(categoryId, 6);
      const threeMonthSpending = getCategorySpending(categoryId, 3);
      const trend = (threeMonthSpending / 3) - (sixMonthSpending / 6);
      const average = sixMonthSpending / 6;

      categoryTrends[categoryId] = { trend, average };
    });

    // Update store
    store.insights.trends.monthly.set(monthlyTrends);
    store.insights.trends.categoryTrends.set(categoryTrends);
  };

  const getBudgetStatus = () => {
    const monthlyStats = getMonthlyStats();
    const categories = store.categories.get();
    const budgetStatus: Record<string, { 
      spent: number; 
      budget: number; 
      remaining: number; 
      percentUsed: number 
    }> = {};

    Object.values(categories).forEach(category => {
      const spent = getCategorySpending(category.id);
      const remaining = Math.max(0, category.budget - spent);
      budgetStatus[category.id] = {
        spent,
        budget: category.budget,
        remaining,
        percentUsed: (spent / category.budget) * 100,
      };
    });

    return {
      categoryStatus: budgetStatus,
      totalBudget: Object.values(categories).reduce((sum, c) => sum + c.budget, 0),
      totalSpent: monthlyStats.totalExpenses,
      overallRemaining: Object.values(budgetStatus).reduce((sum, s) => sum + s.remaining, 0),
    };
  };

  const predictNextMonthExpenses = () => {
    const categoryTrends = store.insights.trends.categoryTrends.get();
    const predictions: Record<string, number> = {};

    Object.entries(categoryTrends).forEach(([categoryId, data]) => {
      predictions[categoryId] = data.average + data.trend;
    });

    return {
      predictions,
      totalPredicted: Object.values(predictions).reduce((sum, amount) => sum + amount, 0),
    };
  };

  // Private helper functions
  const updateBudgetInsights = () => {
    const budgetStatus = getBudgetStatus();
    calculateTrends();
    
    store.insights.projectedSavings.set(
      store.profile.get()?.monthlyIncome || 0 - budgetStatus.totalSpent
    );
    
    // Update last modified timestamp
    store.metadata.lastUpdated.set(new Date().toISOString());
  };
  return {
    setupFinance,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createSavingsGoal,
    isSetUp: store.isSetUp.get(),
    createCustomCategory,
    deleteCustomCategory,
    updateCategoryBudget,
    updateBudgetRule,
    getMonthlyStats,
    getTransactionsByDate,
    getCategorySpending,
    getBudgetStatus,
    predictNextMonthExpenses,
    calculateTrends,
  };
};