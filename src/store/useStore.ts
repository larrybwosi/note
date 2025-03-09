import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced } from '@legendapp/state/sync';
import {
	Transaction,
	Category,
	Budget,
	BUDGET_RULE_ALLOCATIONS,
	BudgetRuleType,
	BudgetPeriodType,
	BudgetRuleGroups,
} from 'src/types/transaction';
import { calcTotalDaysInPeriod, calculateTotalPeriodMs, createUniqueId, formatPeriodLabel, getCurrentMonthDateRange, getDateRangeForPeriod } from 'src/utils/store';

// Define the store structure using observables
export const store = observable(
	synced({
		initial: {
			transactions: [] as Transaction[],
			categories:[] as Category[],
			budgets: [] as Budget[],
			isSetup: false,
		},
		persist: {
			name: 'financestore',
			plugin: ObservablePersistMMKV,
		},
	})
);


// Define actions to manipulate the store
const actions = {
	// Cached selectors
	transactions: store.transactions.get(),
	categories: store.categories.get(),
	budgets: store.budgets.get(),

	// Transaction operations
	addTransaction: (transaction: Transaction) => {
		// First, check if there's an active budget
		const activeBudget = store.budgets.get().find((b) => b.status === 'active');

		if (activeBudget) {
			// Find the category allocation group for this transaction's category
			const categoryAllocationGroup = activeBudget.categoryAllocations.find((group) =>
				group.categories.includes(transaction.categoryId)
			);

			if (categoryAllocationGroup) {
				// Calculate the allocated amount for this category group
				const groupAllocation = (categoryAllocationGroup.percentage / 100) * activeBudget.amount;

				// Calculate existing spending for this category in the current budget period
				const existingSpending = store.transactions
					.get()
					.filter(
						(t) =>
							t.categoryId === transaction.categoryId &&
							t.type === 'expense' &&
							new Date(t.date) >= new Date(activeBudget.startDate) &&
							new Date(t.date) <= new Date(activeBudget.endDate)
					)
					.reduce((total, t) => total + t.amount, 0);

				// Check if the new transaction would exceed the category group's allocation
				const totalAfterNewTransaction =
					existingSpending + (transaction.type === 'expense' ? transaction.amount : 0);

				if (totalAfterNewTransaction > groupAllocation) {
					// Return an object indicating the budget limit issue
					return {
						success: false,
						error: {
							message: 'Transaction exceeds budget category limit',
							details: {
								categoryName: store.categories.get().find((c) => c.id === transaction.categoryId)
									?.name,
								currentSpending: existingSpending,
								newTransactionAmount: transaction.amount,
								groupAllocation: groupAllocation,
								wouldExceedBy: totalAfterNewTransaction - groupAllocation,
							},
						},
					};
				}
			}
		}

		// If no issues, proceed with adding the transaction
		store.transactions.push({
			...transaction,
			id: transaction.id || createUniqueId(),
		});

		return {
			success: true,
			transaction: transaction,
		};
	},

	updateTransaction: (transaction: Transaction) => {
		const index = store.transactions.findIndex((t) => t.id.get() === transaction.id);
		if (index !== -1) {
			store.transactions[index].set(transaction);
		}
	},

	deleteTransaction: (id: string) => {
		const index = store.transactions.get().findIndex((t) => t.id === id);
		if (index !== -1) {
			store.transactions[index].delete();
		}
	},

	// Category operations
	addCategory: (category: Category) => {
		// Check if the category already exists
		const isDuplicate = store.categories.get().some(
			(existingCategory) => existingCategory.name.toLowerCase() === category.name.toLowerCase() // Case-insensitive comparison
		);

		if (!isDuplicate) {
			// Add the category if it doesn't already exist
			store.categories.push({ ...category, id: category.id || createUniqueId() });
		} else {
			console.warn(`Category "${category.name}" already exists.`);
		}
	},

	updateCategory: (category: Category) => {
		const index = store.categories.findIndex((c) => c.id.get() === category.id);
		if (index !== -1) {
			store.categories[index].set(category);
		}
	},

	deleteCategory: (id: string) => {
		const index = store.categories.findIndex((c) => c.id.get() === id);
		if (index !== -1) {
			store.categories[index].delete();
		}
	},

	// Budget operations
	deleteBudget: (id: string) => {
		const index = store.budgets.findIndex((b) => b.id.get() === id);
		if (index !== -1) {
			store.budgets[index].delete();
		}
	},

	// Financial calculations
	getBalance: () => {
		const transactions = store.transactions.get();

		return transactions.reduce((balance, t) => {
			return t.type === 'income' ? balance + t.amount : balance - t.amount;
		}, 0);
	},

	getTotalSpent: () => {
		const transactions = store.transactions.get();

		return transactions.reduce((total, t) => {
			return t.type === 'expense' ? total + t.amount : total;
		}, 0);
	},

	getTotalIncome: () => {
		const transactions = store.transactions.get();

		return transactions.reduce((total, t) => {
			return t.type === 'income' ? total + t.amount : total;
		}, 0);
	},

	getRemainingBudget: () => {
		const totalBudget = store.budgets
			.get()
			.filter((budget) => budget.status === 'active')
			.reduce((sum, budget) => sum + budget.amount, 0);

		const totalSpent = actions.getTotalSpent();
		return totalBudget - totalSpent;
	},

	getPercentageSpent: () => {
		const totalBudget = store.budgets
			.get()
			.filter((budget) => budget.status === 'active')
			.reduce((sum, budget) => sum + budget.amount, 0);

		const totalSpent = actions.getTotalSpent();

		if (totalBudget === 0) return 0;
		return (totalSpent / totalBudget) * 100;
	},

	getCategoryMonthlyTotal: (categoryId: string) => {
		const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

		const total = store.transactions
			.get()
			.filter(
				(t) =>
					t.categoryId === categoryId &&
					new Date(t.date) >= startOfMonth &&
					new Date(t.date) <= endOfMonth
			)
			.reduce((sum, t) => sum + t.amount, 0);

		return total;
	},

	getCategoryTransactions: (categoryId: string, startDate?: Date, endDate?: Date) => {
		const transactions = store.transactions.get();

		if (!startDate && !endDate) {
			return transactions.filter((t) => t.categoryId === categoryId);
		}

		return transactions.filter((t) => {
			const transactionDate = new Date(t.date);
			return (
				t.categoryId === categoryId &&
				(!startDate || transactionDate >= startDate) &&
				(!endDate || transactionDate <= endDate)
			);
		});
	},

	// Budget creation and management
	createBudget: (budgetData: {
		name: string;
		amount: number;
		periodType: BudgetPeriodType;
		ruleType: BudgetRuleType;
		startDate: Date;
		categoryAllocations: BudgetRuleGroups[];
	}) => {
		const { name, amount, periodType, ruleType, startDate, categoryAllocations } = budgetData;

		// Calculate end date based on period type
		const { endDate } = getDateRangeForPeriod(periodType, startDate);

		// Create the budget in draft status
		const newBudget: Budget = {
			id: createUniqueId(),
			name,
			amount,
			startDate,
			endDate,
			periodType,
			ruleType,
			categoryAllocations,
			status: 'draft', // Start as draft until activated
		};

		store.budgets.push(newBudget);
		return newBudget;
	},

	// Activate a budget (and deactivate any other active budget)
	activateBudget: (budgetId: string) => {
		// First deactivate any currently active budget
		const activeBudgets = store.budgets
			.get()
			?.filter((budget) => budget.status === 'active')
			?.map((_, index) => index);

		activeBudgets?.forEach((index) => {
			store.budgets[index].status.set('expired');
		});

		// Then activate the selected budget
		const targetIndex = store.budgets.findIndex((b) => b.id.get() === budgetId);
		if (targetIndex !== -1) {
			store.budgets[targetIndex].status.set('active');
			return store.budgets[targetIndex].get();
		}

		return null;
	},

	// Check if budget has expired and needs renewal
	checkBudgetStatus: () => {
		const now = new Date();
		const activeBudgets = store.budgets.get().filter((b) => b.status === 'active');
		const expiredBudgets = [];

		for (const budget of activeBudgets) {
			if (now > new Date(budget.endDate)) {
				// Set the budget to expired
				const index = store.budgets.findIndex((b) => b.id.get() === budget.id);
				if (index !== -1) {
					store.budgets[index].status.set('expired');
					expiredBudgets.push(budget.id);
				}
			}
		}

		return {
			needsRenewal: expiredBudgets.length > 0,
			expiredBudgetIds: expiredBudgets,
		};
	},
	
	getBudgetById: (budgetId: string) => {
		const budget = store.budgets.get().find((b) => b.id === budgetId);
		return budget;
	},

	// Update an existing budget (only allowed if it's in draft status)
	updateBudget: (budget: Partial<Budget> & { id: string }) => {
		const index = store.budgets.findIndex((b) => b.id.get() === budget.id);
		
		if (index !== -1) {
			const currentBudget = store.budgets[index].get();

			// Only allow updates to drafts or if changing status
			if (currentBudget.status !== 'draft' && budget.status === undefined) {
				console.warn('Cannot update an active or expired budget');
				return currentBudget;
			}

			// Apply updates
			store.budgets[index].set({
				...currentBudget,
				...budget,
			});

			return store.budgets[index].get();
		}

		return null;
	},

	// Renew an expired budget (create a new budget with same settings but new dates)
	renewBudget: (expiredBudgetId: string) => {
		const budget = store.budgets.get().find((b) => b.id === expiredBudgetId);

		if (budget && budget.status === 'expired') {
			// Calculate new dates
			const newStartDate = new Date(); // Start from today
			const { endDate: newEndDate } = getDateRangeForPeriod(budget.periodType, newStartDate);

			// Create new budget with same parameters but new period
			const newBudget: Budget = {
				...budget,
				id: createUniqueId(),
				startDate: newStartDate,
				endDate: newEndDate,
				status: 'draft', // Start as draft
			};

			store.budgets.push(newBudget);
			return newBudget;
		}

		return null;
	},

	// Get spending for current active budget
	getActiveBudgetSpending: () => {
		const activeBudget = store.budgets.get().find((b) => b.status === 'active');
		if (!activeBudget) return null;

		const startDate = new Date(activeBudget.startDate);
		const endDate = new Date(activeBudget.endDate);

		const groupSpending = activeBudget.categoryAllocations.map((group) => {
			// Get all transactions matching group's categories within date range console
			const transactions = store.transactions
				.get()
				.filter(
					(t) =>
						group.categories.includes(t.categoryId) &&
						new Date(t.date) >= startDate &&
						new Date(t.date) <= endDate &&
						t.type === 'expense'
				);

			const spent = actions.getTotalSpent();
			const allocated = (group.percentage / 100) * activeBudget.amount;

			return {
				groupName: group.name,
				allocated,
				spent,
				remaining: allocated - spent,
				percentUsed: allocated > 0 ? (spent / allocated) * 100 : 0,
				transactions,
				// Include category details for reference
				categories: group.categories.map((categoryId) => ({
					id: categoryId,
					name: store.categories.get().find((c) => c.id === categoryId)?.name || '',
				})),
			};
		});

		const totalSpent = groupSpending.reduce((total, group) => total + group.spent, 0);
		const totalRemaining = activeBudget.amount - totalSpent;

		return {
			budget: activeBudget,
			groups: groupSpending,
			totalSpent,
			totalRemaining,
			percentUsed: (totalSpent / activeBudget.amount) * 100,
			startDate,
			endDate,
		};
	},

	// Get all predefined budget templates
	getPredefinedBudgetTemplates: (amount: number) => {
		const templates = [];

		// Iterate over predefined budget rules
		for (const [ruleType, ruleData] of Object.entries(BUDGET_RULE_ALLOCATIONS)) {
			// Skip the 'custom' rule type
			if (ruleType === 'custom') continue;
			// Map the groups to the required BudgetRuleGroups structure
			const categoryAllocations = (
				ruleData as {
					groups: { name: string; percentage: number; description: string; categories: string[] }[];
				}
			).groups.map((group) => ({
				name: group.name,
				percentage: group.percentage,
				description: group.description,
				categories: group.categories, // This will be an empty array by default
			}));

			// Add the template to the list
			templates.push({
				name: ruleType,
				ruleType: ruleType as BudgetRuleType,
				amount,
				categoryAllocations,
			});
		}

		return templates;
	},

	// Get the time remaining in current budget
	getActiveBudgetTimeRemaining: () => {
		const activeBudget = store.budgets.get().find((b) => b.status === 'active');
		if (!activeBudget) return null;

		const now = new Date();
		const endDate = new Date(activeBudget.endDate);

		// Calculate time difference in milliseconds
		const diffMs = endDate.getTime() - now.getTime();
		if (diffMs <= 0) return { expired: true, days: 0, hours: 0 };

		// Convert to days and hours
		const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

		return {
			expired: false,
			days,
			hours,
			periodType: activeBudget.periodType,
			totalDays: calcTotalDaysInPeriod(activeBudget.periodType, new Date(activeBudget.startDate)),
			progressPercentage: 100 - (diffMs / calculateTotalPeriodMs(activeBudget)) * 100,
		};
	},

	// Get all budgets organized by status
	getAllBudgets: () => {
		return {
			active: store.budgets.get().find((b) => b.status === 'active'),
			expired: store.budgets.get().filter((b) => b.status === 'expired'),
			drafts: store.budgets.get().filter((b) => b.status === 'draft'),
		};
	},

	// Get transactions for a specific date range
	getTransactionsByDateRange: (startDate: Date, endDate: Date) => {
		return store.transactions
			.get()
			.filter((t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate);
	},

	// Get spending trends by category over time
	getSpendingTrendsByCategory: (periodType: 'week' | 'month' | 'year', count: number = 6) => {
		const now = new Date();
		const periods = [] as { start: Date; end: Date; label: string }[];

		// Generate periods
		for (let i = 0; i < count; i++) {
			const periodEnd = new Date(now);
			let periodStart;

			switch (periodType) {
				case 'week':
					periodEnd.setDate(now.getDate() - i * 7);
					periodStart = new Date(periodEnd);
					periodStart.setDate(periodEnd.getDate() - 7);
					break;
				case 'month':
					periodEnd.setMonth(now.getMonth() - i);
					periodEnd.setDate(0); // Last day of previous month
					periodStart = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
					break;
				case 'year':
					periodEnd.setFullYear(now.getFullYear() - i);
					periodEnd.setMonth(11, 31); // Dec 31
					periodStart = new Date(periodEnd.getFullYear(), 0, 1); // Jan 1
					break;
			}

			periods.push({
				start: periodStart,
				end: periodEnd,
				label: formatPeriodLabel(periodStart, periodEnd, periodType),
			});
		}

		// Get categories
		const categories = store.categories.get();

		// Calculate spending for each category in each period
		const trends = categories
			.filter((cat) => cat.type === 'expense')
			.map((category) => {
				const periodData = periods.map((period) => {
					const transactions = store.transactions
						.get()
						.filter(
							(t) =>
								t.categoryId === category.id &&
								new Date(t.date) >= period.start &&
								new Date(t.date) <= period.end &&
								t.type === 'expense'
						);

					return {
						period: period.label,
						amount: transactions.reduce((sum, t) => sum + t.amount, 0),
					};
				});

				return {
					categoryId: category.id,
					categoryName: category.name,
					color: category.color,
					data: periodData,
				};
			});

		return {
			periods: periods.map((p) => p.label).reverse(),
			categoryTrends: trends,
		};
	},
};

// Export the store and actions for use in components
const useStore = () => actions;
export default useStore;
