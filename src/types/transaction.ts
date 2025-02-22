export type TransactionType = 'income' | 'expense';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
  attachments?: string[];
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isCustom?: boolean;
  subcategories?: string[];
  monthlyTotal?: number;
  monthlyChange?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice?: number;
  purchased: boolean;
  quantity: number;
  priority: PriorityLevel;
  description?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  shared?: boolean;
  sharedWith?: string[];
  budget?: number;
}

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Salary/Wages',
    type: 'income',
    color: '#2ECC71',
    icon: 'cash',
    subcategories: ['Regular Pay', 'Overtime', 'Contract Work'],
  },
  {
    name: 'Freelance Income',
    type: 'income',
    color: '#3498DB',
    icon: 'laptop',
    subcategories: ['Consulting', 'Project Work', 'Commissions'],
  },
  {
    name: 'Investment Returns',
    type: 'income',
    color: '#9B59B6',
    icon: 'trending-up',
    subcategories: ['Dividends', 'Interest', 'Capital Gains'],
  },
  {
    name: 'Rental Income',
    type: 'income',
    color: '#E67E22',
    icon: 'home',
    subcategories: ['Residential', 'Commercial', 'Parking'],
  },
  {
    name: 'Side Business Revenue',
    type: 'income',
    color: '#E74C3C',
    icon: 'briefcase',
    subcategories: ['Product Sales', 'Services', 'Royalties'],
  },
  {
    name: 'Bonuses/Commissions',
    type: 'income',
    color: '#F1C40F',
    icon: 'gift',
    subcategories: ['Performance Bonus', 'Sales Commission', 'Holiday Bonus'],
  },
  {
    name: 'Government Benefits',
    type: 'income',
    color: '#1ABC9C',
    icon: 'shield',
    subcategories: ['Social Security', 'Tax Returns', 'Unemployment'],
  },
  {
    name: 'Pension/Retirement',
    type: 'income',
    color: '#34495E',
    icon: 'time',
    subcategories: ['401(k)', 'IRA', 'Pension'],
  },
  {
    name: 'Gifts/Inheritance',
    type: 'income',
    color: '#95A5A6',
    icon: 'gift',
    subcategories: ['Monetary Gifts', 'Inheritance', 'Awards'],
  },
  {
    name: 'Other Income',
    type: 'income',
    color: '#7F8C8D',
    icon: 'add-circle',
    subcategories: ['Refunds', 'Rebates', 'Miscellaneous'],
  },
];