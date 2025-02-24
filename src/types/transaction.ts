import { Banknote, BookAudio, Briefcase, Car, Clock, Coffee, CreditCard, Gift, Heart, Home, Laptop2, LucideIcon, PiggyBank, PlusCircle, ShieldCheck, Shirt, TrendingUp, Utensils, Video } from "lucide-react-native";

export type TransactionType = 'income' | 'expense';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface Transaction {
	id: string;
	type: TransactionType;
	amount: number;
	description: string;
	categoryId: string;
	subcategory?: string;
	date: Date;
	recurring?: {
		frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
		endDate?: Date;
	};
	attachments?: string[];
}

export type IconName = keyof typeof ICON_MAP;

export interface Category {
	id: string;
	name: string;
	type: TransactionType;
	color: string;
	icon: IconName;
	isCustom?: boolean;
	subcategories?: string[];
	monthlyTotal?: number;
	monthlyChange?: number;
  colors?: string[];
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

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
	{
		id: 'salary',
		name: 'Salary/Wages',
		type: 'income',
		color: '#2ECC71', // Green
		icon: 'cash',
		colors: ['#4ade80', '#22c55e'], // Lighter to darker green gradient
		subcategories: ['Regular Pay', 'Overtime', 'Contract Work'],
	},
	{
		id: 'part_time_job',
		name: 'Freelance Income',
		type: 'income',
		color: '#3B82F6', // Blue
		icon: 'laptop',
		colors: ['#60a5fa', '#2563eb'], // Light blue to dark blue gradient
		subcategories: ['Consulting', 'Project Work', 'Commissions'],
	},
	{
		id: 'scholarship',
		name: 'Scholarship',
		type: 'income',
		color: '#8B5CF6', // Purple
		icon: 'school',
		colors: ['#a78bfa', '#7c3aed'], // Light purple to dark purple gradient
		subcategories: ['Tuition Coverage', 'Grants', 'Stipends'],
	},
	{
		id: 'gifts',
		name: 'Bonuses/Gifts',
		type: 'income',
		color: '#F59E0B', // Amber
		icon: 'gift',
		colors: ['#fbbf24', '#d97706'], // Light amber to dark amber gradient
		subcategories: ['Performance Bonus', 'Sales Commission', 'Holiday Bonus'],
	},
	{
		id: 'other',
		name: 'Other Income',
		type: 'income',
		color: '#6B7280', // Gray
		icon: 'add-circle',
		colors: ['#9ca3af', '#4b5563'], // Light gray to dark gray gradient
		subcategories: ['Refunds', 'Rebates', 'Miscellaneous'],
	},
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
	{
		id: 'housing',
		name: 'Housing',
		type: 'expense',
		color: '#4F46E5', // Indigo
		icon: 'home',
		colors: ['#818cf8', '#4338ca'], // Light indigo to dark indigo gradient
	},
	{
		id: 'transport',
		name: 'Transportation',
		type: 'expense',
		color: '#EF4444', // Red
		icon: 'car',
		colors: ['#f87171', '#dc2626'], // Light red to dark red gradient
	},
	{
		id: 'food',
		name: 'Food',
		type: 'expense',
		color: '#F97316', // Orange
		icon: 'food',
		colors: ['#fb923c', '#ea580c'], // Light orange to dark orange gradient
	},
	{
		id: 'entertainment',
		name: 'Entertainment',
		type: 'expense',
		color: '#EC4899', // Pink
		icon: 'camera',
		colors: ['#f472b6', '#db2777'], // Light pink to dark pink gradient
	},
	{
		id: 'medical',
		name: 'Medical',
		type: 'expense',
		color: '#10B981', // Emerald
		icon: 'heart',
		colors: ['#34d399', '#059669'], // Light green to dark green gradient
	},
	{
		id: 'education',
		name: 'Education',
		type: 'expense',
		color: '#3B82F6', // Blue
		icon: 'book',
		colors: ['#60a5fa', '#2563eb'], // Light blue to dark blue gradient
	},
	{
		id: 'clothing',
		name: 'Clothing',
		type: 'expense',
		color: '#8B5CF6', // Purple
		icon: 'shirt',
		colors: ['#a78bfa', '#7c3aed'], // Light purple to dark purple gradient
	},
	{
		id: 'utilities',
		name: 'Utilities',
		type: 'expense',
		color: '#06B6D4', // Cyan
		icon: 'zap',
		colors: ['#22d3ee', '#0891b2'], // Light cyan to dark cyan gradient
	},
	{
		id: 'debt',
		name: 'Debt',
		type: 'expense',
		color: '#F59E0B', // Amber
		icon: 'credit-card',
		colors: ['#fbbf24', '#d97706'], // Light amber to dark amber gradient
	},
	{
		id: 'saving',
		name: 'Savings',
		type: 'expense',
		color: '#22C55E', // Green
		icon: 'saving',
		colors: ['#4ade80', '#16a34a'], // Light green to dark green gradient
	},
];

const CombinedCategories = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];
export const DEFAULT_CATEGORIES: Category[] = CombinedCategories.map((category, index) => ({
  ...category,
}));

export const ICON_MAP: Record<string, LucideIcon> = {
  'cash': Banknote,
  'laptop': Laptop2,
  'trending-up': TrendingUp,
  'home': Home,
  'briefcase': Briefcase,
  'gift': Gift,
  'shield': ShieldCheck,
  'time': Clock,
  'add-circle': PlusCircle,
  'car': Car,
  'food': Coffee,
  'heart': Heart,
  'book': BookAudio,
  'shirt': Shirt,
  'zap': Clock,
  'scissors': Utensils,
  'credit-card': CreditCard,
  'saving': PiggyBank,
  'camera': Video,
};
export const ICON_OPTIONS = Object.keys(ICON_MAP);