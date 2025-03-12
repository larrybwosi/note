import { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Modal,
	Pressable,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
	TouchableWithoutFeedback,
} from 'react-native';
import { PlusCircle, X, Calendar, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useShoppingStore from 'src/store/shopping';
import useStore from 'src/store/useStore';
import { Budget, BudgetRuleGroups, Category, ShoppingItem } from 'src/types/transaction';
import { useFeedbackModal } from '../ui/feedback';

interface NewItemModalProps {
	isVisible: boolean;
	onClose: () => void;
	categories: Category[];
	budget: Budget | null;
}

const NewItemModal = ({ isVisible, onClose, categories, budget }: NewItemModalProps) => {
	// State management
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
	const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
	const [newItemName, setNewItemName] = useState('');
	const [newItemPrice, setNewItemPrice] = useState('');
	const [newItemQuantity, setNewItemQuantity] = useState('1');
	const [newItemDescription, setNewItemDescription] = useState('');
	const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

	// Store hooks
	const { addItemToList:addItem, getActiveListId } = useShoppingStore();
	const { getActiveBudgetSpending } = useStore();
	const { showModal, hideModal} = useFeedbackModal()
	const currentBudget = getActiveBudgetSpending();
	const activeListId = getActiveListId()

	// Budget calculations
	const totalSpent = shoppingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const remainingBudget = currentBudget?.totalRemaining ?? 0;

	// Set up available categories based on budget groups
	useEffect(() => {
		if (!budget) {
			setAvailableCategories(categories);
			return;
		}

		// Get all category IDs from budget groups
		const budgetCategoryIds = budget.categoryAllocations.flatMap((group) => group.categories);

		// Filter categories to only show those in the budget groups
		const budgetCategories = categories.filter((category) =>
			budgetCategoryIds.includes(category.id)
		);

		setAvailableCategories(budgetCategories);

		// Reset selected category when budget changes
		setSelectedCategory(null);
		setSelectedGroupId(null);
	}, [budget, categories]);

	// Find which group a category belongs to
	const findGroupForCategory = (categoryId: string): BudgetRuleGroups | undefined => {
		if (!budget || !categoryId) return undefined;

		return budget.categoryAllocations.find((group) => group.categories.includes(categoryId));
	};

	// Get remaining balance for a group
	const getGroupRemainingBalance = (group: BudgetRuleGroups | undefined): number => {
		if (!group || !budget) return 0;

		// Otherwise calculate from budget amount and percentage
		const groupTotal = budget.amount * (group.percentage / 100);

		// TODO: This is a placeholder. In a real app, you would calculate
		// actual spending for this group from transactions
		return groupTotal;
	};

	// Close modal
	const closeModal = () => {
		setNewItemName('');
		setNewItemPrice('');
		setNewItemQuantity('1');
		setNewItemDescription('');
		setPurchaseDate(new Date());
		setSelectedCategory(null);
		setSelectedGroupId(null);
		onClose();
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
			showModal({
        type: "warning",
        title: "Please Select Category",
        message: "Please select a category before adding an item.",
				primaryButtonText: 'Okay',
				autoClose:true,
      });
			return;
		}

		if (!newItemName.trim()) {
			showModal({
        type: "warning",
        title: "Missing Information",
        message: "Please enter an item name.",
        primaryButtonText: "Okay",
        autoClose: true,
      });
			return;
		}

		const price = parseFloat(newItemPrice);
		if (isNaN(price) || price <= 0) {
			showModal({
        type: "warning",
        title: "Invalid Price",
        message: "Please enter a valid price greater than zero.",
        primaryButtonText: "Okay",
        autoClose: true,
      });
			return;
		}

		const quantity = parseInt(newItemQuantity);
		if (isNaN(quantity) || quantity <= 0) {
			showModal({
        type: "warning",
        title: "Invalid Quantity",
        message: "Please enter a valid quantity greater than zero.",
        primaryButtonText: "Okay",
				onPrimaryAction: ()=> hideModal(),
        autoClose: true,
      });
			return;
		}

		const selectedGroup = findGroupForCategory(selectedCategory);
		const groupRemainingBalance = getGroupRemainingBalance(selectedGroup);

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

		// Check if adding this item would exceed the group budget
		const itemTotal = price * quantity;
		if (selectedGroup && itemTotal > groupRemainingBalance) {
			showModal({
        type: "confirmation",
        title: "Group Budget Warning",
        message: `Adding this item will exceed your remaining budget for ${selectedGroup.name}. Do you want to continue?`,
        primaryButtonText: "Cancel",
        secondaryButtonText: "Add Anyway",
				onPrimaryAction: ()=> hideModal(),
        onSecondaryAction: () => {
          addItemToList(newItem);
        },
      });
			
		}
		// Check overall budget
		else if (totalSpent + itemTotal > remainingBudget) {
			showModal({
        type: "confirmation",
        title: "Budget Warning",
        message:
          "Adding this item will exceed your overall remaining budget. Do you want to continue?",
        primaryButtonText: "Cancel",
        secondaryButtonText: "Add Anyway",
				onPrimaryAction: ()=> hideModal(),
        onSecondaryAction: () => {
          addItemToList(newItem);
        },
      });
		} else {
			addItemToList(newItem);
		}
	};

	// Helper function to add item and reset form
	const addItemToList = (item: ShoppingItem) => {
		addItem(activeListId!, {
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      quantity: item.quantity,
      description: item.description,
      dateToPurchase: item.dateToPurchase,
			completed:false
    });

		setShoppingItems([...shoppingItems, item]);
		closeModal();
	};

	// Format currency
	const formatCurrency = (amount: number): string => {
		return `$${amount.toFixed(2)}`;
	};

	// Format date for display
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	// Render budget groups section
	const renderBudgetGroups = () => {
		if (!budget || !budget.categoryAllocations.length) {
			return null;
		}

		return (
			<View className="mb-4">
				<Text className="text-sm text-gray-600 mb-3">Budget Groups</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 8 }}
				>
					{budget.categoryAllocations.map((group, index) => {
						const isSelected = selectedGroupId === index;
						const remainingBalance = getGroupRemainingBalance(group);

						return (
							<TouchableOpacity
								key={index}
								className={`rounded-xl p-3 mr-3 min-w-[130px] border ${
									isSelected ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-200'
								}`}
								onPress={() => {
									setSelectedGroupId(index);
									setSelectedCategory(null); // Reset category selection
								}}
							>
								<View
									style={{ backgroundColor: group.color }}
									className="w-full h-2 rounded-full mb-2"
								/>
								<Text
									className={`text-sm font-medium ${
										isSelected ? 'text-indigo-700' : 'text-gray-700'
									}`}
								>
									{group.name}
								</Text>
								<Text className="text-xs text-gray-500 mt-1">
									{formatCurrency(remainingBalance)} remaining
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>
		);
	};

	// Render categories section
	const renderCategories = () => {
		// If a group is selected, only show categories from that group
		const categoriesToShow =
			selectedGroupId !== null && budget
				? availableCategories.filter((cat) =>
						budget.categoryAllocations[selectedGroupId].categories.includes(cat.id)
					)
				: availableCategories;

		if (!categoriesToShow.length) {
			return (
				<View className="mb-4 p-3 bg-gray-100 rounded-xl">
					<Text className="text-sm text-gray-600 text-center">
						{selectedGroupId !== null ? 'No categories in this group' : 'No categories available'}
					</Text>
				</View>
			);
		}

		return (
			<View className="mb-4">
				<Text className="text-sm text-gray-600 mb-3">Category</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 8 }}
				>
					{categoriesToShow.map((category) => {
						const isSelected = selectedCategory === category.id;
						const categoryGroup = findGroupForCategory(category.id);
						const remainingBalance = getGroupRemainingBalance(categoryGroup);

						return (
							<TouchableOpacity
								key={category.id}
								className={`rounded-xl p-3 mr-3 min-w-[90px] border ${
									isSelected ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-200'
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
								{categoryGroup && (
									<Text className="text-xs text-gray-500 mt-1 text-center">
										{formatCurrency(remainingBalance)}
									</Text>
								)}
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>
		);
	};

	return (
		<Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={closeModal}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1 dark:bg-gray-900"
			>
				<TouchableWithoutFeedback>
					<View className="flex-1 bg-black/50 justify-end">
						<View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 shadow-lg">
							<View className="flex-row justify-between items-center mb-6">
								<Text className="text-lg font-bold text-gray-800 dark:text-gray-200">
									Add New Item
								</Text>
								<TouchableOpacity onPress={closeModal}>
									<X size={24} color="#6B7280" />
								</TouchableOpacity>
							</View>

							<ScrollView showsVerticalScrollIndicator={false} className="max-h-[400px]">
								<View className="mb-4">
									<Text className="text-sm text-gray-600 mb-2 dark:text-gray-200">Item Name</Text>
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
										<Text className="text-sm text-gray-600 mb-2 dark:text-gray-200">Price ($)</Text>
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
										<Text className="text-sm text-gray-600 mb-2 dark:text-gray-200">Quantity</Text>
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
									<Text className="text-sm text-gray-600 mb-2 dark:text-gray-200">
										Description (optional)
									</Text>
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
									<Text className="text-sm text-gray-600 mb-2 dark:text-gray-200">
										Purchase By Date
									</Text>
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

								{/* Budget Groups Section */}
								{renderBudgetGroups()}

								{/* Categories Section */}
								{renderCategories()}
							</ScrollView>

							<TouchableOpacity
								className="bg-indigo-600 p-4 rounded-xl mt-4 flex-row justify-center items-center"
								onPress={handleAddItem}
							>
								<PlusCircle size={20} color="white" />
								<Text className="text-base font-semibold text-white ml-2 dark:text-gray-200">
									Add to Shopping List
								</Text>
							</TouchableOpacity>

							{/* Budget warning if applicable */}
							{budget && remainingBudget < 20 && (
								<View className="flex-row items-center mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
									<Info size={18} color="#F59E0B" />
									<Text className="text-sm text-amber-700 ml-2 flex-1">
										Your budget is running low. Consider prioritizing essential items.
									</Text>
								</View>
							)}
						</View>
					</View>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default NewItemModal;
