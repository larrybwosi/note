import { observable, } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { use$ } from '@legendapp/state/react';
import { synced } from '@legendapp/state/sync';
import { Transaction, Category, Budget, ShoppingList, DEFAULT_CATEGORIES } from 'src/types/transaction';

// Define the store structure using observables
export const store = observable(
	synced({
		initial: {
			transactions: [] as Transaction[],
			categories: DEFAULT_CATEGORIES as Category[],
			budgets: [] as Budget[],
			shoppingLists: [] as ShoppingList[],
		},
		persist: {
			name: 'financestore',
			plugin: ObservablePersistMMKV,
		},
	})
);

// Define actions to manipulate the store
const actions = {
	transactions: use$(store.transactions),
	categories: use$(store.categories),
	budgets: use$(store.budgets),
	shoppingLists: use$(store.shoppingLists),

	addTransaction: (transaction: Transaction) => {
		store.transactions.push(transaction);
	},
	updateTransaction: (transaction: Transaction) => {
		const index = store.transactions.findIndex((t) => use$(t.id) === transaction.id);
		if (index !== -1) {
			store.transactions[index].set(transaction);
		}
	},
	deleteTransaction: (id: string) => {
		store.transactions.set(store.transactions.filter((t) => use$(t.id) !== id));
	},
	addCategory: (category: Category) => {
		store.categories.push(category);
	},
	updateCategory: (category: Category) => {
		const index = store.categories.findIndex((c) => use$(c.id) === category.id);
		if (index !== -1) {
			store.categories[index].set(category);
		}
	},
	deleteCategory: (id: string) => {
		store.categories[store.categories.findIndex((c) => use$(c.id) === id)].delete();
	},
	addBudget: (budget: Budget) => {
		store.budgets.push(budget);
	},
	updateBudget: (budget: Budget) => {
		const index = store.budgets.findIndex((b) => use$(b.id) === budget.id);
		if (index !== -1) {
			store.budgets[index].set(budget);
		}
		return budget;
	},
	deleteBudget: (id: string) => {
		// store.budgets.set(store.budgets.filter((b) => use$(b.id) !== id));
		store.budgets[store.budgets.findIndex((b) => use$(b.id) === id)].delete();
	},
	addShoppingList: (list: ShoppingList) => {
		store.shoppingLists.push(list);
	},
	updateShoppingList: (list: ShoppingList) => {
		const index = store.shoppingLists.findIndex((l) => use$(l.id) === list.id);
		if (index !== -1) {
			store.shoppingLists[index].set(list);
		}
	},
	deleteShoppingList: (id: string) => {
		store.shoppingLists.set(store.shoppingLists.filter((l) => use$(l.id) !== id));
	},
	getTotalSpent: () => {
		return store.transactions.reduce((total, t) => total + use$(t.amount), 0);
	},
	getBalance: () => {
		const totalIncome = store.transactions
			.map((t) => (use$(t.type) === 'income' ? use$(t.amount) : 0))
			.reduce((total, amount) => total + amount, 0);

		const totalExpense = store.transactions
			.map((t) => (use$(t.type) === 'expense' ? use$(t.amount) : 0))
			.reduce((total, amount) => total + amount, 0);

		const balance = totalIncome - totalExpense;

		// If expenses are more than income, return the negative of the balance
		return totalExpense > totalIncome ? -Math.abs(balance) : balance;
	},
	getCategoryMonthlyTotal: (categotyId: string) => {
		return '0';
	},
};

// Export the store and actions for use in components
export const useStore = () => actions;
export default useStore;