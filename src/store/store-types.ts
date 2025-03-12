import { Budget, Transaction } from "src/types/transaction";

export interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  error?: {
    message: string;
    details?: {
      categoryName?: string;
      currentSpending: number;
      newTransactionAmount: number;
      groupAllocation: number;
      wouldExceedBy: number;
    };
  };
}

export interface FinanceSummary {
  balance: number;
  totalSpent: number;
  totalIncome: number;
  percentageSpent: number;
}

export interface BudgetStatusResult {
  needsRenewal: boolean;
  expiredBudgetIds: string[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  data: { period: string; amount: number }[];
}

export interface SpendingTrends {
  periods: string[];
  categoryTrends: CategorySpending[];
}

export interface GroupSpending {
  groupName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  transactions: Transaction[];
  categories: {
    id: string;
    name: string;
  }[];
}

export interface BudgetSpending {
  budget: Budget;
  groups: GroupSpending[];
  totalSpent: number;
  totalRemaining: number;
  percentUsed: number;
  startDate: Date;
  endDate: Date;
}

export interface BudgetCollection {
  active?: Budget;
  expired: Budget[];
  drafts: Budget[];
}