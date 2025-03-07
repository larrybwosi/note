import React, { useState, useCallback, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from 'react-native';
import { ShoppingBag, PlusCircle, DollarSign, Tag, X, Calendar, Info } from 'lucide-react-native';
import { ShoppingItem } from 'src/types/transaction';
import useShoppingStore from 'src/store/shopping';
import useStore from 'src/store/useStore';
import ShoppingList from './list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ShoppingBudgetPlanner = () => {
	// State management
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
	const [newItemName, setNewItemName] = useState('');
	const [newItemPrice, setNewItemPrice] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState('1');
	const [newItemDescription, setNewItemDescription] = useState('');
	const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
	const [modalVisible, setModalVisible] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Store hooks
	const { addItem, shoppingLists } = useShoppingStore();
	const { getActiveBudgetSpending, categories } = useStore();
	const currentBudget = getActiveBudgetSpending();

	// Filter expense categories
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	// Budget calculations
	const totalSpent = shoppingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const remainingBudget = currentBudget?.totalRemaining ?? 0;
	const percentageSpent = currentBudget?.percentUsed ?? 0;

	// Load shopping items when component is focused
	useFocusEffect(
		useCallback(() => {
			const storedItems = shoppingItems;
			if (storedItems && storedItems.length > 0) {
				setShoppingItems(storedItems);
			}

			// Auto-select first category if none selected
			if (!selectedCategory && EXPENSE_CATEGORIES.length > 0) {
				setSelectedCategory(EXPENSE_CATEGORIES[0].id);
			}

			return () => {};
		}, [shoppingItems, EXPENSE_CATEGORIES, selectedCategory])
	);

	// Open modal and reset form
	const openModal = () => {
		setNewItemName('');
		setNewItemPrice('');
		setNewItemQuantity('1');
		setNewItemDescription('');
		setPurchaseDate(new Date());
		setModalVisible(true);
	};

	// Close modal
	const closeModal = () => {
		setModalVisible(false);
		Keyboard.dismiss();
	};

	// Handle date change
	const onDateChange = (event: any, selectedDate: Date | undefined) => {
		const currentDate = selectedDate || purchaseDate;
		setShowDatePicker(Platform.OS === 'ios');
		setPurchaseDate(currentDate);
	};

	// Add item to shopping list
	const handleAddItem = () => {
		if (!selectedCategory) {
			Alert.alert('Please Select Category', 'Please select a category before adding an item.');
			return;
		}

		if (!newItemName.trim()) {
			Alert.alert('Missing Information', 'Please enter an item name.');
			return;
		}

		const price = parseFloat(newItemPrice);
		if (isNaN(price) || price <= 0) {
			Alert.alert('Invalid Price', 'Please enter a valid price greater than zero.');
			return;
		}

		const quantity = parseInt(newItemQuantity);
		if (isNaN(quantity) || quantity <= 0) {
			Alert.alert('Invalid Quantity', 'Please enter a valid quantity greater than zero.');
			return;
		}

		const newItem: ShoppingItem = {
			id: Date.now().toString(),
			name: newItemName.trim(),
			categoryId: selectedCategory,
			price: price,
			quantity: quantity,
			purchased: false,
			dateAdded: new Date(),
			dateToPurchase: purchaseDate,
			priority: 'medium',
			description: newItemDescription.trim(),
		};

		// Check if adding this item would exceed the budget
		if (totalSpent + price * quantity > remainingBudget) {
			Alert.alert(
				'Budget Warning',
				'Adding this item will exceed your remaining budget. Do you want to continue?',
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Add Anyway',
						style: 'destructive',
						onPress: () => {
							addItemToList(newItem);
						},
					},
				]
			);
		} else {
			addItemToList(newItem);
		}
	};

	// Helper function to add item and reset form
	const addItemToList = (item: ShoppingItem) => {
		addItem({
			name: item.name,
			categoryId: item.categoryId,
			price: item.price,
			quantity: item.quantity,
			purchased: false,
			priority: 'medium',
			description: item.description,
			dateToPurchase: item.dateToPurchase,
		});

		setShoppingItems([...shoppingItems, item]);
		closeModal();
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

	// Format date for display
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header with budget information */}
			<View className="bg-white px-5 pt-4 pb-5 rounded-b-3xl shadow-sm">
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
						<View className="bg-white rounded-2xl p-6 items-center justify-center mt-2">
							<ShoppingBag size={48} color="#9CA3AF" />
							<Text className="text-base text-gray-500 text-center mt-4 leading-6">
								Your shopping list is empty. Add items to get started!
							</Text>
						</View>
					)}
				</View>
			</ScrollView>

			{/* Add Item Modal */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={closeModal}
			>
				<KeyboardAvoidingView
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					className="flex-1"
				>
					<View className="flex-1 bg-black/50 justify-end">
						<View className="bg-white rounded-t-3xl p-6 shadow-lg">
							<View className="flex-row justify-between items-center mb-6">
								<Text className="text-lg font-bold text-gray-800">Add New Item</Text>
								<TouchableOpacity onPress={closeModal}>
									<X size={24} color="#6B7280" />
								</TouchableOpacity>
							</View>

							<ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
								<View className="mb-4">
									<Text className="text-sm text-gray-600 mb-2">Item Name</Text>
									<TextInput
										className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-800"
										placeholder="Enter item name"
										placeholderTextColor="#9CA3AF"
										value={newItemName}
										onChangeText={setNewItemName}
									/>
								</View>

								<View className="flex-row justify-between mb-4">
									<View className="flex-1 mr-2">
										<Text className="text-sm text-gray-600 mb-2">Price ($)</Text>
										<TextInput
											className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-800"
											placeholder="0.00"
											placeholderTextColor="#9CA3AF"
											keyboardType="decimal-pad"
											value={newItemPrice}
											onChangeText={setNewItemPrice}
										/>
									</View>
									<View className="flex-1 ml-2">
										<Text className="text-sm text-gray-600 mb-2">Quantity</Text>
										<TextInput
											className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-800"
											placeholder="1"
											placeholderTextColor="#9CA3AF"
											keyboardType="number-pad"
											value={newItemQuantity}
											onChangeText={setNewItemQuantity}
										/>
									</View>
								</View>

								<View className="mb-4">
									<Text className="text-sm text-gray-600 mb-2">Description (optional)</Text>
									<TextInput
										className="bg-gray-100 p-3 rounded-xl border border-gray-200 text-gray-800"
										placeholder="Add notes or details about this item"
										placeholderTextColor="#9CA3AF"
										multiline={true}
										numberOfLines={3}
										textAlignVertical="top"
										value={newItemDescription}
										onChangeText={setNewItemDescription}
									/>
								</View>

								<View className="mb-6">
									<Text className="text-sm text-gray-600 mb-2">Purchase By Date</Text>
									<Pressable
										className="bg-gray-100 p-3 rounded-xl border border-gray-200 flex-row justify-between items-center"
										onPress={() => setShowDatePicker(true)}
									>
										<Text className="text-gray-800">{formatDate(purchaseDate)}</Text>
										<Calendar size={20} color="#6B7280" />
									</Pressable>
									{showDatePicker && (
										<DateTimePicker
											value={purchaseDate}
											mode="date"
											display="default"
											onChange={onDateChange}
											minimumDate={new Date()}
										/>
									)}
								</View>

								<View className="mb-4">
									<Text className="text-sm text-gray-600 mb-3">Category</Text>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{ paddingBottom: 8 }}
									>
										{EXPENSE_CATEGORIES?.map((category) => {
											const isSelected = selectedCategory === category.id;
											return (
												<TouchableOpacity
													key={category.id}
													className={`rounded-xl p-3 mr-3 min-w-[90px] border ${
														isSelected
															? 'bg-indigo-100 border-indigo-500'
															: 'bg-white border-gray-200'
													}`}
													onPress={() => setSelectedCategory(category.id)}
												>
													<View
														style={{ backgroundColor: category.color }}
														className="w-full h-2 rounded-full mb-2"
													/>
													<Text
														className={`text-sm font-medium ${
															isSelected ? 'text-indigo-700' : 'text-gray-700'
														} text-center`}
													>
														{category.name}
													</Text>
												</TouchableOpacity>
											);
										})}
									</ScrollView>
								</View>
							</ScrollView>

							<TouchableOpacity
								className="bg-indigo-600 p-4 rounded-xl mt-4 flex-row justify-center items-center"
								onPress={handleAddItem}
							>
								<PlusCircle size={20} color="white" />
								<Text className="text-base font-semibold text-white ml-2">
									Add to Shopping List
								</Text>
							</TouchableOpacity>

							{/* Budget warning if applicable */}
							{remainingBudget < 20 && (
								<View className="flex-row items-center mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
									<Info size={18} color="#F59E0B" />
									<Text className="text-sm text-amber-700 ml-2 flex-1">
										Your budget is running low. Consider prioritizing essential items.
									</Text>
								</View>
							)}
						</View>
					</View>
				</KeyboardAvoidingView>
			</Modal>
		</SafeAreaView>
	);
};

export default ShoppingBudgetPlanner;
