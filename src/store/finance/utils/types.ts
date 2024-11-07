// // Transaction Related Enums
// export enum TransactionType {
//   EXPENSE = 'EXPENSE',
//   INCOME = 'INCOME',
//   TRANSFER = 'TRANSFER',
//   SAVINGS = 'SAVINGS',
//   INVESTMENT = 'INVESTMENT',
//   DEBT_PAYMENT = 'DEBT_PAYMENT',
// }

// export enum TransactionStatus {
//   PENDING = 'PENDING',
//   COMPLETED = 'COMPLETED',
//   FAILED = 'FAILED',
//   CANCELLED = 'CANCELLED',
// }

// // Category Related Enums
// export enum CategoryType {
//   INCOME = 'income',
//   EXPENSE = 'expense',
//   CUSTOM = 'custom',
// }

// export enum IncomeCategory {
//   SALARY = 'SALARY',
//   BUSINESS = 'BUSINESS',
//   INVESTMENTS = 'INVESTMENTS',
//   SIDE_HUSTLE = 'SIDE_HUSTLE',
//   GIFTS = 'GIFTS',
// }

// export enum ExpenseGroup {
//   // Essential Expenses
//   HOUSING = 'HOUSING',
//   UTILITIES = 'UTILITIES',
//   FOOD = 'FOOD',
//   HEALTHCARE = 'HEALTHCARE',
//   INSURANCE = 'INSURANCE',
//   TRANSPORTATION = 'TRANSPORTATION',
//   DEBT = 'DEBT',

//   // Discretionary Expenses
//   ENTERTAINMENT = 'ENTERTAINMENT',
//   SHOPPING = 'SHOPPING',
// }

// // Budget Related Enums
// export enum BudgetRuleType {
//   RULE_50_30_20 = '50/30/20 Rule', // Needs/Wants/Savings
//   RULE_70_20_10 = '70/20/10 Rule', // Living/Savings/Debt
//   RULE_15_65_20 = '15/65/20 Rule', // Savings/Living/Debt
//   CUSTOM = 'Custom Rule',
// }

// export enum RecurrenceFrequency {
//   DAILY = 'daily',
//   WEEKLY = 'weekly',
//   MONTHLY = 'monthly',
//   YEARLY = 'yearly',
// }

// // Category IDs
// export enum IncomeCategoryId {
//   SALARY = 'income_salary',
//   BUSINESS = 'income_business',
//   INVESTMENTS = 'income_investments',
//   SIDE_HUSTLE = 'income_side_hustle',
//   GIFTS = 'income_gifts',
//   CUSTOM = 'custom_income',
// }

// export enum ExpenseCategoryId {
//   // Essential Expenses
//   HOUSING = 'expense_housing',
//   RENT = 'expense_rent',
//   UTILITIES = 'expense_utilities',
//   GROCERIES = 'expense_groceries',
//   HEALTHCARE = 'expense_healthcare',
//   INSURANCE = 'expense_insurance',
//   TRANSPORTATION = 'expense_transportation',
//   DEBT = 'expense_debt',

//   // Discretionary Expenses
//   ENTERTAINMENT = 'expense_entertainment',
//   SHOPPING = 'expense_shopping',
//   // EDUCATION = 'expense_education',

//   CUSTOM = 'custom_expense',
// }

// export type CategoryId = IncomeCategoryId | ExpenseCategoryId | string;

// // Core Interfaces
// export interface Category {
//   id: CategoryId;
//   name: string;
//   icon: string;
//   type: CategoryType;
//   subgroup?: ExpenseGroup | IncomeCategory;
//   color?: string;
//   isDefault?: boolean;
//   isArchived?: boolean;
//   budgetPercentage?: number;
//   monthlyLimit?: number;
//   warningThreshold?: number;
//   metadata?: {
//     description?: string;
//     tags?: string[];
//     priority?: number;
//   };
// }

// export interface Transaction {
//   id: string;
//   type: TransactionType;
//   amount: number;
//   categoryId: CategoryId;
//   status: TransactionStatus;
//   category: Category;

//   // Timing
//   date: string;
//   time: string;

//   // Description
//   title: string;
//   description: string;

//   // Optional Fields
//   paymentMethod?: string;
//   location?: string;
//   tags?: string[];
//   receiptUrl?: string;
//   isEssential?: boolean;

//   // Additional Data
//   metadata?: Record<string, unknown>;
//   recurrence?: {
//     frequency: RecurrenceFrequency;
//     endDate?: string;
//     reminderEnabled: boolean;
//     lastProcessed?: string;
//   };
// }

// export type TransactionInput = {
//   type: TransactionType;
//   amount: number;
//   categoryId: CategoryId;
//   title: string;
//   description?: string;
//   date?: string;
//   time?: string;
//   paymentMethod?: string;
//   location?: string;
//   tags?: string[];
//   receiptUrl?: string;
//   isEssential?: boolean;
//   metadata?: Record<string, unknown>;
//   recurrence?: {
//     frequency: RecurrenceFrequency;
//     endDate?: string;
//     reminderEnabled: boolean;
//   };
// };
// export interface SubgroupConfig {
//   name: string;
//   icon: string;
//   color: string;
//   type: CategoryType;
//   monthlyLimit?: number;
//   warningThreshold?: number;
//   metadata?: {
//     description?: string;
//     tags?: string[];
//     priority?: number;
//   };
// }

