import financeStore from './store';
import {
  BudgetRuleType,
  Category,
  CategoryId,
  CategoryType,
  ExpenseGroup,
  FinanceInsights,
  FinanceStore,
  IncomeCategory,
  Transaction,
} from './types';
import {
  calculateBudgetAllocations,
  calculateCategorySpending,
  calculateExpensesByGroup,
  calculateGuiltFreeBalance,
  calculateIncomeByCategory,
  calculateSavingsProgress,
  detectUnusualSpending,
  projectSavings,
} from './utils/calculations';
import {
  createCategory,
  getCategoriesBySubgroup,
  getCategoriesByType,
  isCategoryValid,
} from './utils/category';
import {
  createTransaction,
  getMonthlyTransactions,
  useGetTransactionsByCategory,
} from './utils/transactions';

export const updateInsights = (store: FinanceStore): FinanceInsights => {
  const allocations = calculateBudgetAllocations(store.budgetConfig);
  const monthlySpendingByCategory = Object.keys(store.categories).reduce(
    (acc, categoryId) => ({
      ...acc,
      [categoryId]: calculateCategorySpending(store.transactions, categoryId),
    }),
    {} as Record<string, number>
  );

  return {
    monthlySpendingByCategory,
    guiltFreeBalance: calculateGuiltFreeBalance(store, allocations),
    savingsProgress: calculateSavingsProgress(store.budgetConfig.savingsGoals),
    projectedSavings: projectSavings(store),
    unusualSpending: detectUnusualSpending(store),
    trends: {
      monthly: {},
      categoryTrends: {},
    },
  };
};

export const useFinanceStore = () => {
  const { store } = financeStore();

  // Transaction Management
  const addTransaction = (
    transaction: Omit<Transaction, 'id' | 'date' | 'time' | 'status' | 'category'>
  ) => {
    // if (!isCategoryValid(transaction.categoryId, store.get())) {
    //   throw new Error(`Invalid category ID: ${transaction.categoryId}`);
    // }

    const newTransaction = createTransaction(transaction);
    console.log(newTransaction);

    store.transactions.set({
      ...store.transactions.get(),
      [newTransaction.id]: newTransaction,
    });

    store.insights.set(updateInsights(store.get()));
    return newTransaction;
  };

  const getTransactions = (date?: Date) => getMonthlyTransactions(store.transactions.get(), date);

  // Category Management
  const addCustomCategory = (categoryData: Omit<Category, 'id' | 'isDefault' | 'isArchived'>) => {
    const newCategory = createCategory(categoryData);
    store.categories.set({
      ...store.categories.get(),
      [newCategory.id]: newCategory,
    });
    store.customCategories.set([...store.customCategories.get(), newCategory.id]);
    return newCategory;
  };

  const addCategory = (categoryData: Omit<Category, 'id' | 'isDefault' | 'isArchived'>) => {
    const newCategory = createCategory(categoryData);
    store.categories.set({
      ...store.categories.get(),
      [newCategory.id]: newCategory,
    });
  };

  const archiveCategory = (categoryId: CategoryId) => {
    const categories = store.categories.get();
    const category = categories[categoryId];

    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    if (!category.isDefault) {
      store.categories.set({
        ...categories,
        [categoryId]: {
          ...category,
          isArchived: true,
        },
      });
    } else {
      throw new Error('Cannot archive default categories');
    }
  };

  const deleteCategory = (categoryId: CategoryId) => {
    const categories = store.categories.get();
    const { [categoryId]: removed, ...remaining } = categories;
    store.categories.set(remaining);
  };

  // Reporting & Analytics
  const getIncomeSummary = (date: Date = new Date()) =>
    Object.values(IncomeCategory).reduce(
      (summary, group) => ({
        ...summary,
        [group]: calculateIncomeByCategory(store.get(), group, date),
      }),
      {} as Record<IncomeCategory, number>
    );

  const getExpenseSummary = (date: Date = new Date()) =>
    Object.values(ExpenseGroup).reduce(
      (summary, group) => ({
        ...summary,
        [group]: calculateExpensesByGroup(store.get(), group, date),
      }),
      {} as Record<ExpenseGroup, number>
    );

  // Budget Management
  const updateBudgetRule = (rule: BudgetRuleType, monthlyIncome?: number) => {
    store.budgetConfig.set({
      ...store.budgetConfig.get(),
      rule,
      ...(monthlyIncome !== undefined && { monthlyIncome }),
    });
    store.insights.set(updateInsights(store.get()));
  };

  const calculateAllocations = () => calculateBudgetAllocations(store.budgetConfig.get());

  const totalIncome = () => store.budgetConfig.get().monthlyIncome;
  const currentBalance = () => store.insights.get().guiltFreeBalance;


  return {
    store,
    // Transaction Management
    addTransaction,
    getTransactions,

    // Category Management
    addCategory,
    addCustomCategory,
    archiveCategory,
    deleteCategory,
    getCategoriesByType: (type: CategoryType) => getCategoriesByType(store.get(), type),
    getCategoriesBySubgroup: (type: CategoryType, subgroup: ExpenseGroup | IncomeCategory) =>
      getCategoriesBySubgroup(store.get(), type, subgroup),
    useGetTransactionsByCategoryId: (categoryId: CategoryId) =>
      useGetTransactionsByCategory(categoryId),
    // Reporting & Analytics
    getIncomeSummary,
    getExpenseSummary,

    // Budget Management
    calculateBudgetAllocations: calculateAllocations,
    updateBudgetRule,

    // Insights
    updateInsights: () => {
      store.insights.set(updateInsights(store.get()));
    },
  };
};

export default useFinanceStore;
