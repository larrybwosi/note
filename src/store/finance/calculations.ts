// calculations.ts
import { incomeExpenseService } from './services';
import { 
  Transaction, 
  Category,
  TransactionType, 
  Insights, 
  BudgetConfig,
  SavingsGoal,
  BudgetRuleType
} from './types';

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type CategorySpending = {
  categoryId: string;
  amount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  previousAmount?: number;
  percentageChange?: number;
};

export type MonthlyTrend = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  netSavings: number;
};

export type CategoryTrend = {
  average: number;
  median: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  historicalData: Array<{
    month: string;
    amount: number;
  }>;
};

export type SpendingAnomaly = {
  categoryId: string;
  amount: number;
  expectedAmount: number;
  percentageIncrease: number;
  severity: 'low' | 'medium' | 'high';
  date: string;
};

export type SavingsAnalysis = {
  currentTotal: number;
  goalProgress: Record<string, {
    percentage: number;
    onTrack: boolean;
    projectedCompletionDate: string;
    monthlyRequired: number;
  }>;
  projectedTotal: number;
  monthlyAverage: number;
  savingsRate: number;
};

// Constants for calculations
const ANOMALY_THRESHOLDS = {
  low: 0.2, // 20% above average
  medium: 0.5, // 50% above average
  high: 1.0, // 100% above average
};

const TREND_THRESHOLD = 0.05; // 5% change to determine trend direction

// Utility functions with type safety
export const calculateDateRange = (date: string): DateRange => {
  const currentDate = new Date(date);
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

// Pure calculation functions
export const calculateCategorySpending = (
  transactions: Record<string, Transaction>,
  categories: Category[],
  dateRange: DateRange
): CategorySpending[] => {
  const spending = categories.map(category => {
    const categoryTransactions = Object.values(transactions).filter(t => 
      t.category.name === category.name &&
      t.type === TransactionType.EXPENSE &&
      t.createdAt.toISOString() >= dateRange.startDate &&
      t.createdAt.toISOString() <= dateRange.endDate
    );

    const amount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const total = Object.values(transactions)
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      categoryId: category.name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      trend: 'stable' as const
    };
  });

  return spending;
};

export const calculateMonthlyTrends = (
  transactions: Record<string, Transaction>,
  monthsToAnalyze: number = 12
): MonthlyTrend[] => {
  const trends: MonthlyTrend[] = [];
  const currentDate = new Date();

  for (let i = 0; i < monthsToAnalyze; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const range = calculateDateRange(date.toISOString());
    
    const monthTransactions = Object.values(transactions).filter(t =>
      t.createdAt.toISOString() >= range.startDate && t.createdAt.toISOString() <= range.endDate
    );

    const income = monthTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const savings = income - expenses;
    
    trends.push({
      month: date.toISOString().slice(0, 7),
      income,
      expenses,
      savings,
      netSavings: savings / income * 100
    });
  }

  return trends;
};

export const detectSpendingAnomalies = (
  transactions: Record<string, Transaction>,
  categories: Category[],
  dateRange: DateRange
): SpendingAnomaly[] => {
  const anomalies: SpendingAnomaly[] = [];
  
  categories.forEach(category => {
    const categoryTransactions = Object.values(transactions).filter(t =>
      t.category.name === category.name &&
      t.type === TransactionType.EXPENSE
    );

    // Calculate historical average
    const historicalAverage = categoryTransactions
      .filter(t => t.createdAt.toISOString() < dateRange.startDate)
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(categoryTransactions.length, 1);

    // Check current period transactions
    const currentTransactions = categoryTransactions.filter(t =>
      t.createdAt.toISOString() >= dateRange.startDate &&
      t.createdAt.toISOString() <= dateRange.endDate
    );

    const currentAmount = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentageIncrease = (currentAmount - historicalAverage) / historicalAverage;

    if (percentageIncrease > ANOMALY_THRESHOLDS.low) {
      const severity = 
        percentageIncrease > ANOMALY_THRESHOLDS.high ? 'high' :
        percentageIncrease > ANOMALY_THRESHOLDS.medium ? 'medium' : 'low';

      anomalies.push({
        categoryId: category.name,
        amount: currentAmount,
        expectedAmount: historicalAverage,
        percentageIncrease,
        severity,
        date: dateRange.startDate
      });
    }
  });

  return anomalies;
};

