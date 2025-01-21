import { LucideIcon } from 'lucide-react-native';
import { z } from 'zod';

// ============================================================================
// Base Schemas & Primitive Types
// ============================================================================

export const CurrencySchema = z.number().nonnegative();

export const PercentageSchema = z.number().min(0).max(100);

export const CategoryIdSchema = z.string();

export const TransactionIdSchema = z.string();

// ============================================================================
// Transaction System
// ============================================================================

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  UPCOMING = 'UPCOMING',
}

const BaseTransactionSchema = z.object({
  id: TransactionIdSchema,
  amount: CurrencySchema,
  categoryId: CategoryIdSchema,
  description: z.string(),
  date: z.date(),
  tags: z.array(z.string()),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
  recurringFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly', 'none']).optional(),
  location: z.string().optional(),
  isEssential: z.boolean().optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
});

export const IncomeTransactionSchema = BaseTransactionSchema.extend({
  type: z.literal(TransactionType.INCOME),
  taxable: z.boolean().optional(),
  taxRate: PercentageSchema.optional(),
});

export const ExpenseTransactionSchema = BaseTransactionSchema.extend({
  type: z.literal(TransactionType.EXPENSE),
  paymentMethod: z.enum(['cash', 'credit', 'debit', 'transfer']).optional(),
  receipt: z.string().optional(),
});

export const TransactionSchema = z.discriminatedUnion('type', [
  IncomeTransactionSchema,
  ExpenseTransactionSchema,
]);

// ============================================================================
// Category System
// ============================================================================

export const CategoryGroup = {
  // Income Categories
  ACTIVE_INCOME: {
    id: 'ACTIVE_INCOME',
    type: TransactionType.INCOME,
    description: 'Income from direct work or services',
  },
  SIDE_HUSTLE: {
    id: 'PASSIVE_INCOME',
    type: TransactionType.INCOME,
    description: 'Income from investments and assets',
  },
  // Expense Categories
  ESSENTIALS: {
    id: 'ESSENTIALS',
    type: TransactionType.EXPENSE,
    description: 'Basic living expenses',
  },
  LIFESTYLE: {
    id: 'LIFESTYLE',
    type: TransactionType.EXPENSE,
    description: 'Quality of life and discretionary spending',
  },
  FINANCIAL: {
    id: 'FINANCIAL',
    type: TransactionType.EXPENSE,
    description: 'Savings, investments, and debt management',
  },
  HEALTHCARE: {
    id: 'HEALTHCARE',
    type: TransactionType.EXPENSE,
    description: 'Medical and wellness expenses',
  },
} as const;

const BaseCategorySchema = z.object({
  id: CategoryIdSchema,
  name: z.string().min(1),
  group: z.enum(Object.keys(CategoryGroup) as [CategoryGroupId, ...CategoryGroupId[]]),
  icon: z.custom<LucideIcon>(),
  description: z.string(),
  tags: z.array(z.string()),
  isCustom: z.boolean(),
});

export const IncomeCategorySchema = BaseCategorySchema.extend({
  type: z.literal(TransactionType.INCOME),
  defaultTaxRate: PercentageSchema.optional(),
});

export const ExpenseCategorySchema = BaseCategorySchema.extend({
  type: z.literal(TransactionType.EXPENSE),
  isEssential: z.boolean(),
  budgetAllocation: PercentageSchema.optional(),
});

export const CategorySchema = z.discriminatedUnion('type', [
  IncomeCategorySchema,
  ExpenseCategorySchema,
]);

// ============================================================================
// Budget System
// ============================================================================

export const BudgetRuleType = {
  FIFTY_THIRTY_TWENTY: '50/30/20',
  SEVENTY_TWENTY_TEN: '70/20/10',
  CUSTOM: 'CUSTOM',
} as const;
export type BudgetRuleType = (typeof BudgetRuleType)[keyof typeof BudgetRuleType];

export const BudgetRuleSchema = z.object({
  name: z.string(),
  allocations: z.object({
    needs: z.number(),
    wants: z.number(),
    savings: z.number(),
  }),
});

