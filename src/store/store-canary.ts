import { observable } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced } from "@legendapp/state/sync";
import {
  Transaction,
  Category,
  Budget,
  BudgetRuleType,
  BudgetPeriodType,
  BudgetRuleGroups,
} from "src/types/transaction";
import {
  calcTotalDaysInPeriod,
  createUniqueId,
  formatPeriodLabel,
  getCurrentMonthDateRange,
  getDateRangeForPeriod,
} from "src/utils/store";
import useShoppingStore from "./shopping";
import { BudgetCollection, BudgetSpending, BudgetStatusResult, FinanceSummary, SpendingTrends, TransactionResult } from "./store-types";

// Define the store structure using observables
export const store = observable(
  synced({
    initial: {
      transactions: [] as Transaction[],
      categories: [] as Category[],
      budgets: [] as Budget[],
      isSetup: false,
    },
    persist: {
      name: "financestore",
      plugin: ObservablePersistMMKV,
    },
  })
);


const actions = {
  // Transaction operations
  addTransaction: (transaction: Transaction): TransactionResult => {
    // First, check if there's an active budget
    const activeBudget = store.budgets.get().find((b) => b.status === "active");

    if (activeBudget) {
      // Find the category allocation group for this transaction's category
      const categoryAllocationGroup = activeBudget.categoryAllocations.find(
        (group) => group.categories.includes(transaction.categoryId)
      );

      if (categoryAllocationGroup) {
        // Calculate the allocated amount for this category group
        const groupAllocation =
          (categoryAllocationGroup.percentage / 100) * activeBudget.amount;

        // Calculate existing spending for this category in the current budget period
        const existingSpending = store.transactions
          .get()
          .filter(
            (t) =>
              t.categoryId === transaction.categoryId &&
              t.type === "expense" &&
              new Date(t.date) >= new Date(activeBudget.startDate) &&
              new Date(t.date) <= new Date(activeBudget.endDate)
          )
          .reduce((total, t) => total + t.amount, 0);

        // Check if the new transaction would exceed the category group's allocation
        const totalAfterNewTransaction =
          existingSpending +
          (transaction.type === "expense" ? transaction.amount : 0);

        if (totalAfterNewTransaction > groupAllocation) {
          // Return an object indicating the budget limit issue
          return {
            success: false,
            error: {
              message: "Transaction exceeds budget category limit",
              details: {
                categoryName: store.categories
                  .get()
                  .find((c) => c.id === transaction.categoryId)?.name,
                currentSpending: existingSpending,
                newTransactionAmount: transaction.amount,
                groupAllocation: groupAllocation,
                wouldExceedBy: totalAfterNewTransaction - groupAllocation,
              },
            },
          };
        }
      }
    }

    // If no issues, proceed with adding the transaction
    const newTransaction = {
      ...transaction,
      id: transaction.id || createUniqueId(),
    };

    store.transactions.push(newTransaction);

    return {
      success: true,
      transaction: newTransaction,
    };
  },

  updateTransaction: (transaction: Transaction): boolean => {
    const index = store.transactions.findIndex(
      (t) => t.id.get() === transaction.id
    );
    if (index !== -1) {
      store.transactions[index].set(transaction);
      return true;
    }
    return false;
  },

  deleteTransaction: (id: string): boolean => {
    const index = store.transactions.get().findIndex((t) => t.id === id);
    if (index !== -1) {
      store.transactions[index].delete();
      return true;
    }
    return false;
  },

  // Category operations
  addCategory: (
    category: Category
  ): { success: boolean; category?: Category; error?: string } => {
    // Check if the category already exists
    const isDuplicate = store.categories
      .get()
      .some(
        (existingCategory) =>
          existingCategory.name.toLowerCase() === category.name.toLowerCase()
      );

    if (!isDuplicate) {
      // Add the category if it doesn't already exist
      const newCategory = { ...category, id: category.id || createUniqueId() };
      store.categories.push(newCategory);
      return { success: true, category: newCategory };
    }

    return {
      success: false,
      error: `Category "${category.name}" already exists.`,
    };
  },

  updateCategory: (category: Category): boolean => {
    const index = store.categories.findIndex((c) => c.id.get() === category.id);
    if (index !== -1) {
      store.categories[index].set(category);
      return true;
    }
    return false;
  },

  deleteCategory: (id: string): boolean => {
    const index = store.categories.findIndex((c) => c.id.get() === id);
    if (index !== -1) {
      store.categories[index].delete();
      return true;
    }
    return false;
  },

  // Financial calculations combined into a single function
  getSummary: (dateRange?: {
    startDate?: Date;
    endDate?: Date;
  }): FinanceSummary => {
    const transactions = store.transactions.get();
    const { startDate, endDate } = dateRange || {};

    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });

    let totalIncome = 0;
    let totalSpent = 0;

    // Calculate both values in a single iteration
    filteredTransactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else if (t.type === "expense") {
        totalSpent += t.amount;
      }
    });

    const balance = totalIncome - totalSpent;

    // Calculate percentage spent based on active budgets
    const totalBudget = store.budgets
      .get()
      .filter((budget) => budget.status === "active")
      .reduce((sum, budget) => sum + budget.amount, 0);

    const percentageSpent =
      totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100;

    return {
      balance,
      totalSpent,
      totalIncome,
      percentageSpent,
    };
  },

  getCategoryMonthlyTotal: (categoryId: string): number => {
    const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

    return store.transactions
      .get()
      .filter(
        (t) =>
          t.categoryId === categoryId &&
          new Date(t.date) >= startOfMonth &&
          new Date(t.date) <= endOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getCategoryTransactions: (
    categoryId: string,
    startDate?: Date,
    endDate?: Date
  ): Transaction[] => {
    const transactions = store.transactions.get();

    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.categoryId === categoryId &&
        (!startDate || transactionDate >= startDate) &&
        (!endDate || transactionDate <= endDate)
      );
    });
  },

  // Budget operations
  createBudget: (budgetData: {
    name: string;
    amount: number;
    periodType: BudgetPeriodType;
    ruleType: BudgetRuleType;
    startDate: Date;
    categoryAllocations: BudgetRuleGroups[];
  }): Budget => {
    const {
      name,
      amount,
      periodType,
      ruleType,
      startDate,
      categoryAllocations,
    } = budgetData;

    // Calculate end date based on period type
    const { endDate } = getDateRangeForPeriod(periodType, startDate);
    const activeBudgetInfo = actions.getActiveBudgetSpending();
    const isThereActiveBudget = activeBudgetInfo?.budget?.id !== undefined;

    const { createShoppingList, setActiveList } = useShoppingStore();

    // Create the budget in draft status
    const newBudget: Budget = {
      id: createUniqueId(),
      name,
      amount,
      startDate,
      endDate,
      periodType,
      ruleType,
      categoryAllocations,
      status: isThereActiveBudget ? "draft" : "active",
    };

    const createdListId = createShoppingList(name, {
      budget: amount,
      name,
      renewalInterval: Number(periodType),
    });

    if (!isThereActiveBudget) {
      setActiveList(createdListId);
    }

    store.budgets.push(newBudget);
    return newBudget;
  },

  activateBudget: (budgetId: string): Budget | null => {
    // First deactivate any currently active budgets
    store.budgets
      .get()
      .filter((budget) => budget.status === "active")
      .forEach((_, index) => {
        store.budgets[index].status.set("expired");
      });

    // Then activate the selected budget
    const targetIndex = store.budgets.findIndex((b) => b.id.get() === budgetId);
    if (targetIndex !== -1) {
      store.budgets[targetIndex].status.set("active");
      return store.budgets[targetIndex].get();
    }

    return null;
  },

  deleteBudget: (id: string): boolean => {
    const index = store.budgets.findIndex((b) => b.id.get() === id);
    if (index !== -1) {
      store.budgets[index].delete();
      return true;
    }
    return false;
  },

  checkBudgetStatus: (): BudgetStatusResult => {
    const now = new Date();
    const expiredBudgets: string[] = [];

    store.budgets
      .get()
      .filter((b) => b.status === "active" && now > new Date(b.endDate))
      .forEach((budget) => {
        const index = store.budgets.findIndex((b) => b.id.get() === budget.id);
        if (index !== -1) {
          store.budgets[index].status.set("expired");
          expiredBudgets.push(budget.id);
        }
      });

    return {
      needsRenewal: expiredBudgets.length > 0,
      expiredBudgetIds: expiredBudgets,
    };
  },

  getBudgetById: (budgetId: string): Budget | undefined => {
    return store.budgets.get().find((b) => b.id === budgetId);
  },

  updateBudget: (budget: Partial<Budget> & { id: string }): Budget | null => {
    const index = store.budgets.findIndex((b) => b.id.get() === budget.id);

    if (index !== -1) {
      const currentBudget = store.budgets[index].get();

      // Only allow updates to drafts or if changing status
      if (currentBudget.status !== "draft" && budget.status === undefined) {
        console.warn("Cannot update an active or expired budget");
        return currentBudget;
      }

      // Apply updates
      const updatedBudget = {
        ...currentBudget,
        ...budget,
      };

      store.budgets[index].set(updatedBudget);
      return updatedBudget;
    }

    return null;
  },

  renewBudget: (expiredBudgetId: string): Budget | null => {
    const budget = store.budgets.get().find((b) => b.id === expiredBudgetId);

    if (budget && budget.status === "expired") {
      // Calculate new dates
      const newStartDate = new Date(); // Start from today
      const { endDate: newEndDate } = getDateRangeForPeriod(
        budget.periodType,
        newStartDate
      );

      // Create new budget with same parameters but new period
      const newBudget: Budget = {
        ...budget,
        id: createUniqueId(),
        startDate: newStartDate,
        endDate: newEndDate,
        status: "draft", // Start as draft
      };

      store.budgets.push(newBudget);
      return newBudget;
    }

    return null;
  },

  getActiveBudgetSpending: (): BudgetSpending | null => {
    const activeBudget = store.budgets.get().find((b) => b.status === "active");
    if (!activeBudget) return null;

    const startDate = new Date(activeBudget.startDate);
    const endDate = new Date(activeBudget.endDate);
    const transactions = store.transactions.get();
    const categories = store.categories.get();

    // Filter once for all budget-period transactions
    const budgetPeriodTransactions = transactions.filter(
      (t) =>
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endDate &&
        t.type === "expense"
    );

    let totalSpent = 0;

    const groupSpending = activeBudget.categoryAllocations.map((group) => {
      // Get transactions for this group's categories
      const groupTransactions = budgetPeriodTransactions.filter((t) =>
        group.categories.includes(t.categoryId)
      );

      const spent = groupTransactions.reduce((sum, t) => sum + t.amount, 0);
      totalSpent += spent;

      const allocated = (group.percentage / 100) * activeBudget.amount;

      return {
        groupName: group.name,
        allocated,
        spent,
        remaining: allocated - spent,
        percentUsed: allocated > 0 ? (spent / allocated) * 100 : 0,
        transactions: groupTransactions,
        // Include category details for reference
        categories: group.categories.map((categoryId) => ({
          id: categoryId,
          name: categories.find((c) => c.id === categoryId)?.name || "",
        })),
      };
    });

    const totalRemaining = activeBudget.amount - totalSpent;

    return {
      budget: activeBudget,
      groups: groupSpending,
      totalSpent,
      totalRemaining,
      percentUsed: (totalSpent / activeBudget.amount) * 100,
      startDate,
      endDate,
    };
  },

  getAllBudgets: (): BudgetCollection => {
    const budgets = store.budgets.get();

    return {
      active: budgets.find((b) => b.status === "active"),
      expired: budgets.filter((b) => b.status === "expired"),
      drafts: budgets.filter((b) => b.status === "draft"),
    };
  },

  getTransactionsByDateRange: (
    startDate: Date,
    endDate: Date
  ): Transaction[] => {
    return store.transactions
      .get()
      .filter(
        (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
      );
  },

  getSpendingTrendsByCategory: (
    periodType: "week" | "month" | "year",
    count: number = 6
  ): SpendingTrends => {
    const now = new Date();
    const periods: { start: Date; end: Date; label: string }[] = [];

    // Generate periods
    for (let i = 0; i < count; i++) {
      const periodEnd = new Date(now);
      let periodStart: Date;

      switch (periodType) {
        case "week":
          periodEnd.setDate(now.getDate() - i * 7);
          periodStart = new Date(periodEnd);
          periodStart.setDate(periodEnd.getDate() - 7);
          break;
        case "month":
          periodEnd.setMonth(now.getMonth() - i);
          periodEnd.setDate(0); // Last day of previous month
          periodStart = new Date(
            periodEnd.getFullYear(),
            periodEnd.getMonth(),
            1
          );
          break;
        case "year":
          periodEnd.setFullYear(now.getFullYear() - i);
          periodEnd.setMonth(11, 31); // Dec 31
          periodStart = new Date(periodEnd.getFullYear(), 0, 1); // Jan 1
          break;
      }

      periods.push({
        start: periodStart,
        end: periodEnd,
        label: formatPeriodLabel(periodStart, periodEnd, periodType),
      });
    }

    // Get all transactions once
    const allTransactions = store.transactions.get();

    // Get expense categories
    const expenseCategories = store.categories
      .get()
      .filter((cat) => cat.type === "expense");

    // Calculate spending for each category in each period
    const categoryTrends = expenseCategories.map((category) => {
      const periodData = periods.map((period) => {
        const transactions = allTransactions.filter(
          (t) =>
            t.categoryId === category.id &&
            new Date(t.date) >= period.start &&
            new Date(t.date) <= period.end &&
            t.type === "expense"
        );

        return {
          period: period.label,
          amount: transactions.reduce((sum, t) => sum + t.amount, 0),
        };
      });

      return {
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        data: periodData,
      };
    });

    return {
      periods: periods.map((p) => p.label).reverse(),
      categoryTrends,
    };
  },
};

const useStore = () => actions;
export default useStore;