export const analyzeSavingsProgress = (
  transactions: Record<string, Transaction>,
  savingsGoals: Record<string, SavingsGoal>,
  budgetConfig: BudgetConfig
): SavingsAnalysis => {
  const currentDate = new Date();
  
  const savingsTransactions = Object.values(transactions)
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0) -
    Object.values(transactions)
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = budgetConfig.monthlyIncome;
  const savingsRate = (savingsTransactions / monthlyIncome) * 100;

  const goalProgress: SavingsAnalysis['goalProgress'] = {};

  Object.entries(savingsGoals).forEach(([id, goal]) => {
    const monthsToDeadline = goal.deadline
      ? Math.max(0, Math.floor((new Date(goal.deadline).getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 12;

    const monthlyRequired = (goal.target - goal.currentAmount) / monthsToDeadline;
    const onTrack = savingsRate >= (monthlyRequired / monthlyIncome) * 100;
    const projectedMonths = Math.ceil((goal.target - goal.currentAmount) / (monthlyIncome * (savingsRate / 100)));
    
    goalProgress[id] = {
      percentage: (goal.currentAmount / goal.target) * 100,
      onTrack,
      projectedCompletionDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + projectedMonths, 1).toISOString(),
      monthlyRequired
    };
  });

  return {
    currentTotal: Object.values(savingsGoals).reduce((sum, goal) => sum + goal.currentAmount, 0),
    goalProgress,
    projectedTotal: Object.values(savingsGoals).reduce((sum, goal) => sum + goal.target, 0),
    monthlyAverage: savingsTransactions / 12,
    savingsRate
  };
};

export const calculateGuiltFreeBalance = (
  budgetConfig: BudgetConfig,
): number => {

  const monthlyIncome = incomeExpenseService.getTotalIncome();
  const expenses =  incomeExpenseService.getTotalExpenses();

  let budgetedAmount: number;
  if (budgetConfig.rule === BudgetRuleType.RULE_15_65_20) {
    budgetedAmount = monthlyIncome * 0.3; // 30% for wants
  } else if (budgetConfig.rule === BudgetRuleType.CUSTOM) {
    budgetedAmount = monthlyIncome * 0.2; // 20% for savings
  } else if (budgetConfig.rule === BudgetRuleType.RULE_50_30_20) {
    budgetedAmount = monthlyIncome * 0.5; // 50% for needs
  } else if (budgetConfig.rule === BudgetRuleType.RULE_70_20_10) {
    budgetedAmount = monthlyIncome * 0.7; // 70% for savings
  } 
  else {
    budgetedAmount = monthlyIncome * 0.3; // Default to 30%
  }

  return Math.max(0, budgetedAmount - expenses);
};

// Main insight calculation function
export const calculateInsights = (
  transactions: Record<string, Transaction>,
  categories: Category[],
  budgetConfig: BudgetConfig,
  currentDate: string = new Date().toISOString()
): Insights => {
  const dateRange = calculateDateRange(currentDate);
  
  const categorySpending = calculateCategorySpending(transactions, categories, dateRange);
  const monthlyTrends = calculateMonthlyTrends(transactions);
  const unusualSpending = detectSpendingAnomalies(transactions, categories, dateRange);
  const savingsAnalysis = analyzeSavingsProgress(transactions, budgetConfig.savingsGoals, budgetConfig);
  const guiltFreeBalance = calculateGuiltFreeBalance(budgetConfig);

  const monthlySpendingByCategory: Record<string, number> = {};
  categorySpending.forEach(({ categoryId, amount }) => {
    monthlySpendingByCategory[categoryId] = amount;
  });

  const categoryTrends: Record<string, {
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> = {};

  categories.forEach(category => {
    const spending = categorySpending.find(s => s.categoryId === category.name);
    if (spending) {
      categoryTrends[category.name] = {
        average: spending.amount,
        trend: spending.trend
      };
    }
  });

  return {
    guiltFreeBalance,
    monthlySpendingByCategory,
    savingsProgress: Object.fromEntries(
      Object.entries(savingsAnalysis.goalProgress).map(([id, progress]) => [
        id,
        progress.percentage
      ])
    ),
    projectedSavings: savingsAnalysis.projectedTotal,
    unusualSpending: unusualSpending.map(anomaly => ({
      categoryId: anomaly.categoryId,
      amount: anomaly.amount,
      percentageIncrease: anomaly.percentageIncrease
    })),
    trends: {
      monthly: Object.fromEntries(
        monthlyTrends.map(trend => [
          trend.month,
          trend.netSavings
        ])
      ),
      categoryTrends
    }
  };
};