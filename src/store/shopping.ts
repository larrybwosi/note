import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { use$ } from '@legendapp/state/react';
import { synced } from '@legendapp/state/sync';
import { ShoppingItem } from 'src/types/transaction';


// Define ShoppingList interface since it's used in your code
export interface ShoppingList {
	id: string;
	name: string;
	items: ShoppingItem[];
	createdAt: Date;
	updatedAt: Date;
}

export const shoppingStore = observable(
	synced({
		initial: {
			shoppingLists: [] as ShoppingList[],
		},
		persist: {
			name: 'financeshoppingStore',
			plugin: ObservablePersistMMKV,
		},
	})
);

// Define actions to manipulate the shoppingStore
const actions = {
	// Getters using use$ to subscribe to reactive state
	shoppingLists: () => shoppingStore.shoppingLists.get(),


	// Shopping list actions
	addShoppingList: (list: ShoppingList) => {
		shoppingStore.shoppingLists.push(list);
	},

	updateShoppingList: (list: ShoppingList) => {
		const index = use$(shoppingStore.shoppingLists).findIndex((l) => l.id === list.id);
		if (index !== -1) {
			shoppingStore.shoppingLists[index].set(list);
		}
	},

	deleteShoppingList: (id: string) => {
		const filtered = use$(shoppingStore.shoppingLists).filter((l) => l.id !== id);
		shoppingStore.shoppingLists.set(filtered);
	},

	// ShoppingItem actions
	addItem: (item: Omit<ShoppingItem, 'id' | 'dateAdded'>) => {
		const newItem: ShoppingItem = {
			...item,
			id: Date.now().toString(),
			dateAdded: new Date(),
		};

		// Find the shopping list to add to
		const listIndex = 0; // This should be modified based on your app logic
		if (use$(shoppingStore.shoppingLists).length > listIndex) {
			shoppingStore.shoppingLists[listIndex].items.push(newItem);
		}
	},

	updateItem: (id: string, updates: Partial<Omit<ShoppingItem, 'id'>>) => {
		// Update item in all shopping lists
		use$(shoppingStore.shoppingLists).forEach((list, listIndex) => {
			const itemIndex = list.items.findIndex((item) => item.id === id);
			if (itemIndex !== -1) {
				shoppingStore.shoppingLists[listIndex].items[itemIndex].assign(updates);
			}
		});
	},

	removeItem: (id: string) => {
		// Remove item from all shopping lists
		use$(shoppingStore.shoppingLists).forEach((list, listIndex) => {
			const items = list.items.filter((item) => item.id !== id);
			shoppingStore.shoppingLists[listIndex].items.set(items);
		});
	},

	toggleItemCompleted: (id: string) => {
		// Toggle completed state in all shopping lists
		use$(shoppingStore.shoppingLists).forEach((list, listIndex) => {
			const itemIndex = list.items.findIndex((item) => item.id === id);
			if (itemIndex !== -1) {
				const currentValue = !!use$(
					shoppingStore.shoppingLists[listIndex].items[itemIndex].completed
				);
				shoppingStore.shoppingLists[listIndex].items[itemIndex].completed.set(!currentValue);
			}
		});
	},

	clearCompletedItems: () => {
		// Clear completed items from all shopping lists
		use$(shoppingStore.shoppingLists).forEach((list, listIndex) => {
			const items = list.items.filter((item) => !item.completed);
			shoppingStore.shoppingLists[listIndex].items.set(items);
		});
	},

	clearAllItems: () => {
		// Clear all items from all shopping lists
		use$(shoppingStore.shoppingLists).forEach((list, listIndex) => {
			shoppingStore.shoppingLists[listIndex].items.set([]);
		});
	},
	getCategoryItems: (categoryId: string) => {
		const items: ShoppingItem[] = [];

		// Collect all items from all shopping lists with matching categoryId
		use$(shoppingStore.shoppingLists).forEach((list) => {
			items.push(...list.items.filter((item) => item.categoryId === categoryId));
		});

		const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
		return { items, total };
	},
};

// Export the shoppingStore and actions for use in components
const useShoppingStore = () => actions;
export default useShoppingStore;
