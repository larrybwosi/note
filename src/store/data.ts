import { ExpenseGroup, IncomeCategory, } from "./types";
import { Theme } from "./types/ai.page";


export const themes: Record<string, Theme> = {
  modern: {
    primary: ['#FF6B6B', '#4ECDC4'],
    secondary: ['#45B7D1', '#FFBE0B'],
    accent: '#FF6B6B',
    text: {
      primary: '#2C3E50',
      secondary: '#95A5A6'
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF'
    }
  },
  nature: {
    primary: ['#00B894', '#81ECEC'],
    secondary: ['#55EFC4', '#74B9FF'],
    accent: '#00B894',
    text: {
      primary: '#2D3436',
      secondary: '#636E72'
    },
    background: {
      main: '#F0FFF4',
      card: '#FFFFFF'
    }
  },
  sunset: {
    primary: ['#FD746C', '#FF9068'],
    secondary: ['#FC8181', '#F6AD55'],
    accent: '#FD746C',
    text: {
      primary: '#2D3748',
      secondary: '#718096'
    },
    background: {
      main: '#FFFAF0',
      card: '#FFFFFF'
    }
  }
};

export const INCOME_CATEGORIES = {
  [IncomeCategory.SALARY]: {
    icon: '💰',
    description: 'Regular employment income, wages, and bonuses',
  },
  [IncomeCategory.INVESTMENTS]: {
    icon: '📈',
    description: 'Returns from stocks, bonds, real estate, and other investments',
  },
  [IncomeCategory.BUSINESS]: {
    icon: '🏢',
    description: 'Income from business operations and side hustles',
  },
  [IncomeCategory.SIDE_HUSTLE]: {
    icon: '💻',
    description: 'Income from freelance work and consulting',
  },
  [IncomeCategory.GIFTS]: {
    icon: '🎁',
    description: 'Monetary gifts and inheritance',
  },
};

export const EXPENSE_CATEGORIES = {
  [ExpenseGroup.HOUSING]: {
    icon: '🏠',
    description: 'Rent, mortgage, utilities, and home maintenance',
  },
  [ExpenseGroup.TRANSPORTATION]: {
    icon: '🚗',
    description: 'Car payments, fuel, public transit, and maintenance',
  },
  [ExpenseGroup.FOOD]: {
    icon: '🍔',
    description: 'Groceries, dining out, and food delivery',
  },
  [ExpenseGroup.UTILITIES]: {
    icon: '⚡',
    description: 'Electricity, water, internet, and phone bills',
  },
  [ExpenseGroup.ENTERTAINMENT]: {
    icon: '🎮',
    description: 'Movies, games, streaming services, and hobbies',
  },
  [ExpenseGroup.HEALTHCARE]: {
    icon: '💊',
    description: 'Medical bills, insurance, and medications',
  },
  [ExpenseGroup.DEBT]: {
    icon: '💳',
    description: 'Credit card payments, loans, and other debt',
  },
  [ExpenseGroup.INSURANCE]: {
    icon: '🛡️',
    description: 'Health, life, home, and vehicle insurance',
  },
  [ExpenseGroup.SHOPPING]: {
    icon: '🛍️',
    description: 'Clothing, electronics, and general shopping',
  },
};
