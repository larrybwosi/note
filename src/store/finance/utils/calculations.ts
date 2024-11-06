import {
  BudgetConfig,
  BudgetRuleType,
  CategoryType,
  ExpenseGroup,
  SavingsGoal,
  Transaction,
  TransactionType,
} from '../types';
import { getMonthlyTransactions } from '../utils/transactions';
import { FinanceStore } from '../types';
import { differenceInMonths } from 'date-fns';

export const calculateCategorySpending = (
  transactions: Record<string, Transaction>,
  categoryId: string,
  date: Date = new Date()
): number =>
  getMonthlyTransactions(transactions, date)
    .filter((t) => t.categoryId === categoryId)
    .reduce((sum, t) => sum + t.amount, 0);

export const calculateIncomeByCategory = (
  store: FinanceStore,
  categoryId: string,
  date: Date = new Date()
): number =>
  getMonthlyTransactions(store.transactions, date)
    .filter((t) => t.categoryId === categoryId && t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);

export const calculateExpensesByGroup = (
  store: FinanceStore,
  group: ExpenseGroup,
  date: Date = new Date()
): number => {
  const categories = Object.values(store.categories)
    .filter((cat) => cat.group === CategoryType.EXPENSE && cat.subgroup === group)
    .map((cat) => cat.id);

  return getMonthlyTransactions(store.transactions, date)
    .filter((t) => categories.includes(t.categoryId) && t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
};

// utils/budgetUtils.ts
export const calculateBudgetAllocations = (budgetConfig: BudgetConfig): Record<string, number> => {
  const { monthlyIncome, selectedRule, customRules } = budgetConfig;

  const rules = {
    [BudgetRuleType.RULE_15_65_20]: {
      needs: 0.65,
      wants: 0.15,
      savings: 0.2,
    },
    [BudgetRuleType.RULE_50_30_20]: {
      needs: 0.5,
      wants: 0.3,
      savings: 0.2,
    },
    [BudgetRuleType.RULE_70_20_10]: {
      expenses: 0.7,
      savings: 0.2,
      debtOrDonation: 0.1,
    },
  };

  if (selectedRule === BudgetRuleType.CUSTOM) {
    return customRules.reduce(
      (acc, rule) => ({
        ...acc,
        [rule.categoryId]: monthlyIncome * (rule.percentage / 100),
      }),
      {}
    );
  }

  return Object.entries(rules[selectedRule]).reduce(
    (acc, [key, percentage]) => ({
      ...acc,
      [key]: monthlyIncome * percentage,
    }),
    {}
  );
};

// utils/insightUtils.ts
export const calculateGuiltFreeBalance = (
  store: FinanceStore,
  allocations: Record<string, number>
): number => {
  const monthlyTransactions = getMonthlyTransactions(store.transactions);

  const essentialExpenses = monthlyTransactions
    .filter((t) => t.isEssential)
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsContribution = monthlyTransactions
    .filter((t) => store.categories[t.categoryId]?.type === CategoryType.SAVINGS)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    store.budgetConfig.monthlyIncome -
    essentialExpenses -
    savingsContribution -
    (allocations.savings || 0)
  );
};

export const calculateSavingsProgress = (
  savingsGoals: Record<string, SavingsGoal>
): Record<string, number> =>
  Object.entries(savingsGoals).reduce(
    (acc, [id, goal]) => ({
      ...acc,
      [id]: (goal.currentAmount / goal.target) * 100,
    }),
    {}
  );

export const projectSavings = (store: FinanceStore, monthsAhead: number = 12): number => {
  const monthlyIncome = store.budgetConfig.monthlyIncome;
  const averageMonthlyExpenses = Object.values(store.transactions).reduce((sum, t) => {
    const months = differenceInMonths(new Date(), new Date(t.date));
    return sum + t.amount / Math.max(1, months);
  }, 0);

  const projectedMonthlySavings = monthlyIncome - averageMonthlyExpenses;
  return projectedMonthlySavings * monthsAhead;
};

export const detectUnusualSpending = (
  store: FinanceStore,
  threshold: number = 0.2
): { categoryId: string; amount: number; percentageIncrease: number }[] => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

  return Object.keys(store.categories)
    .map((categoryId) => {
      const currentSpending = calculateCategorySpending(store.transactions, categoryId, now);
      const lastMonthSpending = calculateCategorySpending(
        store.transactions,
        categoryId,
        lastMonth
      );

      if (lastMonthSpending === 0) return null;

      const percentageIncrease = (currentSpending - lastMonthSpending) / lastMonthSpending;

      return percentageIncrease > threshold
        ? {
            categoryId,
            amount: currentSpending,
            percentageIncrease,
          }
        : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};
