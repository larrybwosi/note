import { use$ } from '@legendapp/state/react';
import { Banknote, LucideIcon } from 'lucide-react-native';
import useStore, { store } from 'src/store/useStore';
import { Category, DEFAULT_CATEGORIES, ICON_MAP, IconName } from 'src/types/transaction';

/**
 * Retrieves the icon for a transaction based on its categoryId.
 * @param categoryId - The ID of the category associated with the transaction.
 * @returns The corresponding LucideIcon component, or a default icon if not found.
 */
export const getTransactionIcon = (categoryId: string): LucideIcon => {
	const { categories } = useStore(); // Access the categories from your store

	// Find the category by categoryId
	const category = categories.find((cat) => cat.id === categoryId);

	// If the category is found and has a valid icon, return the corresponding icon
	if (category && category.icon in ICON_MAP) {
		return ICON_MAP[category.icon as IconName];
	}

	// Return a default icon if the category or icon is not found
	return Banknote; // You can change this to any default icon you prefer
};

export const getTransactionTitle = (categoryId: string): string => {
	const { categories } = useStore(); // Access the categories from your store
	// Find the category by categoryId
	const category = categories.find((cat) => cat.id === categoryId);

	// If the category is found and has a valid icon, return the corresponding icon
	if (category && category.icon in ICON_MAP) {
		return category.name;
	}

	// Return a default icon if the category or icon is not found
	return 'Transaction'; // You can change this to any default icon you prefer
};

export const getTransactionCategory = (categoryId: string): Category => {
	const { categories } = useStore(); // Access the categories from your store
	// Find the category by categoryId
	const category = categories.find((cat) => cat.id === categoryId);

	// If the category is found and has a valid icon, return the corresponding icon
	if (category && category.icon in ICON_MAP) {
		return category;
	}
	
	return DEFAULT_CATEGORIES[0]
};
