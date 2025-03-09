import { useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
} from 'react-native';
import { ShoppingBag, PlusCircle, DollarSign } from 'lucide-react-native';
import { ShoppingItem } from 'src/types/transaction';
import useShoppingStore from 'src/store/shopping';
import useStore from 'src/store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShoppingList from 'src/components/shopping/list';
import NewItemModal from 'src/components/shopping/new-item-modal';

const ShoppingBudgetPlanner = () => {
	const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
	const [modalVisible, setModalVisible] = useState(false);

	// Store hooks
	const { shoppingLists } = useShoppingStore();
	const { getActiveBudgetSpending, categories } = useStore();
	const currentBudget = getActiveBudgetSpending();

	// Filter expense categories
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	// Budget calculations
	const totalSpent = shoppingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const remainingBudget = currentBudget?.totalRemaining ?? 0;
	const percentageSpent = currentBudget?.percentUsed ?? 0;


	// Open modal and reset form
	const openModal = () => {
		setModalVisible(true);
	};

	// Close modal
	const closeModal = () => {
		setModalVisible(false);
	};

	// Remove item from shopping list
	const removeItem = (id: string) => {
		setShoppingItems(shoppingItems.filter((item) => item.id !== id));
		// Here you would also need to remove from store
	};

	// Get budget status color based on percentage spent
	const getBudgetStatusColor = () => {
		if (percentageSpent >= 90) return '#EF4444'; // Red
		if (percentageSpent >= 70) return '#F59E0B'; // Amber
		return '#10B981'; // Green
	};

	// Get formatted category items for display
	const getCategoryItems = (categoryId: string) => {
		return shoppingItems.filter((item) => item.categoryId === categoryId);
	};

	// Calculate total for a specific category
	const getCategoryTotal = (categoryId: string) => {
		return getCategoryItems(categoryId).reduce((sum, item) => sum + item.price * item.quantity, 0);
	};


	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header with budget information */}
			<View className="bg-white dark:bg-gray-900 px-5 pt-4 pb-5 rounded-b-3xl shadow-sm">
				<Text className="text-2xl font-bold text-gray-800 mb-4 dark:text-white">Shopping Budget</Text>

				<View className="mt-2">
					<View className="mb-4">
						<Text className="text-sm text-gray-500 mb-1 dark:text-gray-400">Remaining Budget</Text>
						<View className="flex-row items-center">
							<DollarSign size={20} color={getBudgetStatusColor()} />
							<Text
								className={`text-2xl font-bold ml-1 ${
									remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'
								}`}
							>
								{remainingBudget.toFixed(2)}
							</Text>
						</View>
					</View>

					{/* Progress bar */}
					<View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
						<View
							style={{
								width: `${Math.min(percentageSpent, 100)}%`,
								backgroundColor: getBudgetStatusColor(),
								height: '100%',
								borderRadius: 8,
							}}
						/>
					</View>

					{/* Stats row */}
					<View className="flex-row justify-between mt-2">
						<View className="items-start">
							<Text className="text-xs text-gray-500 mb-1">Spent</Text>
							<Text className="text-base font-semibold text-gray-800">
								${totalSpent.toFixed(2)}
							</Text>
						</View>
						<View className="items-start">
							<Text className="text-xs text-gray-500 mb-1">Remaining</Text>
							<Text
								className={`text-base font-semibold ${
									remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'
								}`}
							>
								${Math.abs(remainingBudget).toFixed(2)}
								{remainingBudget < 0 ? ' over' : ''}
							</Text>
						</View>
						<View className="items-start">
							<Text className="text-xs text-gray-500 mb-1">Used</Text>
							<Text className="text-base font-semibold" style={{ color: getBudgetStatusColor() }}>
								{percentageSpent.toFixed(0)}%
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Main content */}
			<ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

				{/* Add Item Button */}
				<TouchableOpacity
					className="bg-indigo-600 rounded-2xl p-4 mt-6 flex-row justify-between items-center shadow-md"
					onPress={openModal}
					activeOpacity={0.8}
				>
					<View className="flex-row items-center">
						<PlusCircle size={20} color="#FFFFFF" />
						<Text className="text-base font-semibold text-white ml-3">Add New Item</Text>
					</View>
				</TouchableOpacity>

				{/* Shopping lists by category */}
				<View className="mt-6 mb-10">
					<Text className="text-lg font-bold text-gray-800 mb-3">Shopping List</Text>

					{EXPENSE_CATEGORIES?.filter((category) => getCategoryItems(category.id).length > 0).map(
						(category) => (
							<View
								key={category.id}
								className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
							>
								<View className="flex-row items-center p-4 border-b border-gray-100">
									<View
										className="w-3 h-3 rounded-full mr-2"
										style={{ backgroundColor: category.color }}
									/>
									<Text className="text-base font-semibold text-gray-800 flex-1">
										{category.name}
									</Text>
									<Text className="text-base font-bold text-gray-800">
										${getCategoryTotal(category.id).toFixed(2)}
									</Text>
								</View>

								<ShoppingList
									category={category}
									removeItem={removeItem}
									shoppingItems={getCategoryItems(category.id)}
								/>
							</View>
						)
					)}


					{shoppingItems.length === 0 && (
						<View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center justify-center mt-2">
							<ShoppingBag size={48} color="#9CA3AF" />
							<Text className="text-base text-gray-500 text-center mt-4 leading-6">
								Your shopping list is empty. Add items to get started!
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
			<NewItemModal
				isVisible={modalVisible}
				onClose={closeModal}
				categories={EXPENSE_CATEGORIES}
				budget={currentBudget?.budget!}
			/>
			
		</SafeAreaView>
	);
};

export default ShoppingBudgetPlanner;
