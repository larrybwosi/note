import { z } from 'zod';

export const CategoryTypeSchema = z.enum(['income', 'expense']);

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: CategoryTypeSchema,
  budget: z.number(),
});

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  category: CategorySchema,
  createdAt: z.string(),
  type: TransactionTypeSchema,
  description:z.string()
});

export const BudgetRuleTypeSchema = z.enum(['50/30/20', '70/20/10', '15/65/20', 'CUSTOM']);

export const SavingsGoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  target: z.number(),
  currentAmount: z.number(),
  deadline: z.string().optional(),
});

export const BudgetConfigSchema = z.object({
  monthlyIncome: z.number(),
  rule: BudgetRuleTypeSchema,
  savingsGoals: z.record(z.string(), SavingsGoalSchema),
});

export const IncomeExpenseSummarySchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netIncome: z.number(),
  incomeByCategory: z.record(z.string(), z.number()),
  expensesByCategory: z.record(z.string(), z.number()),
  savingsRate: z.number(),
});

export const MonthlyBreakdownSchema = z.object({
  month: z.string(),
  income: z.number(),
  expenses: z.number(),
  net: z.number(),
  categories: z.record(z.string(), z.number()),
});
