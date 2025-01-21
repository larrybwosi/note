import { LucideIcon } from 'lucide-react-native';
import { z } from 'zod';

// ============================================================================
// Primitive Types & Utilities
// ============================================================================

export const CurrencySchema = z.number().nonnegative();
export type CurrencyAmount = z.infer<typeof CurrencySchema>;

export const PercentageSchema = z.number().min(0).max(100);
export type Percentage = z.infer<typeof PercentageSchema>;

export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;

// ============================================================================
// Shared Enums & Constants
// ============================================================================

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  UPCOMING = 'UPCOMING',
}

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'none';

// ============================================================================
// Category System
// ============================================================================

export const CategoryGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  description: z.string(),
  defaultBudgetAllocation: PercentageSchema.optional(),
  isEssential: z.boolean().optional(),
});

export type CategoryGroup = z.infer<typeof CategoryGroupSchema>;

export const PREDEFINED_CATEGORY_GROUPS = {
  // Income Groups
  ACTIVE_INCOME: {
    id: 'ACTIVE_INCOME',
    name: 'Active Income',
    type: TransactionType.INCOME,
    description: 'Income from direct work or services',
  },
  PASSIVE_INCOME: {
    id: 'PASSIVE_INCOME',
    name: 'Passive Income',
    type: TransactionType.INCOME,
    description: 'Income from investments and assets',
  },
  // Expense Groups
  ESSENTIAL_NEEDS: {
    id: 'ESSENTIAL_NEEDS',
    name: 'Essential Needs',
    type: TransactionType.EXPENSE,
    description: 'Basic living expenses',
    isEssential: true,
    defaultBudgetAllocation: 50,
  },
  LIFESTYLE: {
    id: 'LIFESTYLE',
    name: 'Lifestyle',
    type: TransactionType.EXPENSE,
    description: 'Quality of life and discretionary spending',
    isEssential: false,
    defaultBudgetAllocation: 30,
  },
  FINANCIAL_GOALS: {
    id: 'FINANCIAL_GOALS',
    name: 'Financial Goals',
    type: TransactionType.EXPENSE,
    description: 'Savings, investments, and debt management',
    isEssential: true,
    defaultBudgetAllocation: 20,
  },
} as const;

export type PredefinedCategoryGroupId = keyof typeof PREDEFINED_CATEGORY_GROUPS;

const BaseCategorySchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  groupId: z.enum(
    Object.keys(PREDEFINED_CATEGORY_GROUPS) as [
      PredefinedCategoryGroupId,
      ...PredefinedCategoryGroupId[],
    ]
  ),
  icon: z.custom<LucideIcon>(),
  description: z.string(),
  tags: z.array(z.string()),
  isCustom: z.boolean(),
});

export const CategorySchema = z.discriminatedUnion('type', [
  BaseCategorySchema.extend({
    type: z.literal(TransactionType.INCOME),
    defaultTaxRate: PercentageSchema.optional(),
  }),
  BaseCategorySchema.extend({
    type: z.literal(TransactionType.EXPENSE),
    isEssential: z.boolean(),
    budgetAllocation: PercentageSchema.optional(),
  }),
]);

export type Category = z.infer<typeof CategorySchema>;

// ============================================================================
// Transaction System
// ============================================================================

const BaseTransactionSchema = z.object({
  id: IdSchema,
  amount: CurrencySchema,
  categoryId: IdSchema,
  description: z.string(),
  date: z.date(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
  recurringFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'none']).optional(),
  location: z.string().optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export const TransactionSchema = z.discriminatedUnion('type', [
  BaseTransactionSchema.extend({
    type: z.literal(TransactionType.INCOME),
    taxable: z.boolean(),
    taxRate: PercentageSchema.optional(),
  }),
  BaseTransactionSchema.extend({
    type: z.literal(TransactionType.EXPENSE),
    paymentMethod: z.enum(['cash', 'credit', 'debit', 'transfer']),
    receipt: z.string().optional(),
  }),
]);

export type Transaction = z.infer<typeof TransactionSchema>;

// ============================================================================
// Budget System
// ============================================================================

export const PREDEFINED_BUDGET_RULES = {
  '50/30/20': {
    name: '50/30/20 Rule',
    allocations: { needs: 50, wants: 30, savings: 20 },
  },
  '70/20/10': {
    name: '70/20/10 Rule',
    allocations: { needs: 70, wants: 20, savings: 10 },
  },
  'debt-focus': {
    name: 'Debt Focus',
    allocations: { needs: 60, wants: 10, savings: 30 },
  },
  'aggressive-savings': {
    name: 'Aggressive Savings',
    allocations: { needs: 40, wants: 20, savings: 40 },
  },
} as const;

export type PredefinedBudgetRuleId = keyof typeof PREDEFINED_BUDGET_RULES;

export const BudgetRuleSchema = z.object({
  id: IdSchema,
  name: z.string(),
  isCustom: z.boolean(),
  allocations: z
    .object({
      needs: PercentageSchema,
      wants: PercentageSchema,
      savings: PercentageSchema,
    })
    .refine((data) => data.needs + data.wants + data.savings === 100, {
      message: 'Budget allocations must sum to 100%',
    }),
  categoryAllocations: z.record(IdSchema, PercentageSchema).optional(),
});

export type BudgetRule = z.infer<typeof BudgetRuleSchema>;

export const CategoryBudgetSchema = z.object({
  categoryId: IdSchema,
  amount: CurrencySchema,
  spent: CurrencySchema,
  remaining: CurrencySchema,
  rollover: z.boolean().optional(),
  alerts: z
    .object({
      warningThreshold: PercentageSchema,
      criticalThreshold: PercentageSchema,
    })
    .optional(),
});

export type CategoryBudget = z.infer<typeof CategoryBudgetSchema>;

// ============================================================================
// Insights & Analytics
// ============================================================================

export const CategoryHealthSchema = z.object({
  categoryId: IdSchema,
  status: z.enum(['good', 'warning', 'critical']),
  trend: z.enum(['improving', 'stable', 'worsening']),
  averageSpending: CurrencySchema,
  budgetUtilization: PercentageSchema,
  recommendation: z.string().optional(),
});

export const FinancialInsightsSchema = z.object({
  summary: z.object({
    totalIncome: CurrencySchema,
    totalExpenses: CurrencySchema,
    netSavings: CurrencySchema,
    savingsRate: PercentageSchema,
  }),
  categoryAnalysis: z.record(IdSchema, CategoryHealthSchema),
  trends: z.object({
    income: z.array(z.tuple([z.date(), CurrencySchema])),
    expenses: z.array(z.tuple([z.date(), CurrencySchema])),
    savings: z.array(z.tuple([z.date(), CurrencySchema])),
  }),
});

// ============================================================================
// Store Schema
// ============================================================================

export const FinanceStoreSchema = z.object({
  categories: z.record(IdSchema, CategorySchema),
  transactions: z.record(IdSchema, TransactionSchema),
  budgetRules: z.object({
    activeRuleId: IdSchema,
    rules: z.record(IdSchema, BudgetRuleSchema),
  }),
  categoryBudgets: z.record(IdSchema, CategoryBudgetSchema),
  insights: FinancialInsightsSchema,
  settings: z.object({
    currency: z.string(),
    timezone: z.string(),
    notifications: z.object({
      enabled: z.boolean(),
      email: z.string().email().optional(),
      pushToken: z.string().optional(),
    }),
  }),
  metadata: z.object({
    lastUpdated: z.date(),
    version: z.string(),
  }),
});

export type FinanceStore = z.infer<typeof FinanceStoreSchema>;
