import { useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	FlatList,
	StatusBar,
	Alert,
	RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { use$, useObservable } from '@legendapp/state/react';
import useShoppingStore, { ShoppingItem } from 'src/store/shopping';
import { observer } from '@legendapp/state/react';
import { SwipeableRow } from './SwipeableRow';
import { formatCurrency } from 'src/utils/currency';
import { CheckCircle, ChevronDown, ChevronUp, PlusCircle, ShoppingCart, Star, Trash2 } from 'lucide-react-native';
import { useFeedbackModal } from './feedback';

const HEADER_HEIGHT = 64;

// Component for rendering shopping list items summary
const ShoppingItemRow = observer(
	({
		item,
		onToggleComplete,
		onEdit,
		onDelete,
	}: {
		item: ShoppingItem;
		onToggleComplete: () => void;
		onEdit: () => void;
		onDelete: () => void;
	}) => {
		return (
			<SwipeableRow
				rightActions={[
					{
						text: 'Edit',
						color: '#3b82f6',
						icon: 'edit',
						onPress: onEdit,
					},
					{
						text: 'Delete',
						color: '#ef4444',
						icon: 'delete',
						onPress: onDelete,
					},
				]}
			>
				<View
					className="flex-row items-center bg-white px-4 py-3 border-b border-gray-100"
				>
					<TouchableOpacity onPress={onToggleComplete} className="mr-3">
						<View
							className={`w-6 h-6 rounded-full border-2 justify-center items-center ${item.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}
						>
							{item.completed && <CheckCircle size={16} color="white" />}
						</View>
					</TouchableOpacity>

					<View className="flex-1">
						<Text
							className={`text-base font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
						>
							{item.name}
						</Text>
						<Text className="text-sm text-gray-500">
							{item.quantity > 1 ? `${item.quantity}x ` : ''}
							{formatCurrency(item.price)}
						</Text>
					</View>

					<Text className="text-right font-medium text-gray-700">
						{formatCurrency(item.price * item.quantity)}
					</Text>
				</View>
			</SwipeableRow>
		);
	}
);

// Progress component at the top of the list
const ListProgress = observer(({ listId }: { listId: string }) => {
	const shoppingStore = useShoppingStore();
	const stats = shoppingStore.getShoppingListStats(listId);

	if (!stats) return null;

	const progressPercentage = stats.progress || 0;
	const progressColor =
		progressPercentage < 30
			? 'bg-red-500'
			: progressPercentage < 70
				? 'bg-yellow-500'
				: 'bg-green-500';

	return (
		<View className="px-4 py-3 bg-white mb-2 rounded-lg shadow-sm">
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-gray-700 font-medium">Progress</Text>
				<Text className="text-gray-700 font-medium">
					{stats.completedItems}/{stats.totalItems} items
				</Text>
			</View>

			<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
				<View className={`h-full ${progressColor}`} style={{ width: `${progressPercentage}%` }} />
			</View>

			{stats.budget ? (
				<View className="mt-3">
					<View className="flex-row justify-between items-center mb-1">
						<Text className="text-gray-700 font-medium">Budget</Text>
						<Text
							className={`font-medium ${stats.underBudget ? 'text-green-600' : 'text-red-600'}`}
						>
							{formatCurrency(stats.totalCost)} / {formatCurrency(stats.budget)}
						</Text>
					</View>

					<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
						<View
							className={`h-full ${stats.underBudget ? 'bg-green-500' : 'bg-red-500'}`}
							style={{ width: `${Math.min(100, (stats.totalCost / stats.budget) * 100)}%` }}
						/>
					</View>
				</View>
			) : null}
		</View>
	);
});

// Main shopping list tab
const ShoppingListTab = observer(({ listId }: { listId: string }) => {
	const shoppingStore = useShoppingStore();
	const activeList = shoppingStore.getShoppingListById(listId);
	const [refreshing, setRefreshing] = useState(false);
	const [itemName, setItemName] = useState('');
	const [itemPrice, setItemPrice] = useState('');
	const [itemQuantity, setItemQuantity] = useState('1');

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		// Simulate a refresh
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	if (!activeList)
		return (
			<View className="flex-1 justify-center items-center">
				<Text className="text-gray-400">No list selected</Text>
			</View>
		);

	const handleAddItem = () => {
		if (!itemName.trim()) {
			Alert.alert('Error', 'Please enter an item name');
			return;
		}

		const price = parseFloat(itemPrice || '0');
		const quantity = parseInt(itemQuantity || '1', 10);

		shoppingStore.addItemToList(listId, {
			name: itemName.trim(),
			price,
			quantity,
			categoryId: '', // You might want to add category selection
			completed: false,
		});

		setItemName('');
		setItemPrice('');
		setItemQuantity('1');
	};

	const handleToggleComplete = (itemId: string) => {
		shoppingStore.toggleItemCompletion(itemId, listId);
	};

	const handleEditItem = (item: ShoppingItem) => {
		// Implement item editing logic here
		Alert.alert('Edit Item', 'Edit functionality would open a modal here');
    
	};

	const handleDeleteItem = (itemId: string) => {
		Alert.alert('Delete Item', 'Are you sure you want to remove this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => shoppingStore.removeItemFromList(itemId, listId),
			},
		]);
	};

	const handleClearCompleted = () => {
		Alert.alert('Clear completed items', 'Are you sure you want to remove all completed items?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Clear',
				style: 'destructive',
				onPress: () => shoppingStore.clearCompletedItems(listId),
			},
		]);
	};

	return (
		<View className="flex-1">
			<FlatList
				data={activeList.items}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<ShoppingItemRow
						item={item}
						onToggleComplete={() => handleToggleComplete(item.id)}
						onEdit={() => handleEditItem(item)}
						onDelete={() => handleDeleteItem(item.id)}
					/>
				)}
				ListHeaderComponent={
					<>
						<ListProgress listId={listId} />

						{/* Add Item Form */}
						<View className="bg-white rounded-lg shadow-sm mb-2 p-4">
							<View className="flex-row items-center border-b border-gray-200 pb-2 mb-3">
								<TextInput
									placeholder="Add new item..."
									className="flex-1 h-10 text-base"
									value={itemName}
									onChangeText={setItemName}
								/>
							</View>

							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center">
									<Text className="text-gray-500 mr-2">$</Text>
									<TextInput
										placeholder="Price"
										keyboardType="decimal-pad"
										className="w-20 h-10 border border-gray-200 rounded-md px-2"
										value={itemPrice}
										onChangeText={setItemPrice}
									/>

									<Text className="text-gray-500 mx-2">×</Text>

									<TextInput
										placeholder="Qty"
										keyboardType="number-pad"
										className="w-16 h-10 border border-gray-200 rounded-md px-2"
										value={itemQuantity}
										onChangeText={setItemQuantity}
									/>
								</View>

								<TouchableOpacity
									onPress={handleAddItem}
									className="bg-blue-500 px-4 py-2 rounded-md"
								>
									<Text className="text-white font-medium">Add</Text>
								</TouchableOpacity>
							</View>
						</View>
					</>
				}
				ListEmptyComponent={
					<View className="py-8 flex items-center justify-center">
						<ShoppingCart size={48} color="#d1d5db" />
						<Text className="text-gray-400 mt-2 text-center">Your shopping list is empty</Text>
						<Text className="text-gray-400 text-center">Add items using the form above</Text>
					</View>
				}
				ListFooterComponent={
					activeList.items.length > 0 ? (
						<View className="pb-4 pt-2">
							<TouchableOpacity
								onPress={handleClearCompleted}
								className="mx-4 py-2 border border-gray-300 rounded-md flex-row justify-center items-center"
							>
								<Trash2 size={16} color="#6b7280" />
								<Text className="text-gray-500 font-medium ml-2">Clear completed items</Text>
							</TouchableOpacity>
						</View>
					) : null
				}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
				}
				contentContainerStyle={{ padding: 16 }}
			/>
		</View>
	);
});

