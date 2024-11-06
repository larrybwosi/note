import {
  Transaction,
  TransactionType,
  TransactionStatus,
  Category,
  CategoryType,
  TransactionInput,
} from '../types';
import { observable } from '@legendapp/state';
import useFinanceStore from '../actions';
import { endOfMonth, format, isWithinInterval, startOfMonth } from 'date-fns';
import { getCategory } from './category';

/**
 * Creates a new transaction with proper typing and default values
 */
export function createTransaction(input: TransactionInput): Transaction {
  const now = new Date();

  // Default transaction status is 'COMPLETED' unless specified in metadata
  const status = (input.metadata?.status as TransactionStatus) || 'COMPLETED';

  const transaction: Transaction = {
    // Generate a unique ID for the transaction

    id: Math.random().toString(),

    // Required fields from input
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    category: getCategory(input.categoryId),
    status,

    // Date and time (defaults to current if not provided)
    date: input.date || format(now, 'yyyy-MM-dd'),
    time: input.time || format(now, 'HH:mm'),

    // Description fields
    title: input.title,
    description: input.description || '',

    // Optional fields
    ...(input.paymentMethod && { paymentMethod: input.paymentMethod }),
    ...(input.location && { location: input.location }),
    ...(input.tags && { tags: input.tags }),
    ...(input.receiptUrl && { receiptUrl: input.receiptUrl }),
    ...(typeof input.isEssential !== 'undefined' && { isEssential: input.isEssential }),

    // Metadata
    ...(input.metadata && { metadata: input.metadata }),

    // Recurrence settings
    ...(input.recurrence && {
      recurrence: {
        frequency: input.recurrence.frequency,
        endDate: input.recurrence.endDate,
        reminderEnabled: input.recurrence.reminderEnabled,
        lastProcessed: now.toISOString().split('T')[0],
      },
    }),
  };

  return transaction;
}

export const getMonthlyTransactions = (
  transactions: Record<string, Transaction>,
  date: Date = new Date()
): Transaction[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  return Object.values(transactions).filter((transaction) =>
    isWithinInterval(new Date(transaction.date), {
      start: monthStart,
      end: monthEnd,
    })
  );
};

// Types for function parameters
interface CreateTransactionParams {
  title: string;
  amount: number;
  categoryId: string;
  description?: string;
  date?: string;
  paymentMethod?: string;
  tags?: string[];
  location?: string;
  receiptUrl?: string;
  isEssential?: boolean;
  metadata?: Record<string, unknown>;
}

interface TransactionValidationResult {
  isValid: boolean;
  errors: string[];
}

// Utility functions
const validateTransaction = (
  params: CreateTransactionParams,
  categories: Record<string, Category>
): TransactionValidationResult => {
  const errors: string[] = [];

  // Validate required fields
  if (!params.title?.trim()) {
    errors.push('Title is required');
  }

  if (!params.amount || params.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!params.categoryId || !categories[params.categoryId]) {
    errors.push('Valid category is required');
  }

  // Validate amount format (2 decimal places max)
  if (params.amount && !Number.isInteger(params.amount * 100)) {
    errors.push('Amount cannot have more than 2 decimal places');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const createBaseTransaction = (
  params: CreateTransactionParams,
  type: TransactionType
): Transaction => {
  const now = new Date();

  return {
    id: Math.floor(Math.random() * 1000000).toString(),
    date: params.date || now.toISOString().split('T')[0],
    time: now.toISOString().split('T')[1].split('.')[0],
    title: params.title.trim(),
    description: params.description?.trim() || '',
    amount: Number(params.amount.toFixed(2)),
    type,
    categoryId: params.categoryId,
    status: TransactionStatus.COMPLETED,
    paymentMethod: params.paymentMethod,
    tags: params.tags,
    location: params.location,
    receiptUrl: params.receiptUrl,
    isEssential: params.isEssential,
    metadata: params.metadata,
    category: getCategory(params.categoryId),
  };
};

// Main transaction functions
export const addExpense = (
  store: ReturnType<typeof observable>,
  params: CreateTransactionParams
): Transaction | null => {
  const validation = validateTransaction(params, store.get().categories);

  if (!validation.isValid) {
    console.error('Transaction validation failed:', validation.errors);
    return null;
  }

  const category = store.get().categories[params.categoryId];
  if (category.group !== CategoryType.EXPENSE) {
    console.error('Invalid category type for expense');
    return null;
  }

  const transaction = createBaseTransaction(params, TransactionType.EXPENSE);

  // Update store
  store.transactions[transaction.id].set(transaction);

  // Update lastUpdated timestamp
  store.metadata.lastUpdated.set(new Date().toISOString());

  return transaction;
};

export const addIncome = (
  store: ReturnType<typeof observable>,
  params: CreateTransactionParams
): Transaction | null => {
  const validation = validateTransaction(params, store.get().categories);

  if (!validation.isValid) {
    console.error('Transaction validation failed:', validation.errors);
    return null;
  }

  const category = store.get().categories[params.categoryId];
  if (category.group !== CategoryType.INCOME) {
    console.error('Invalid category type for income');
    return null;
  }

  const transaction = createBaseTransaction(params, TransactionType.INCOME);

  // Update store
  store.transactions[transaction.id].set(transaction);

  // Update lastUpdated timestamp
  store.metadata.lastUpdated.set(new Date().toISOString());

  return transaction;
};

// Helper functions for transaction management
export const deleteTransaction = (
  store: ReturnType<typeof observable>,
  transactionId: string
): boolean => {
  if (!store.get().transactions[transactionId]) {
    console.error('Transaction not found');
    return false;
  }

  store.transactions[transactionId].delete();
  store.metadata.lastUpdated.set(new Date().toISOString());
  return true;
};

export const updateTransaction = (
  store: ReturnType<typeof observable>,
  transactionId: string,
  updates: Partial<CreateTransactionParams>
): Transaction | null => {
  const currentTransaction = store.get().transactions[transactionId];
  if (!currentTransaction) {
    console.error('Transaction not found');
    return null;
  }

  const updatedParams = {
    title: currentTransaction.title,
    amount: currentTransaction.amount,
    categoryId: currentTransaction.categoryId,
    description: currentTransaction.description,
    ...updates,
  };

  const validation = validateTransaction(updatedParams, store.get().categories);
  if (!validation.isValid) {
    console.error('Transaction update validation failed:', validation.errors);
    return null;
  }

  const updatedTransaction = {
    ...currentTransaction,
    ...updatedParams,
    amount: Number(updatedParams.amount.toFixed(2)),
  };

  store.transactions[transactionId].set(updatedTransaction);
  store.metadata.lastUpdated.set(new Date().toISOString());

  return updatedTransaction;
};

// Query helpers
export const useGetTransactionsByDateRange = (
  startDate: string,
  endDate: string
): Transaction[] => {
  const { store } = useFinanceStore();
  const transactions = store.get().transactions;
  return Object.values(transactions).filter(
    (transaction) => transaction.date >= startDate && transaction.date <= endDate
  );
};

export const useGetTransactionsByCategory = (categoryId: string): Transaction[] => {
  const { store } = useFinanceStore();
  const transactions = store.get().transactions;
  return Object.values(transactions).filter((transaction) => transaction.categoryId === categoryId);
};
