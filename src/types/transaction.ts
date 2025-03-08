import { Banknote, BookAudio, Briefcase, Car, Clock, Coffee, CreditCard, Gift, Heart, Home, Laptop2, LucideIcon, PiggyBank, PlusCircle, ShieldCheck, Shirt, TrendingUp, Utensils, Video } from "lucide-react-native";

export type TransactionType = 'income' | 'expense';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type TransactionStatus = 'completed' | 'due-to-pay' | 'pending'

export interface Transaction {
	id: string;
	type: TransactionType;
	amount: number;
	description: string;
	categoryId: string;
	subcategory?: string;
	date: Date;
	status?: TransactionStatus
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
	icon: IconName;
	isCustom?: boolean;
	subcategories?: string[];
	monthlyTotal?: number;
	monthlyChange?: number;
  colors?: string[];
	description?:string
}


export type IconName = keyof typeof ICON_MAP;


// Budget rule types
export type BudgetRuleType = '10-70-20' | '50-30-20' | '80-20' | 'custom';
export type BudgetPeriodType = 'week' | 'month' | 'year';
export type BudgetStatus = 'active' | 'expired' | 'draft';
export type BudgetRuleGroups = { name: string; percentage: number; description: string; categories: string[] };

// Enhanced Budget interface
export interface Budget {
  id: string;
  name: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  periodType: BudgetPeriodType;
  ruleType: BudgetRuleType;
  status: BudgetStatus;
	categoryAllocations: BudgetRuleGroups[]
}

interface BudgetRuleGroupsAllocation {
	[key: string]: {
		groups: {
			name: string;
			percentage: number;
			description: string;
			categories: string[];
			color: string;
		}[];
	};
}
// Default budget allocations based on rule types
export const BUDGET_RULE_ALLOCATIONS: BudgetRuleGroupsAllocation = {
	'50-30-20': {
		groups: [
			{ name: 'Needs', percentage: 50, description: 'Essential expenses', categories: [], color: '#4F46E5', },
			{ name: 'Wants', percentage: 30, description: 'Non-essential spending', categories: [], color: '#EC4899' },
			{ name: 'Savings', percentage: 20, description: 'Future planning', categories: [], color: '#10B981' },
		],
	},
	'10-70-20': {
		groups: [
			{ name: 'Savings', percentage: 10, description: 'Set aside for future', categories: [], color: '#10B981' },
			{ name: 'Expenses', percentage: 70, description: 'Daily and monthly costs', categories: [], color: '#4F46E5' },
			{ name: 'Investments', percentage: 20, description: 'Growth opportunities', categories: [], color: '#F59E0B' },
		],
	},
	'80-20': {
		groups: [
			{ name: 'Necessities', percentage: 80, description: 'Must-have expenses', categories: [], color: '#4F46E5' },
			{ name: 'Discretionary', percentage: 20, description: 'Optional spending', categories: [], color: '#EC4899' },
		],
	},
};

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice?: number;
  purchased: boolean;
  quantity: number;
  priority: PriorityLevel;
  description?: string;
	dateToPurchase?: Date;
}

export interface ShoppingItem {
	id: string;
	name: string;
	categoryId: string;
	price: number;
	quantity: number;
	completed?: boolean;
	dateAdded: Date;
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
		description: 'Income from contract or freelance work',
	},
	{
		id: 'scholarship',
		name: 'Scholarship',
		type: 'income',
		color: '#8B5CF6', // Purple
		icon: 'laptop',
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
	}
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
	{
		id: 'housing',
		name: 'Housing',
		type: 'expense',
		color: '#4F46E5', // Indigo
		icon: 'home',
		colors: ['#818cf8', '#4338ca'], // Light indigo to dark indigo gradient
		subcategories: ['Rent', 'Mortgage'],
		description: 'Rent, mortgage, repairs, and home improvements',
	},
	{
		id: 'transport',
		name: 'Transportation',
		type: 'expense',
		color: '#EF4444', // Red
		icon: 'car',
		colors: ['#f87171', '#dc2626'], // Light red to dark red gradient
		subcategories: ['Public Transport', 'Fuel', 'Parking'],
		description: 'Flights, hotels, and vacation expenses',
	},
	{
		id: 'food',
		name: 'Food',
		type: 'expense',
		color: '#F97316', // Orange
		icon: 'food',
		colors: ['#fb923c', '#ea580c'], // Light orange to dark orange gradient
		subcategories: ['Groceries', 'Dining Out', 'Snacks'],
	},
	{
		id: 'entertainment',
		name: 'Entertainment',
		type: 'expense',
		color: '#EC4899', // Pink
		icon: 'camera',
		colors: ['#f472b6', '#db2777'], // Light pink to dark pink gradient
		subcategories: ['Movies', 'Concerts', 'Events'],
	},
	{
		id: 'medical',
		name: 'Medical',
		type: 'expense',
		color: '#10B981', // Emerald
		icon: 'heart',
		colors: ['#34d399', '#059669'], // Light green to dark green gradient
		subcategories: ['Insurance', 'Medication', 'Appointments'],
	},
	{
		id: 'education',
		name: 'Education',
		type: 'expense',
		color: '#3B82F6', // Blue
		icon: 'book',
		colors: ['#60a5fa', '#2563eb'], // Light blue to dark blue gradient
		subcategories: ['Tuition', 'Books', 'Supplies'],
		description: 'Tuition, books, courses, and school supplies',
	},
	{
		id: 'clothing',
		name: 'Clothing',
		type: 'expense',
		color: '#8B5CF6', // Purple
		icon: 'shirt',
		colors: ['#a78bfa', '#7c3aed'], // Light purple to dark purple gradient
		subcategories: ['Shoes', 'Accessories', 'Apparel'],
	},
	{
		id: 'utilities',
		name: 'Utilities',
		type: 'expense',
		color: '#06B6D4', // Cyan
		icon: 'zap',
		colors: ['#22d3ee', '#0891b2'], // Light cyan to dark cyan gradient
		subcategories: ['Electricity', 'Water', 'Internet'],
	},
	{
		id: 'debt',
		name: 'Debt',
		type: 'expense',
		color: '#F59E0B', // Amber
		icon: 'credit-card',
		colors: ['#fbbf24', '#d97706'], // Light amber to dark amber gradient
		subcategories: ['Loans', 'Credit Card Payments', 'Interest'],
	},
	{
		id: 'saving',
		name: 'Savings',
		type: 'expense',
		color: '#22C55E', // Green
		icon: 'saving',
		colors: ['#4ade80', '#16a34a'], // Light green to dark green gradient
		subcategories: ['Emergency Fund', 'Retirement', 'Investments'],
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