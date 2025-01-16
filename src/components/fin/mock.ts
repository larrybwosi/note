import { Transaction, TransactionType, TransactionStatus, RecurrenceFrequency, ExpenseGroup, IncomeCategory } from 'src/store/types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3000,
    description: 'Monthly Salary',
    createdAt: new Date('2023-06-01'),
    type: TransactionType.INCOME,
    category: { name: IncomeCategory.SALARY, type: 'income' },
    status: TransactionStatus.COMPLETED,
    tags: ['work', 'monthly'],
    paymentMethod: 'Direct Deposit',
  },
  {
    id: '2',
    amount: -1200,
    description: 'Rent Payment',
    createdAt: new Date('2023-06-02'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.HOUSING, type: 'expense' },
    status: TransactionStatus.COMPLETED,
    tags: ['housing', 'monthly'],
    paymentMethod: 'Bank Transfer',
    isEssential: true,
  },
  {
    id: '3',
    amount: -50,
    description: 'Grocery Shopping',
    createdAt: new Date('2023-06-03'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.FOOD, type: 'expense' },
    status: TransactionStatus.COMPLETED,
    tags: ['food', 'groceries'],
    paymentMethod: 'Credit Card',
    isEssential: true,
  },
  {
    id: '4',
    amount: -80,
    description: 'Movie Night',
    createdAt: new Date('2023-06-04'),
    type: TransactionType.EXPENSE,
    category: { name: ExpenseGroup.ENTERTAINMENT, type: 'expense' },
    status: TransactionStatus.COMPLETED,
    tags: ['entertainment', 'friends'],
    paymentMethod: 'Cash',
  },
  {
    id: '5',
    amount: 500,
    description: 'Freelance Work',
    createdAt: new Date('2023-06-05'),
    type: TransactionType.INCOME,
    category: { name: IncomeCategory.SIDE_HUSTLE, type: 'income' },
    status: TransactionStatus.COMPLETED,
    tags: ['freelance', 'extra income'],
    paymentMethod: 'PayPal',
  },
];