// export interface CategoryStore {
//   categories: Record<CategoryId, Category>;
//   customCategories: CategoryId[];
// }

// export interface SavingsGoal {
//   id: string;
//   name: string;
//   target: number;
//   currentAmount: number;
//   deadline: string;
//   categoryId: string;
//   priority: number;
//   autoContribute?: {
//     enabled: boolean;
//     amount: number;
//     frequency: RecurrenceFrequency;
//   };
// }

// export interface BudgetRule {
//   categoryId: string;
//   percentage: number;
//   maxAmount?: number;
//   rollover?: boolean;
// }

// export interface BudgetConfig {
//   rule: BudgetRuleType;
//   monthlyIncome: number;
//   savingsGoals: Record<string, SavingsGoal>;
//   paymentSchedule?: {
//     payFrequency: 'weekly' | 'biweekly' | 'monthly';
//     nextPayday: string;
//   };
// }

// export interface FinanceInsights {
//   guiltFreeBalance: number;
//   monthlySpendingByCategory: Record<string, number>;
//   savingsProgress: Record<string, number>;
//   projectedSavings: number;
//   unusualSpending: {
//     categoryId: string;
//     amount: number;
//     percentageIncrease: number;
//   }[];
//   trends: {
//     monthly: Record<string, number>;
//     categoryTrends: Record<
//       string,
//       {
//         trend: number;
//         average: number;
//       }
//     >;
//   };
// }

// export interface FinanceStore {
//   transactions: Record<string, Transaction>;
//   categories: Record<CategoryId, Category>;
//   customCategories: CategoryId[];
//   budgetConfig: BudgetConfig;
//   insights: FinanceInsights;
//   alerts: FinanceAlerts;
//   metadata: {
//     lastUpdated: string;
//     version: string;
//     currency: string;
//     timezone: string;
//   };
// }

// export interface FinanceAlerts {
//   categoryOverspend: string[];
//   upcomingBills: Transaction[];
//   savingsGoalProgress: Record<string, number>;
//   unusualTransactions: Transaction[];
//   lowBalanceWarning?: boolean;
//   upcomingRecurringTransactions: Transaction[];
// }
// export const INCOME_CATEGORIES = {
//   [IncomeCategory.SALARY]: {
//     icon: '💰',
//     description: 'Regular employment income, wages, and bonuses',
//   },
//   [IncomeCategory.INVESTMENTS]: {
//     icon: '📈',
//     description: 'Returns from stocks, bonds, real estate, and other investments',
//   },
//   [IncomeCategory.BUSINESS]: {
//     icon: '🏢',
//     description: 'Income from business operations and side hustles',
//   },
//   [IncomeCategory.SIDE_HUSTLE]: {
//     icon: '💻',
//     description: 'Income from freelance work and consulting',
//   },
//   [IncomeCategory.GIFTS]: {
//     icon: '🎁',
//     description: 'Monetary gifts and inheritance',
//   },
// };

// export const EXPENSE_CATEGORIES = {
//   [ExpenseGroup.HOUSING]: {
//     icon: '🏠',
//     description: 'Rent, mortgage, utilities, and home maintenance',
//   },
//   [ExpenseGroup.TRANSPORTATION]: {
//     icon: '🚗',
//     description: 'Car payments, fuel, public transit, and maintenance',
//   },
//   [ExpenseGroup.FOOD]: {
//     icon: '🍔',
//     description: 'Groceries, dining out, and food delivery',
//   },
//   [ExpenseGroup.UTILITIES]: {
//     icon: '⚡',
//     description: 'Electricity, water, internet, and phone bills',
//   },
//   [ExpenseGroup.ENTERTAINMENT]: {
//     icon: '🎮',
//     description: 'Movies, games, streaming services, and hobbies',
//   },
//   [ExpenseGroup.HEALTHCARE]: {
//     icon: '💊',
//     description: 'Medical bills, insurance, and medications',
//   },
//   [ExpenseGroup.DEBT]: {
//     icon: '💳',
//     description: 'Credit card payments, loans, and other debt',
//   },
//   [ExpenseGroup.INSURANCE]: {
//     icon: '🛡️',
//     description: 'Health, life, home, and vehicle insurance',
//   },
//   [ExpenseGroup.SHOPPING]: {
//     icon: '🛍️',
//     description: 'Clothing, electronics, and general shopping',
//   },
// };

