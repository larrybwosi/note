import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import {
	ShoppingBag,
	PlusCircle,
	X,
	DollarSign,
	TrendingUp,
	ChevronDown,
	ChevronUp,
} from 'lucide-react-native';
import useShoppingStore from 'src/store/shopping';
import useStore from 'src/store/useStore';
import { useObservable } from '@legendapp/state/react';
import { use$ } from '@legendapp/state/react';

// Mock budget
const ShoppingBudgetPlanner = () => {
	const [newItemName, setNewItemName] = useState('');
	const [newItemPrice, setNewItemPrice] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState('1');
	const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
	const selectedCategoryId$ = useObservable('');
	const selectedCategoryId = use$(selectedCategoryId$);
	const setSelectedCategory = (categoryId: string) => {
		selectedCategoryId$.set(categoryId);
	};
	const { categories, getCategoryMonthlyTotal, budgets } = useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	const {
		shoppingLists,
		addItem,
		removeItem,
		toggleItemCompleted,
		getTotalSpent,
		getRemainingBudget,
		getPercentageSpent,
		getCategoryItems,
	} = useShoppingStore();
	// Calculate total spent
	const totalSpent = getTotalSpent();
	const remainingBudget = getRemainingBudget();
	const percentageSpent = getPercentageSpent();
	const currentBudget = budgets?.find((b) => b.status === 'active');
	console.log(currentBudget);

	// Function to add item to shopping list
	const handleAddItem = () => {
		if (!selectedCategoryId) {
			Alert.alert('Error', 'Please select a category first');
			return;
		}

		if (!newItemName.trim()) {
			Alert.alert('Error', 'Please enter an item name');
			return;
		}

		const price = parseFloat(newItemPrice);
		if (isNaN(price) || price <= 0) {
			Alert.alert('Error', 'Please enter a valid price');
			return;
		}

		const quantity = parseInt(newItemQuantity);
		if (isNaN(quantity) || quantity <= 0) {
			Alert.alert('Error', 'Please enter a valid quantity');
			return;
		}

		// Check if adding this item would exceed the budget
		if (totalSpent + price * quantity > currentBudget?.amount!) {
			Alert.alert(
				'Budget Warning',
				'Adding this item will exceed your budget. Do you want to continue?',
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Add Anyway',
						style: 'destructive',
						onPress: () => {
							addItem({
								name: newItemName.trim(),
								categoryId: selectedCategoryId,
								price,
								quantity,
								purchased: false,
								priority: 'medium',
							});
							setNewItemName('');
							setNewItemPrice('');
							setNewItemQuantity('1');
						},
					},
				]
			);
		} else {
			addItem({
				name: newItemName.trim(),
				categoryId: selectedCategoryId,
				price,
				quantity,
				purchased: false,
				priority: 'medium',
			});
			setNewItemName('');
			setNewItemPrice('');
			setNewItemQuantity('1');
		}
	};

	// Function to toggle category expansion
	const toggleExpand = (categoryId: string) => {
		setExpanded({
			...expanded,
			[categoryId]: !expanded[categoryId],
		});
	};

	// Get budget status color
	const getBudgetStatusColor = () => {
		if (percentageSpent >= 90) return '#EF4444'; // Red
		if (percentageSpent >= 70) return '#F59E0B'; // Amber
		return '#10B981'; // Green
	};

	return (
		<View className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header with budget information */}
			<View className="bg-white dark:bg-gray-800 p-4 rounded-b-3xl shadow-md mb-4">
				<Text className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
					Shopping Planner
				</Text>

				<View className="mt-4 mb-2">
					<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Budget</Text>
					<View className="flex-row items-center">
						<DollarSign size={20} color="#10B981" />
						<Text className="text-xl font-bold text-gray-800 dark:text-white">
							${currentBudget?.amount.toFixed(2)}
						</Text>
					</View>
				</View>

				<View className="bg-gray-100 dark:bg-gray-700 h-4 rounded-full overflow-hidden mt-2">
					<View
						className="h-full"
						style={{
							width: `${Math.min(percentageSpent, 100)}%`,
							backgroundColor: getBudgetStatusColor(),
						}}
					/>
				</View>

				<View className="flex-row justify-between mt-2">
					<View>
						<Text className="text-sm text-gray-500 dark:text-gray-400">Spent</Text>
						<Text className="font-bold text-gray-800 dark:text-white">
							${totalSpent.toFixed(2)}
						</Text>
					</View>
					<View>
						<Text className="text-sm text-gray-500 dark:text-gray-400">Remaining</Text>
						<Text
							className="font-bold"
							style={{ color: remainingBudget >= 0 ? '#10B981' : '#EF4444' }}
						>
							${remainingBudget.toFixed(2)}
						</Text>
					</View>
					<View>
						<Text className="text-sm text-gray-500 dark:text-gray-400">Percentage</Text>
						<Text className="font-bold" style={{ color: getBudgetStatusColor() }}>
							{percentageSpent.toFixed(0)}%
						</Text>
					</View>
				</View>
			</View>

			{/* Main content */}
			<ScrollView className="flex-1 px-4">
				{/* Categories section */}
				<View className="mb-6">
					<Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Categories</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
						{EXPENSE_CATEGORIES.map((category) => (
							<TouchableOpacity
								key={category.id}
								className={`mr-3 p-3 rounded-xl ${selectedCategoryId === category.id ? 'bg-blue-500' : 'bg-white dark:bg-gray-800'} shadow-sm`}
								style={{
									borderLeftWidth: 4,
									borderLeftColor: category.color,
								}}
								onPress={() => setSelectedCategory(category.id)}
							>
								<Text
									className={`font-medium ${selectedCategoryId === category.id ? 'text-white' : 'text-gray-800 dark:text-white'}`}
								>
									{category.name}
								</Text>
								<Text
									className={`text-xs ${selectedCategoryId === category.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
								>
									{category.subcategories?.length || 0} subcategories
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Add item form */}
				<View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
					<Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">Add Item</Text>

					<View className="mb-3">
						<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Name</Text>
						<TextInput
							className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg"
							placeholder="Enter item name"
							placeholderTextColor="#9CA3AF"
							value={newItemName}
							onChangeText={setNewItemName}
						/>
					</View>

					<View className="flex-row mb-3">
						<View className="flex-1 mr-2">
							<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price ($)</Text>
							<TextInput
								className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg"
								placeholder="0.00"
								placeholderTextColor="#9CA3AF"
								keyboardType="decimal-pad"
								value={newItemPrice}
								onChangeText={setNewItemPrice}
							/>
						</View>
						<View className="flex-1 ml-2">
							<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quantity</Text>
							<TextInput
								className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg"
								placeholder="1"
								placeholderTextColor="#9CA3AF"
								keyboardType="number-pad"
								value={newItemQuantity}
								onChangeText={setNewItemQuantity}
							/>
						</View>
					</View>

					<TouchableOpacity
						className="bg-blue-500 p-3 rounded-lg flex-row justify-center items-center"
						onPress={handleAddItem}
					>
						<PlusCircle size={20} color="white" className="mr-2" />
						<Text className="text-white font-medium">Add to List</Text>
					</TouchableOpacity>
				</View>

				{/* Shopping list */}
				<View className="mb-6">
					<Text className="text-lg font-bold text-gray-800 dark:text-white mb-3">
						Shopping List
					</Text>

					{EXPENSE_CATEGORIES.map((category) => {
						const { items, total } = getCategoryItems(category.id);
						if (items?.length === 0) return null;

						return (
							<View
								key={category.id}
								className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm mb-3"
							>
								<TouchableOpacity
									className="flex-row justify-between items-center p-4"
									onPress={() => toggleExpand(category.id)}
									style={{
										borderLeftWidth: 4,
										borderLeftColor: category.color,
									}}
								>
									<View className="flex-row items-center">
										<View
											className="w-8 h-8 rounded-full justify-center items-center mr-2"
											style={{ backgroundColor: category.color }}
										>
											<ShoppingBag size={16} color="white" />
										</View>
										<View>
											<Text className="font-medium text-gray-800 dark:text-white">
												{category.name}
											</Text>
											<Text className="text-xs text-gray-500 dark:text-gray-400">
												{items?.length} items
											</Text>
										</View>
									</View>
									<View className="flex-row items-center">
										<Text className="font-bold text-gray-800 dark:text-white mr-2">
											${total.toFixed(2)}
										</Text>
										{expanded[category.id] ? (
											<ChevronUp size={20} color="#9CA3AF" />
										) : (
											<ChevronDown size={20} color="#9CA3AF" />
										)}
									</View>
								</TouchableOpacity>

								{expanded[category.id] && (
									<View className="p-4 border-t border-gray-100 dark:border-gray-700">
										{items.map((item) => (
											<View
												key={item.id}
												className="flex-row justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700"
											>
												<View>
													<Text className="text-gray-800 dark:text-white">{item.name}</Text>
													<Text className="text-xs text-gray-500 dark:text-gray-400">
														${item.price.toFixed(2)} × {item.quantity}
													</Text>
												</View>
												<View className="flex-row items-center">
													<Text className="font-medium text-gray-800 dark:text-white mr-3">
														${(item.price * item.quantity).toFixed(2)}
													</Text>
													<TouchableOpacity onPress={() => removeItem(item.id)}>
														<X size={18} color="#EF4444" />
													</TouchableOpacity>
												</View>
											</View>
										))}
									</View>
								)}
							</View>
						);
					})}

					{shoppingLists?.length === 0 && (
						<View className="bg-white dark:bg-gray-800 rounded-xl p-6 items-center">
							<ShoppingBag size={40} color="#9CA3AF" />
							<Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
								Your shopping list is empty.
								{'\n'}
								Add items to get started!
							</Text>
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
};

export default ShoppingBudgetPlanner;