export const CategoryBudgetSchema = z.object({
  categoryId: CategoryIdSchema,
  amount: CurrencySchema,
  spent: CurrencySchema,
  remaining: CurrencySchema,
  rollover: z.boolean().optional(),
  alerts: z
    .object({
      warningThreshold: z.number(),
      criticalThreshold: z.number(),
    })
    .optional(),
});

export const BudgetAlertSchema = z.object({
  categoryId: CategoryIdSchema,
  type: z.enum(['warning', 'critical']),
  message: z.string(),
  timestamp: z.date(),
  percentage: z.number(),
});

// ============================================================================
// Financial Insights System
// ============================================================================

export const CategoryHealthSchema = z.object({
  categoryId: CategoryIdSchema,
  status: z.enum(['good', 'warning', 'critical']),
  trend: z.enum(['improving', 'stable', 'worsening']),
  averageSpending: CurrencySchema,
  recommendation: z.string().optional(),
});

export const FinancialInsightsSchema = z.object({
  income: z.object({
    total: CurrencySchema,
    byCategory: z.record(z.string(), CurrencySchema),
    trend: z.array(CurrencySchema),
  }),
  expenses: z.object({
    total: CurrencySchema,
    byCategory: z.record(z.string(), CurrencySchema),
    trend: z.array(CurrencySchema),
  }),
  savings: z.object({
    total: CurrencySchema,
    rate: PercentageSchema,
    trend: z.array(CurrencySchema),
  }),
});

// ============================================================================
// Store Schema
// ============================================================================

export const FinanceStoreSchema = z.object({
  categories: z.record(z.string(), CategorySchema),
  transactions: z.record(z.string(), TransactionSchema),
  budgets: z.record(z.string(), CategoryBudgetSchema),
  insights: FinancialInsightsSchema,
  settings: z.object({
    currency: z.string(),
    timezone: z.string(),
    budgetRule: z.enum(Object.values(BudgetRuleType) as [string, ...string[]]),
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
  budgetRules: z.object({
    active: z.string(),
    rules: z.record(z.string(), BudgetRuleSchema),
  }),
  alerts: z.array(BudgetAlertSchema),
  guiltFreeBalance: CurrencySchema,
  categoryHealth: z.record(z.string(), CategoryHealthSchema),
});

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

export const PREDEFINED_CATEGORY_GROUPS = {
  // Income Groups
  ACTIVE_INCOME: {
    id: 'ACTIVE_INCOME',
    name: 'Active Income',
    type: TransactionType.INCOME,
    description: 'Income from direct work or services',
  },
  SIDE_HUSTLE: {
    id: 'PASSIVE_INCOME',
    name: 'Passive Income',
    type: TransactionType.INCOME,
    description: 'Income from investments and assets',
  },
  GIFT: {
    id: 'GIFT',
    name: 'Gift',
    type: TransactionType.INCOME,
    description: 'Gifts and donations',
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

export const IdSchema = z.string().uuid();
export type Id = z.infer<typeof IdSchema>;
export type FinanceStore = z.infer<typeof FinanceStoreSchema>;
export type PredefinedBudgetRuleId = keyof typeof PREDEFINED_BUDGET_RULES;

export type BudgetRule = z.infer<typeof BudgetRuleSchema>;
export type CategoryBudget = z.infer<typeof CategoryBudgetSchema>;
export type BudgetAlert = z.infer<typeof BudgetAlertSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type IncomeCategory = z.infer<typeof IncomeCategorySchema>;
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export type CategoryGroup = typeof CategoryGroup;
export type CategoryGroupId = keyof typeof CategoryGroup;

export type Transaction = z.infer<typeof TransactionSchema>;
export type IncomeTransaction = z.infer<typeof IncomeTransactionSchema>;
export type ExpenseTransaction = z.infer<typeof ExpenseTransactionSchema>;

export type RecurrenceFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'none';
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export type Percentage = z.infer<typeof PercentageSchema>;
export type CurrencyAmount = z.infer<typeof CurrencySchema>;
export type CategoryId = z.infer<typeof CategoryIdSchema>;
export type TransactionId = z.infer<typeof TransactionIdSchema>;

export type CategoryHealth = z.infer<typeof CategoryHealthSchema>;
export type FinancialInsights = z.infer<typeof FinancialInsightsSchema>;