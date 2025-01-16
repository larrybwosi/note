import { LucideIcon } from 'lucide-react-native';
import { z } from 'zod';

// Base Enums
export enum IncomeCategory {
  SALARY = 'SALARY',
  BUSINESS = 'BUSINESS',
  INVESTMENTS = 'INVESTMENTS',
  SIDE_HUSTLE = 'SIDE_HUSTLE',
  GIFTS = 'GIFTS',
}

export enum ExpenseGroup {
  HOUSING = 'HOUSING',
  UTILITIES = 'UTILITIES',
  FOOD = 'FOOD',
  HEALTHCARE = 'HEALTHCARE',
  INSURANCE = 'INSURANCE',
  TRANSPORTATION = 'TRANSPORTATION',
  DEBT = 'DEBT',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
}

// Basic Schemas
export const CategoryTypeSchema = z.enum(['income', 'expense']);
export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const BudgetRuleTypeSchema = z.enum(['50/30/20', '70/20/10', '15/65/20', 'CUSTOM']);

// Color Scheme
export const ColorSchemeSchema = z.object({
  gradient: z.tuple([z.string(), z.string()]),
  accent: z.string(),
});

// Category Definition
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required'),
  type: CategoryTypeSchema,
  group: z.union([z.nativeEnum(IncomeCategory), z.nativeEnum(ExpenseGroup)]),
  icon: z.custom<LucideIcon>(),
  color: z.string(),
  colorScheme: ColorSchemeSchema.optional(),
  description: z.string(),
  budget: z.number().nonnegative(),
  isCustom: z.boolean().default(false),
});

// Transaction Schema with Category Reference
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().nonnegative(),
  category: z.string().uuid(), // References Category.id
  createdAt: z.string().datetime(),
  type: TransactionTypeSchema,
  description: z.string(),
});

// Savings Goal Schema
export const SavingsGoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  target: z.number().positive(),
  currentAmount: z.number().nonnegative(),
  deadline: z.string().datetime().optional(),
});

// Finance Profile Schema
export const FinanceProfileSchema = z.object({
  monthlyIncome: z.number().positive(),
  savingsGoal: z.number().nonnegative(),
  currency: z.string(),
  budgetRule: BudgetRuleTypeSchema,
});

// Budget Configuration Schema
export const BudgetConfigSchema = z.object({
  monthlyIncome: z.number().nonnegative(),
  rule: BudgetRuleTypeSchema,
  savingsGoals: z.record(z.string(), SavingsGoalSchema),
});

// Category Store Schema
export const CategoryStoreSchema = z.object({
  categories: z.record(z.string().uuid(), CategorySchema),
  customCategories: z.array(z.string().uuid()),
});

// Finance Store Schema with Category References
export const FinanceStoreSchema = z.object({
  isSetUp: z.boolean(),
  profile: FinanceProfileSchema.optional(),
  transactions: z.record(z.string().uuid(), TransactionSchema),
  budgetConfig: BudgetConfigSchema,
  insights: z.object({
    guiltFreeBalance: z.number().nonnegative(),
    monthlySpendingByCategory: z.record(z.string().uuid(), z.number().nonnegative()),
    savingsProgress: z.record(z.string().uuid(), z.number().nonnegative()),
    projectedSavings: z.number().nonnegative(),
    unusualSpending: z.array(z.unknown()),
    trends: z.object({
      monthly: z.record(z.string(), z.number()),
      categoryTrends: z.record(
        z.string().uuid(),
        z.object({
          trend: z.number(),
          average: z.number().nonnegative(),
        })
      ),
    }),
  }),
  categories: z.record(z.string(), CategorySchema),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    version: z.string(),
    currency: z.string(),
    timezone: z.string(),
  }),
});

// Category Definitions with Icons
export const INCOME_CATEGORIES: Record<IncomeCategory, { icon: string; description: string }> = {
  [IncomeCategory.SALARY]: {
    icon: '💰',
    description: 'Regular employment income, wages, and bonuses',
  },
  [IncomeCategory.INVESTMENTS]: {
    icon: '📈',
    description: 'Returns from stocks, bonds, real estate, and other investments',
  },
  [IncomeCategory.BUSINESS]: {
    icon: '🏢',
    description: 'Income from business operations and side hustles',
  },
  [IncomeCategory.SIDE_HUSTLE]: {
    icon: '💻',
    description: 'Income from freelance work and consulting',
  },
  [IncomeCategory.GIFTS]: {
    icon: '🎁',
    description: 'Monetary gifts and inheritance',
  },
};

export const EXPENSE_CATEGORIES: Record<ExpenseGroup, { icon: string; description: string }> = {
  [ExpenseGroup.HOUSING]: {
    icon: '🏠',
    description: 'Rent, mortgage, utilities, and home maintenance',
  },
  [ExpenseGroup.TRANSPORTATION]: {
    icon: '🚗',
    description: 'Car payments, fuel, public transit, and maintenance',
  },
  [ExpenseGroup.FOOD]: {
    icon: '🍔',
    description: 'Groceries, dining out, and food delivery',
  },
  [ExpenseGroup.UTILITIES]: {
    icon: '⚡',
    description: 'Electricity, water, internet, and phone bills',
  },
  [ExpenseGroup.ENTERTAINMENT]: {
    icon: '🎮',
    description: 'Movies, games, streaming services, and hobbies',
  },
  [ExpenseGroup.HEALTHCARE]: {
    icon: '💊',
    description: 'Medical bills, insurance, and medications',
  },
  [ExpenseGroup.DEBT]: {
    icon: '💳',
    description: 'Credit card payments, loans, and other debt',
  },
  [ExpenseGroup.INSURANCE]: {
    icon: '🛡️',
    description: 'Health, life, home, and vehicle insurance',
  },
  [ExpenseGroup.SHOPPING]: {
    icon: '🛍️',
    description: 'Clothing, electronics, and general shopping',
  },
};

// Type Exports
export type CategoryType = z.infer<typeof CategoryTypeSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type BudgetRuleType = z.infer<typeof BudgetRuleTypeSchema>;
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;
export type BudgetConfig = z.infer<typeof BudgetConfigSchema>;
export type CategoryStore = z.infer<typeof CategoryStoreSchema>;
export type FinanceProfile = z.infer<typeof FinanceProfileSchema>;
export type FinanceStore = z.infer<typeof FinanceStoreSchema>;
