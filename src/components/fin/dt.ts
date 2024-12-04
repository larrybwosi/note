import { Transaction, Category, Insights, TransactionType, TransactionStatus, CategoryType, IncomeCategory, ExpenseGroup } from 'src/store/finance/types';

export const mockCategories: Record<string, Category> = {
  '1': { id: '1', name: 'Groceries', type: 'expense', budget: 500 },
  '2': { id: '2', name: 'Rent', type: 'expense', budget: 1500 },
  '3': { id: '3', name: 'Salary', type: 'income', budget: 0 },
  '4': { id: '4', name: 'Entertainment', type: 'expense', budget: 200 },
  '5': { id: '5', name: 'Transportation', type: 'expense', budget: 300 },
};

export const mockTransactions: Record<string, Transaction> = {
  '1': {
    id: '1',
    amount: 50.75,
    description: 'Grocery shopping',
    createdAt: new Date('2023-05-01'),
    type: TransactionType.EXPENSE,
    category: mockCategories['1'],
    status: TransactionStatus.COMPLETED,
  },
  '2': {
    id: '2',
    amount: 1500,
    description: 'Monthly rent',
    createdAt: new Date('2023-05-02'),
    type: TransactionType.EXPENSE,
    category: mockCategories['2'],
    status: TransactionStatus.COMPLETED,
  },
  '3': {
    id: '3',
    amount: 3000,
    description: 'Salary deposit',
    createdAt: new Date('2023-05-05'),
    type: TransactionType.INCOME,
    category: mockCategories['3'],
    status: TransactionStatus.COMPLETED,
  },
  '4': {
    id: '4',
    amount: 75.50,
    description: 'Movie night',
    createdAt: new Date('2023-05-07'),
    type: TransactionType.EXPENSE,
    category: mockCategories['4'],
    status: TransactionStatus.COMPLETED,
  },
  '5': {
    id: '5',
    amount: 30,
    description: 'Bus pass',
    createdAt: new Date('2023-05-10'),
    type: TransactionType.EXPENSE,
    category: mockCategories['5'],
    status: TransactionStatus.COMPLETED,
  },
};

export const mockInsights: Insights = {
  guiltFreeBalance: 500,
  monthlySpendingByCategory: {
    '1': 200,
    '2': 1500,
    '4': 150,
    '5': 100,
  },
  savingsProgress: {
    'Emergency Fund': 2000,
    'Vacation': 500,
  },
  projectedSavings: 1000,
  unusualSpending: [
    {
      categoryId: '4',
      amount: 150,
      percentageIncrease: 50,
    },
  ],
  trends: {
    monthly: {
      'May 2023': 3000,
      'April 2023': 2800,
      'March 2023': 2900,
    },
    categoryTrends: {
      '1': {
        average: 220,
        trend: 'decreasing',
      },
      '4': {
        average: 100,
        trend: 'increasing',
      },
    },
  },
};


export const mockTrans: Transaction[] = [
  {
    id: '1',
    amount: 3000,
    description: 'Monthly salary',
    createdAt: new Date('2023-05-01'),
    type: TransactionType.INCOME,
    category: { name: IncomeCategory.SALARY, type: 'income', icon: 'briefcase' },
    status: TransactionStatus.COMPLETED,
  },
  {
    id: '2',
    amount: 1000,
    description: 'Rent payment',
    createdAt: new Date('2023-05-02'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.HOUSING, type: 'expense', icon: 'home' },
    status: TransactionStatus.COMPLETED,
  },
  {
    id: '3',
    amount: 100,
    description: 'Grocery shopping',
    createdAt: new Date('2023-05-03'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.FOOD, type: 'expense', icon: 'shopping-cart' },
    status: TransactionStatus.COMPLETED,
  },
  {
    id: '4',
    amount: 500,
    description: 'Investment in stocks',
    createdAt: new Date('2023-05-04'),
    type: TransactionType.INVESTMENT,
    category: { name: IncomeCategory.INVESTMENTS, type: 'income', icon: 'trending-up' },
    status: TransactionStatus.COMPLETED,
  },
  {
    id: '5',
    amount: 200,
    description: 'Electricity bill',
    createdAt: new Date('2023-05-05'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.UTILITIES, type: 'expense', icon: 'zap' },
    status: TransactionStatus.PENDING,
  },
];