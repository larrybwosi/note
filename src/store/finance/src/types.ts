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
});

export const BudgetRuleTypeSchema = z.enum(['RULE_50_30_20', 'RULE_70_20_10', 'RULE_15_65_20', 'CUSTOM']);

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

export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type BudgetRuleType = z.infer<typeof BudgetRuleTypeSchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;
export type IncomeExpenseSummary = z.infer<typeof IncomeExpenseSummarySchema>;
export type MonthlyBreakdown = z.infer<typeof MonthlyBreakdownSchema>;
