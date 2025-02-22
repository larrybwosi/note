import { observable, } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Transaction, Category, Budget, ShoppingList } from 'src/types/transaction';

// Define the state structure using observables
const state = observable({
  transactions: [] as Transaction[],
  categories: [] as Category[],
  budgets: [] as Budget[],
  shoppingLists: [] as ShoppingList[],
});

// Define actions to manipulate the state
const actions = {
  transactions : use$(state.transactions),
  categories : use$(state.categories),
  budgets : use$(state.budgets),
  shoppingLists : use$(state.shoppingLists),

  addTransaction: (transaction: Transaction) => {
    state.transactions.push(transaction);
  },
  updateTransaction: (transaction: Transaction) => {
    const index = state.transactions.findIndex((t) => use$(t.id) === transaction.id);
    if (index !== -1) {
      state.transactions[index].set(transaction);
    }
  },
  deleteTransaction: (id: string) => {
    state.transactions.set(state.transactions.filter((t) => use$(t.id) !== id));
  },
  addCategory: (category: Category) => {
    state.categories.push(category);
  },
  updateCategory: (category: Category) => {
    const index = state.categories.findIndex((c) => use$(c.id) === category.id);
    if (index !== -1) {
      state.categories[index].set(category);
    }
  },
  deleteCategory: (id: string) => {
    state.categories[state.categories.findIndex((c) => use$(c.id) === id)].delete();
  },
  addBudget: (budget: Budget) => {
    state.budgets.push(budget);
  },
  updateBudget: (budget: Budget) => {
    const index = state.budgets.findIndex((b) => use$(b.id) === budget.id);
    if (index !== -1) {
      state.budgets[index].set(budget);
    }
    return budget;
  },
  deleteBudget: (id: string) => {
    // state.budgets.set(state.budgets.filter((b) => use$(b.id) !== id));
    state.budgets[state.budgets.findIndex((b) => use$(b.id) === id)].delete();
  },
  addShoppingList: (list: ShoppingList) => {
    state.shoppingLists.push(list);
  },
  updateShoppingList: (list: ShoppingList) => {
    const index = state.shoppingLists.findIndex((l) => use$(l.id) === list.id);
    if (index !== -1) {
      state.shoppingLists[index].set(list);
    }
  },
  deleteShoppingList: (id: string) => {
    state.shoppingLists.set(state.shoppingLists.filter((l) => use$(l.id) !== id));
  },
};

// Export the state and actions for use in components
export const useStore = () => actions;
export default useStore;