// Summary tab showing statistics and details
const SummaryTab = observer(({ listId }: { listId: string }) => {
	const shoppingStore = useShoppingStore();
	const activeList = shoppingStore.getShoppingListById(listId);
	const stats = shoppingStore.getShoppingListStats(listId);

	if (!activeList || !stats)
		return (
			<View className="flex-1 justify-center items-center">
				<Text className="text-gray-400">No data available</Text>
			</View>
		);

	return (
		<ScrollView className="flex-1 p-4">
			<View className="bg-white rounded-lg shadow-sm p-4 mb-4">
				<Text className="text-lg font-bold text-gray-800 mb-4">List Summary</Text>

				<View className="flex-row justify-between py-2 border-b border-gray-100">
					<Text className="text-gray-600">Total Items</Text>
					<Text className="font-medium text-gray-800">{stats.totalItems}</Text>
				</View>

				<View className="flex-row justify-between py-2 border-b border-gray-100">
					<Text className="text-gray-600">Completed Items</Text>
					<Text className="font-medium text-gray-800">{stats.completedItems}</Text>
				</View>

				<View className="flex-row justify-between py-2 border-b border-gray-100">
					<Text className="text-gray-600">Total Cost</Text>
					<Text className="font-medium text-gray-800">{formatCurrency(stats.totalCost)}</Text>
				</View>

				{stats?.budget && (
					<>
						<View className="flex-row justify-between py-2 border-b border-gray-100">
							<Text className="text-gray-600">Budget</Text>
							<Text className="font-medium text-gray-800">{formatCurrency(stats.budget)}</Text>
						</View>

						<View className="flex-row justify-between py-2 border-b border-gray-100">
							<Text className="text-gray-600">Remaining Budget</Text>
							<Text
								className={`font-medium ${stats.budgetRemaining && stats.budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
							>
								{stats.budgetRemaining !== null ? formatCurrency(stats.budgetRemaining) : 'N/A'}
							</Text>
						</View>
					</>
				)}

				{activeList.lastRenewed && (
					<View className="flex-row justify-between py-2 border-b border-gray-100">
						<Text className="text-gray-600">Last Renewed</Text>
						<Text className="font-medium text-gray-800">
							{new Date(activeList.lastRenewed).toLocaleDateString()}
						</Text>
					</View>
				)}

				{stats.daysUntilRenewal !== null && (
					<View className="flex-row justify-between py-2 border-b border-gray-100">
						<Text className="text-gray-600">Days Until Renewal</Text>
						<Text className="font-medium text-gray-800">{stats.daysUntilRenewal}</Text>
					</View>
				)}
			</View>
			{activeList.notes && (
				<View className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<Text className="text-lg font-bold text-gray-800 mb-2">Notes</Text>
					<Text className="text-gray-700">{activeList.notes}</Text>
				</View>
			)}
			{activeList.tags && activeList.tags.length > 0 && (
				<View className="bg-white rounded-lg shadow-sm p-4 mb-4">
					<Text className="text-lg font-bold text-gray-800 mb-2">Tags</Text>
					<View className="flex-row flex-wrap">
						{activeList.tags
							.filter((tag) => tag != null) // Filter out null/undefined values
							.map((tag, index) => (
								<View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2">
									<Text className="text-blue-800">{tag}</Text>
								</View>
							))}
					</View>
				</View>
			)}
			<View className="h-20" /> 
		</ScrollView>
	);
});

// Component for list selector
const ListSelector = observer(
	({ onSelect, currentListId }: { onSelect: (listId: string) => void; currentListId: string }) => {
		const shoppingStore = useShoppingStore();
		const lists = shoppingStore.getAllShoppingLists();
		const [isOpen, setIsOpen] = useState(false);

		const currentList = shoppingStore.getShoppingListById(currentListId);
    const Icon = isOpen ? ChevronUp : ChevronDown

		return (
			<View className="relative z-10">
				<TouchableOpacity
					className="flex-row items-center px-4 py-2"
					onPress={() => setIsOpen(!isOpen)}
				>
					<Text className="text-lg font-bold text-white mr-1">
						{currentList?.name || 'Select a list'}
					</Text>
					<Icon size={20} color="white" />
				</TouchableOpacity>

				{isOpen && (
					<View className="absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-lg z-20 max-h-64">
						<ScrollView>
							{lists.map((list) => (
								<TouchableOpacity
									key={list.id}
									className={`px-4 py-3 border-b border-gray-100 ${list.id === currentListId ? 'bg-blue-50' : ''}`}
									onPress={() => {
										onSelect(list.id);
										setIsOpen(false);
									}}
								>
									<Text
										className={`${list.id === currentListId ? 'font-bold text-blue-600' : 'text-gray-800'}`}
									>
										{list.name}
									</Text>
									<Text className="text-xs text-gray-500">{list.items.length} items</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				)}
			</View>
		);
	}
);

// Main component
const ShoppingScreen = observer(() => {
	const { setActiveList, getAllShoppingLists, getActiveListId, toggleFavorite, createShoppingList, isFavorite } = useShoppingStore();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<'list' | 'summary'>('list'); // 'list' or 'summary'
	const [showCreateList, setShowCreateList] = useState(false);
	const [newListName, setNewListName] = useState('');
  const { showModal, hideModal } = useFeedbackModal()

	// Use observable to track the active list ID
	const activeListId$ = useObservable(getActiveListId() || '');
	const activeListId = use$(activeListId$);
  const setActiveListId = activeListId$.set


	useEffect(() => {
		// Initialize with the first list if none is active
		if (!use$(activeListId) && getAllShoppingLists().length > 0) {
			const firstListId = getAllShoppingLists()[0].id;
			setActiveList(firstListId);
			setActiveListId(firstListId);
		}
	}, []);

	const handleCreateList = () => {
		if (!newListName.trim()) {
      showModal({
        type: 'warning',
        title: 'Empty list name',
        message: 'Please provide a list name',
        autoClose:true
      })
			return;
		}

		const newListId = createShoppingList(newListName.trim());
		setActiveList(newListId);
		setActiveListId(newListId);
		setNewListName('');
		setShowCreateList(false);
	};

	const handleSelectList = (listId: string) => {
		setActiveList(listId);
		setActiveListId(listId);
	};

	const handleToggleFavorite = () => {
		const listId = use$(activeListId);
		if (listId) {
			toggleFavorite(listId);
		}
	};

  const Icon = isFavorite(use$(activeListId)) ? <Star className='bg-gray-50' size={24}/> : <Star size={24}/>;
	return (
		<View className="flex-1 bg-gray-100" style={{ paddingTop: insets.top }}>
			<StatusBar barStyle="light-content" />

			{/* Header */}
			<View className="bg-blue-600" style={{ height: HEADER_HEIGHT }}>
				<View className="flex-row items-center justify-between h-full px-2">
					<ListSelector onSelect={handleSelectList} currentListId={use$(activeListId)} />

					<View className="flex-row">
						{use$(activeListId) && (
							<TouchableOpacity className="p-2 mr-1" onPress={handleToggleFavorite}>
								{Icon}
							</TouchableOpacity>
						)}

						<TouchableOpacity className="p-2" onPress={() => setShowCreateList(true)}>
							<PlusCircle size={24} color="white" />
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Tab Bar */}
			{use$(activeListId) && (
				<View className="flex-row bg-white border-b border-gray-200">
					<TouchableOpacity
						className={`flex-1 py-3 px-5 ${activeTab === 'list' ? 'border-b-2 border-blue-500' : ''}`}
						onPress={() => setActiveTab('list')}
					>
						<Text
							className={`text-center font-medium ${activeTab === 'list' ? 'text-blue-500' : 'text-gray-600'}`}
						>
							Shopping List
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						className={`flex-1 py-3 px-5 ${activeTab === 'summary' ? 'border-b-2 border-blue-500' : ''}`}
						onPress={() => setActiveTab('summary')}
					>
						<Text
							className={`text-center font-medium ${activeTab === 'summary' ? 'text-blue-500' : 'text-gray-600'}`}
						>
							Summary
						</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Main Content */}
			<View className="flex-1">
				{!use$(activeListId) ? (
					<View className="flex-1 justify-center items-center p-4">
						<ShoppingCart size={64} color="#d1d5db" />
						<Text className="text-gray-500 text-lg mt-4 mb-2 text-center">
							You don't have any shopping lists yet
						</Text>
						<Text className="text-gray-400 mb-6 text-center">Create a new list to get started</Text>
						<TouchableOpacity
							className="bg-blue-500 px-6 py-3 rounded-lg"
							onPress={() => setShowCreateList(true)}
						>
							<Text className="text-white font-bold">Create New List</Text>
						</TouchableOpacity>
					</View>
				) : // Active list content
				activeTab === 'list' ? (
					<ShoppingListTab listId={use$(activeListId)} />
				) : (
					<SummaryTab listId={use$(activeListId)} />
				)}
			</View>

			{/* Create List Modal */}
			{showCreateList && (
				<View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center p-4">
					<View className="bg-white w-full max-w-sm rounded-lg p-4">
						<Text className="text-lg font-bold text-gray-800 mb-4">Create New List</Text>

						<TextInput
							placeholder="List name"
							className="border border-gray-300 rounded-md px-3 py-2 mb-4"
							value={newListName}
							onChangeText={setNewListName}
							autoFocus
						/>

						<View className="flex-row justify-end">
							<TouchableOpacity
								className="px-4 py-2 mr-2"
								onPress={() => {
									setShowCreateList(false);
									setNewListName('');
								}}
							>
								<Text className="text-gray-600">Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								className="bg-blue-500 px-4 py-2 rounded-md"
								onPress={handleCreateList}
							>
								<Text className="text-white font-medium">Create</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			)}
		</View>
	);
});

export default observer(ShoppingScreen);