// export const DEFAULT_EXPENSE_CATEGORIES: Record<ExpenseCategoryId, Category> = {
//   [ExpenseCategoryId.HOUSING]: {
//     id: ExpenseCategoryId.HOUSING,
//     name: 'Housing',
//     icon: '🏠',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#4A5568',
//     budgetPercentage: 30,
//     metadata: {
//       description: 'Housing and mortgage related expenses',
//       priority: 1,
//     },
//   },
//   [ExpenseCategoryId.RENT]: {
//     id: ExpenseCategoryId.RENT,
//     name: 'Rent',
//     icon: '🏢',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#718096',
//     budgetPercentage: 25,
//     metadata: {
//       description: 'Monthly rent payments',
//       priority: 1,
//     },
//   },
//   [ExpenseCategoryId.UTILITIES]: {
//     id: ExpenseCategoryId.UTILITIES,
//     name: 'Utilities',
//     icon: '⚡',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.UTILITIES,
//     isDefault: true,
//     color: '#A0AEC0',
//     budgetPercentage: 5,
//   },
//   [ExpenseCategoryId.GROCERIES]: {
//     id: ExpenseCategoryId.GROCERIES,
//     name: 'Groceries',
//     icon: '🛒',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.FOOD,
//     isDefault: true,
//     color: '#48BB78',
//     budgetPercentage: 10,
//   },
//   [ExpenseCategoryId.HEALTHCARE]: {
//     id: ExpenseCategoryId.HEALTHCARE,
//     name: 'Healthcare',
//     icon: '⚕️',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.HEALTHCARE,
//     isDefault: true,
//     color: '#E53E3E',
//     budgetPercentage: 8,
//   },
//   [ExpenseCategoryId.INSURANCE]: {
//     id: ExpenseCategoryId.INSURANCE,
//     name: 'Insurance',
//     icon: '🛡️',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.INSURANCE,
//     isDefault: true,
//     color: '#805AD5',
//     budgetPercentage: 5,
//   },
//   [ExpenseCategoryId.TRANSPORTATION]: {
//     id: ExpenseCategoryId.TRANSPORTATION,
//     name: 'Transportation',
//     icon: '🚗',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.TRANSPORTATION,
//     isDefault: true,
//     color: '#3182CE',
//     budgetPercentage: 7,
//   },
//   [ExpenseCategoryId.DEBT]: {
//     id: ExpenseCategoryId.DEBT,
//     name: 'Debt Payments',
//     icon: '💳',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.DEBT,
//     isDefault: true,
//     color: '#DD6B20',
//     budgetPercentage: 10,
//   },
//   [ExpenseCategoryId.ENTERTAINMENT]: {
//     id: ExpenseCategoryId.ENTERTAINMENT,
//     name: 'Entertainment',
//     icon: '🎭',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.ENTERTAINMENT,
//     isDefault: true,
//     color: '#9F7AEA',
//     budgetPercentage: 5,
//   },
//   [ExpenseCategoryId.SHOPPING]: {
//     id: ExpenseCategoryId.SHOPPING,
//     name: 'Shopping',
//     icon: '🛍️',
//     type: CategoryType.EXPENSE,
//     subgroup: ExpenseGroup.SHOPPING,
//     isDefault: true,
//     color: '#F6AD55',
//     budgetPercentage: 5,
//   },
//   [ExpenseCategoryId.CUSTOM]: {
//     id: ExpenseCategoryId.CUSTOM,
//     name: 'Custom Expense',
//     icon: '✨',
//     type: CategoryType.EXPENSE,
//     isDefault: false,
//     color: '#CBD5E0',
//   },
// };

// export const DEFAULT_INCOME_CATEGORIES: Record<IncomeCategoryId, Category> = {
//   [IncomeCategoryId.SALARY]: {
//     id: IncomeCategoryId.SALARY,
//     name: 'Salary',
//     icon: '💰',
//     type: CategoryType.INCOME,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#48BB78',
//   },
//   [IncomeCategoryId.BUSINESS]: {
//     id: IncomeCategoryId.BUSINESS,
//     name: 'Business Income',
//     icon: '💼',
//     type: CategoryType.INCOME,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#4299E1',
//   },
//   [IncomeCategoryId.INVESTMENTS]: {
//     id: IncomeCategoryId.INVESTMENTS,
//     name: 'Investment Income',
//     icon: '📈',
//     type: CategoryType.INCOME,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#805AD5',
//   },
//   [IncomeCategoryId.SIDE_HUSTLE]: {
//     id: IncomeCategoryId.SIDE_HUSTLE,
//     name: 'Side Hustle',
//     icon: '🎨',
//     type: CategoryType.INCOME,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#ED64A6',
//   },
//   [IncomeCategoryId.GIFTS]: {
//     id: IncomeCategoryId.GIFTS,
//     name: 'Gifts',
//     icon: '🎁',
//     type: CategoryType.INCOME,
//     subgroup: ExpenseGroup.HOUSING,
//     isDefault: true,
//     color: '#F6AD55',
//   },
//   [IncomeCategoryId.CUSTOM]: {
//     id: IncomeCategoryId.CUSTOM,
//     name: 'Custom Income',
//     icon: '✨',
//     type: CategoryType.INCOME,
//     isDefault: false,
//     color: '#CBD5E0',
//   },
// };
