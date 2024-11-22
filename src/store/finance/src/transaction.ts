import { store } from "../store";
import { budgetService } from "./budget";
import { insightService } from "./insight";
import { Transaction, TransactionSchema } from "./types";

export const transactionService = {
  addTransaction: async (transaction: Transaction): Promise<void> => {
    const validatedTransaction = TransactionSchema.parse(transaction);
    store.transactions[validatedTransaction.id].set(validatedTransaction);
    await insightService.updateInsights();
    budgetService.checkAlerts();
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<void> => {
    if (store.transactions[id].get()) {
      const updatedTransaction = { ...store.transactions[id].get(), ...updates };
      const validatedTransaction = TransactionSchema.parse(updatedTransaction);
      store.transactions[id].set(validatedTransaction);
      await insightService.updateInsights();
    }
  },

  getTransactions: (): Transaction[] => {
    const transactions = Object.values(store.transactions.get());
    return transactions.map(tx => TransactionSchema.parse(tx));
  },

  getTransactionsByCategory: (categoryName: string, startDate?: Date, endDate?: Date): Transaction[] => {
    const transactions = Object.values(store.transactions.get());
    return transactions.filter((tx) => {
      const withinDateRange = startDate && endDate 
        ? new Date(tx.createdAt) >= startDate && new Date(tx.createdAt) <= endDate
        : true;
      return tx.category.name === categoryName && withinDateRange;
    }).map(tx => TransactionSchema.parse(tx));
  },

  getTransactionsByDateRange: (startDate: Date, endDate: Date): Transaction[] => {
    return Object.values(store.transactions.get())
      .filter((tx) => new Date(tx.createdAt) >= startDate && new Date(tx.createdAt) <= endDate)
      .map(tx => TransactionSchema.parse(tx));
  },
};

