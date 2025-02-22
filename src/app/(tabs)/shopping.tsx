import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useStore } from 'src/store/useStore';
import { ShoppingItem, ShoppingList } from 'src/types/transaction';
import {
	Plus,
	Trash2,
	Check,
	X,
	List,
	ArrowUp,
	ArrowDown,
	ShoppingCart,
	Edit2,
	Filter,
} from 'lucide-react-native';
import { observer } from '@legendapp/state/react';

type SortOption = 'priority' | 'price' | 'name';
type PriorityLevel = 'high' | 'medium' | 'low';
type FilterOption = 'all' | 'purchased' | 'pending';

const PRIORITY_COLORS = {
	high: '#DC2626',
	medium: '#F59E0B',
	low: '#10B981',
};

function Shopping() {
	const { shoppingLists, addShoppingList, updateShoppingList, deleteShoppingList } = useStore();
	const [newItem, setNewItem] = useState('');
	const [quantity, setQuantity] = useState('1');
	const [estimatedPrice, setEstimatedPrice] = useState('');
	const [priority, setPriority] = useState<PriorityLevel>('medium');
	const [sortBy, setSortBy] = useState<SortOption>('priority');
	const [filterBy, setFilterBy] = useState<FilterOption>('all');
	const [budget, setBudget] = useState('1000');
	const [activeList, setActiveList] = useState(shoppingLists[0]?.id || '');
	const [showAddList, setShowAddList] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [description, setDescription] = useState('');
	const [editingItem, setEditingItem] = useState<string | null>(null);

	const currentList = useMemo(
		() => shoppingLists.find((list) => list.id === activeList),
		[shoppingLists, activeList]
	);

	const filteredAndSortedItems = useMemo(() => {
		if (!currentList) return [];

		let items = [...currentList.items];

		// Apply filter
		switch (filterBy) {
			case 'purchased':
				items = items.filter((item) => item.purchased);
				break;
			case 'pending':
				items = items.filter((item) => !item.purchased);
				break;
		}

		// Apply sort
		return items.sort((a, b) => {
			switch (sortBy) {
				case 'priority':
					return (
						['high', 'medium', 'low'].indexOf(a.priority) -
						['high', 'medium', 'low'].indexOf(b.priority)
					);
				case 'price':
					return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
				case 'name':
					return a.name.localeCompare(b.name);
				default:
					return 0;
			}
		});
	}, [currentList, sortBy, filterBy]);

	const totalEstimated = useMemo(() => {
		if (!currentList) return 0;
		return currentList.items.reduce(
			(sum, item) => sum + (item.estimatedPrice || 0) * item.quantity,
			0
		);
	}, [currentList]);

	const remainingBudget = useMemo(() => {
		return parseFloat(budget) - totalEstimated;
	}, [budget, totalEstimated]);

	const handleAddItem = () => {
		if (!newItem.trim() || !currentList) return;

		const newShoppingItem: ShoppingItem = {
			id: Date.now().toString(),
			name: newItem.trim(),
			quantity: parseInt(quantity) || 1,
			estimatedPrice: parseFloat(estimatedPrice) || 0,
			priority,
			purchased: false,
			description: description.trim(),
		};

		const updatedItems = [...currentList.items, newShoppingItem];
		updateShoppingList({
			...currentList,
			items: updatedItems,
		});

		// Reset form
		setNewItem('');
		setQuantity('1');
		setEstimatedPrice('');
		setPriority('medium');
		setDescription('');

		// Budget warning
		const newTotal = totalEstimated + newShoppingItem?.estimatedPrice! * newShoppingItem.quantity;
		if (newTotal > parseFloat(budget) * 0.8) {
			Alert.alert(
				'Budget Warning',
				`You've reached ${Math.round((newTotal / parseFloat(budget)) * 100)}% of your budget!`
			);
		}
	};

	const handleEditItem = (itemId: string) => {
		if (!currentList) return;
		const item = currentList.items.find((i) => i.id === itemId);
		if (!item) return;

		setNewItem(item.name);
		setQuantity(item.quantity.toString());
		setEstimatedPrice(item.estimatedPrice?.toString() || '');
		setPriority(item.priority);
		setDescription(item.description || '');
		setEditingItem(itemId);
	};

	const handleUpdateItem = () => {
		if (!currentList || !editingItem) return;

		const updatedItems = currentList.items.map((item) =>
			item.id === editingItem
				? {
						...item,
						name: newItem.trim(),
						quantity: parseInt(quantity) || 1,
						estimatedPrice: parseFloat(estimatedPrice) || 0,
						priority,
						description: description.trim(),
					}
				: item
		);

		updateShoppingList({
			...currentList,
			items: updatedItems,
		});

		// Reset form
		setEditingItem(null);
		setNewItem('');
		setQuantity('1');
		setEstimatedPrice('');
		setPriority('medium');
		setDescription('');
	};

	const handleTogglePurchased = (itemId: string) => {
		if (!currentList) return;

		const updatedItems = currentList.items.map((item) =>
			item.id === itemId ? { ...item, purchased: !item.purchased } : item
		);

		updateShoppingList({
			...currentList,
			items: updatedItems,
		});
	};

	const handleCreateList = () => {
		if (!newListName.trim()) return;

		const newList: ShoppingList = {
			id: Date.now().toString(),
			name: newListName.trim(),
			items: [],
		};

		addShoppingList(newList);
		setShowAddList(false);
		setNewListName('');
	};

	const handleDeleteList = (listId: string) => {
		const list = shoppingLists.find((list) => list.id === listId);
		if (!list) return;

		Alert.alert('Delete List', `Are you sure you want to delete "${list.name}"?`, [
			{
				text: 'Cancel',
				style: 'cancel',
			},
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => deleteShoppingList(listId),
			},
		]);
	};

	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" /> */}
			<View className="p-4 space-y-4">
				{/* Header */}
				<View className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
					<View className="flex-row items-center">
						<ShoppingCart size={28} color="#6366F1" />
						<Text className="text-3xl font-rbold text-gray-800 dark:text-white ml-3">
							Shopping Lists
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => setShowAddList(true)}
						className="bg-indigo-500 p-2 rounded-full"
					>
						<Plus size={20} color="#fff" />
					</TouchableOpacity>
				</View>

				{/* List Selection */}
				<ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
					{shoppingLists.map((list) => (
						<TouchableOpacity
							key={list.id}
							onPress={() => setActiveList(list.id)}
							className={`mr-3 px-5 py-3 rounded-xl flex-row items-center shadow-sm ${
								activeList === list.id ? 'bg-indigo-500' : 'bg-white dark:bg-gray-800'
							}`}
						>
							<Text
								className={`font-amedium ${
									activeList === list.id ? 'text-white' : 'text-gray-800 dark:text-white'
								}`}
							>
								{list.name}
							</Text>
							<TouchableOpacity onPress={() => handleDeleteList(list.id)} className="ml-3">
								<Trash2 size={16} color={activeList === list.id ? '#fff' : '#EF4444'} />
							</TouchableOpacity>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Budget Card */}
				<View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
					<Text className="text-lg font-amedium text-gray-800 dark:text-white mb-3">
						Budget Overview
					</Text>
					<TextInput
						className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl mb-3 text-gray-800 dark:text-white font-amedium"
						keyboardType="numeric"
						value={budget}
						onChangeText={setBudget}
						placeholder="Set budget"
						placeholderTextColor="#9CA3AF"
					/>
					<View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
						<View>
							<Text className="text-gray-500 dark:text-gray-400 font-rregular">
								Total Estimated
							</Text>
							<Text className="text-lg font-amedium text-gray-800 dark:text-white">
								${totalEstimated.toFixed(2)}
							</Text>
						</View>
						<View>
							<Text className="text-gray-500 dark:text-gray-400 font-rregular text-right">
								Remaining
							</Text>
							<Text
								className={`text-lg font-amedium ${
									remainingBudget < 0 ? 'text-red-500' : 'text-green-500'
								}`}
							>
								${remainingBudget.toFixed(2)}
							</Text>
						</View>
					</View>
				</View>

				{/* Add/Edit Item Form */}
				<View className="bg-white dark:bg-gray-800 rounded-xl p-4 my-4 shadow-sm">
					<Text className="text-lg font-amedium text-gray-800 dark:text-white mb-3">
						{editingItem ? 'Edit Item' : 'Add New Item'}
					</Text>
					<View className="space-y-3">
						<TextInput
							className="bg-gray-50 dark:bg-gray-700 mt-2 mb-4 p-3 my-2 rounded-xl text-gray-800 dark:text-white"
							placeholder="Item name"
							placeholderTextColor="#9CA3AF"
							value={newItem}
							onChangeText={setNewItem}
						/>
						<TextInput
							className="bg-gray-50 dark:bg-gray-700 p-3 my-2 rounded-xl text-gray-800 dark:text-white"
							placeholder="Description (optional)"
							placeholderTextColor="#9CA3AF"
							value={description}
							onChangeText={setDescription}
							multiline
							numberOfLines={2}
						/>
						<View className="flex-row space-x-3">
							<TextInput
								className="flex-1 bg-gray-50 dark:bg-gray-700 mr-2 p-3 my-2 rounded-xl text-gray-800 dark:text-white"
								placeholder="Qty"
								placeholderTextColor="#9CA3AF"
								keyboardType="numeric"
								value={quantity}
								onChangeText={setQuantity}
							/>
							<TextInput
								className="flex-2 bg-gray-50 dark:bg-gray-700 p-3 my-2 rounded-xl text-gray-800 dark:text-white"
								placeholder="Price"
								placeholderTextColor="#9CA3AF"
								keyboardType="numeric"
								value={estimatedPrice}
								onChangeText={setEstimatedPrice}
							/>
						</View>
						<View className="flex-row space-x-2">
							{(['high', 'medium', 'low'] as PriorityLevel[]).map((level) => (
								<TouchableOpacity
									key={level}
									onPress={() => setPriority(level)}
									className={`flex-1 p-3 rounded-xl mx-0.5 flex-row items-center justify-center ${
										priority === level ? 'bg-indigo-500' : 'bg-gray-50 dark:bg-gray-700'
									}`}
								>
									<View
										style={{ backgroundColor: PRIORITY_COLORS[level] }}
										className="w-3 h-3 rounded-full mr-2"
									/>
									<Text
										className={`font-amedium ${
											priority === level ? 'text-white' : 'text-gray-800 dark:text-white'
										}`}
									>
										{level.charAt(0).toUpperCase() + level.slice(1)}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<TouchableOpacity
							onPress={editingItem ? handleUpdateItem : handleAddItem}
							className="bg-indigo-500 p-3 mt-2 rounded-xl flex-row items-center justify-center"
						>
							{editingItem ? (
								<>
									<Check size={20} color="#fff" />
									<Text className="text-white font-amedium ml-2 my-2">Update Item</Text>
								</>
							) : (
								<>
									<Plus size={20} color="#fff" />
									<Text className="text-white font-amedium ml-2">Add Item</Text>
								</>
							)}
						</TouchableOpacity>
					</View>
				</View>

				{/* Filter and Sort Options */}
				<View className="flex-row my-4">
					<View className="flex-1 mx-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm">
						<Text className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-2">Filter By</Text>
						<View className="flex-row space-x-1">
							{(['all', 'purchased', 'pending'] as FilterOption[]).map((option) => (
								<TouchableOpacity
									key={option}
									onPress={() => setFilterBy(option)}
									className={`flex-1 p-1 mx-0.5 rounded-lg ${
										filterBy === option ? 'bg-indigo-500' : 'bg-gray-50 dark:bg-gray-700'
									}`}
								>
									<Text
										className={`text-center text-xs font-amedium ${
											filterBy === option ? 'text-white' : 'text-gray-800 dark:text-white'
										}`}
									>
										{option.charAt(0).toUpperCase() + option.slice(1)}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm">
						<Text className="text-sm text-gray-500 dark:text-gray-400 mb-2 px-2">Sort By</Text>
						<View className="flex-row space-x-1">
							{(['priority', 'price', 'name'] as SortOption[]).map((option) => (
								<TouchableOpacity
									key={option}
									onPress={() => setSortBy(option)}
									className={`flex-1 p-1 mx-0.5 rounded-lg flex-row items-center justify-center ${
										sortBy === option ? 'bg-indigo-500' : 'bg-gray-50 dark:bg-gray-700'
									}`}
								>
									{option === 'priority' && (
										<ArrowUp size={14} color={sortBy === option ? '#fff' : '#6B7280'} />
									)}
									{option === 'price' && (
										<ArrowDown size={14} color={sortBy === option ? '#fff' : '#6B7280'} />
									)}
									{option === 'name' && (
										<List size={14} color={sortBy === option ? '#fff' : '#6B7280'} />
									)}
									<Text
										className={`text-center text-sm font-amedium ml-1 ${
											sortBy === option ? 'text-white' : 'text-gray-800 dark:text-white'
										}`}
									>
										{option}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>

				{/* Shopping List */}
				<View className="space-y-2">
					{filteredAndSortedItems.length === 0 ? (
						<View className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm items-center">
							<ShoppingCart size={48} color="#9CA3AF" />
							<Text className="text-gray-500 dark:text-gray-400 text-center mt-4 font-amedium">
								No items in this list
							</Text>
						</View>
					) : (
						filteredAndSortedItems.map((item) => (
							<View key={item.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
								<View className="flex-row justify-between items-start">
									<TouchableOpacity
										onPress={() => handleTogglePurchased(item.id)}
										className="flex-1"
									>
										<View className="flex-row items-center">
											<View
												style={{ backgroundColor: PRIORITY_COLORS[item.priority] }}
												className="w-3 h-3 rounded-full mr-2"
											/>
											<Text
												className={`text-lg font-amedium ${
													item.purchased
														? 'line-through text-gray-400'
														: 'text-gray-800 dark:text-white'
												}`}
											>
												{item.name}
											</Text>
										</View>
										{item.description && (
											<Text className="text-gray-500 dark:text-gray-400 mt-1 ml-5">
												{item.description}
											</Text>
										)}
										<Text className="text-gray-500 dark:text-gray-400 mt-1 ml-5">
											{item.quantity} × ${item.estimatedPrice} = $
											{(item.quantity * (item.estimatedPrice || 0)).toFixed(2)}
										</Text>
									</TouchableOpacity>

									<TouchableOpacity onPress={() => handleEditItem(item.id)} className="p-2">
										<Edit2 size={16} color="#6366F1" />
									</TouchableOpacity>
								</View>
							</View>
						))
					)}
				</View>

				{/* New List Dialog */}
				{showAddList && (
					<View className="absolute inset-0 bg-black/50 items-center justify-center">
						<View className="bg-white dark:bg-gray-800 rounded-xl p-4 m-4 w-full max-w-sm">
							<Text className="text-lg font-amedium text-gray-800 dark:text-white mb-4">
								Create New List
							</Text>
							<TextInput
								className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl mb-4 text-gray-800 dark:text-white"
								placeholder="List name"
								placeholderTextColor="#9CA3AF"
								value={newListName}
								onChangeText={setNewListName}
							/>
							<View className="flex-row space-x-2">
								<TouchableOpacity
									onPress={handleCreateList}
									className="flex-1 bg-indigo-500 p-3 rounded-xl flex-row items-center justify-center"
								>
									<Check size={20} color="#fff" />
									<Text className="text-white font-amedium ml-2">Create</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => setShowAddList(false)}
									className="flex-1 bg-gray-200 dark:bg-gray-700 p-3 rounded-xl flex-row items-center justify-center"
								>
									<X size={20} color="#374151" />
									<Text className="text-gray-700 dark:text-white font-amedium ml-2">Cancel</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			</View>
		</ScrollView>
	);
}

export default observer(Shopping);
