import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	ScrollView,
	TextInput,
	FlatList,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Check, DollarSign, MoveRight, X, Plus, SlidersHorizontal } from 'lucide-react-native';
import {
	Budget,
	BUDGET_RULE_ALLOCATIONS,
	BudgetPeriodType,
	BudgetStatus,
	Category,
	ICON_MAP,
} from 'src/types/transaction';
import useStore from 'src/store/useStore';
import React,{ useState, useEffect, useMemo } from 'react';

interface CreateEditBudgetProps {
	modalVisible: boolean;
	setModalVisible: (value: boolean) => void;
	currentBudget: Budget;
}

// Defining the budget allocation groups based on the rule types
interface BudgetRuleGroups {
	[key: string]: {
		groups: {
			name: string;
			percentage: number;
			description: string;
			categories: string[];
			color: string;
		}[];
	};
}

function CreateEditBudget({
	modalVisible,
	setModalVisible,
	currentBudget: defaultBudget,
}: CreateEditBudgetProps): React.ReactElement {
	const { categories } = useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');
	const [currentBudget, setCurrentBudget] = useState<Budget>(defaultBudget);
	const [loading, setLoading] = useState<boolean>(false);

	const { updateBudget, createBudget } = useStore();
	// State to track which group is currently being edited
	const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
	const [searchText, setSearchText] = useState<string>('');

	// Initialize or update the budget allocation groups when the rule type changes
	useEffect(() => {
		if (currentBudget?.ruleType) {
			setLoading(true);
			setTimeout(() => {
				if (!currentBudget?.categoryAllocations) {
					// Initialize with default groups from the selected rule
					const initialGroups =
						BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.map((group) => ({
							...group,
							categories: [],
						})) || [];

					setCurrentBudget({
						...currentBudget,
						categoryAllocations: initialGroups,
					});
				} else {
					// Check if rule type changed and we need to restructure
					const currentGroupCount = currentBudget.categoryAllocations.length;
					const expectedGroupCount = BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.length || 0;

					if (currentGroupCount !== expectedGroupCount) {
						// Rule type changed, we need to reset the allocations
						const newGroups =
							BUDGET_RULE_ALLOCATIONS[currentBudget.ruleType]?.groups.map((group) => ({
								...group,
								categories: [],
							})) || [];

						setCurrentBudget({
							...currentBudget,
							categoryAllocations: newGroups,
						});
					}
				}
				setLoading(false);
			}, 150); // Small delay for smoother transition
		}
	}, [currentBudget?.ruleType]);

	// Function to toggle a category in a specific group
	const toggleCategoryInGroup = (categoryId: string, groupIndex: number) => {
		if (!currentBudget?.categoryAllocations) return;

		const updatedAllocations = [...currentBudget.categoryAllocations];

		// First, remove this category from any other group it might be in
		updatedAllocations.forEach((group, idx) => {
			if (group.categories.includes(categoryId)) {
				updatedAllocations[idx] = {
					...group,
					categories: group.categories.filter((id) => id !== categoryId),
				};
			}
		});

		// Then, add it to the selected group if it's not already there
		if (!updatedAllocations[groupIndex].categories.includes(categoryId)) {
			updatedAllocations[groupIndex] = {
				...updatedAllocations[groupIndex],
				categories: [...updatedAllocations[groupIndex].categories, categoryId],
			};
		}

		setCurrentBudget({
			...currentBudget,
			categoryAllocations: updatedAllocations,
		});
	};

	// Helper to check if a category is in any group
	const getCategoryGroup = (categoryId: string): number | null => {
		if (!currentBudget?.categoryAllocations) return null;

		for (let i = 0; i < currentBudget.categoryAllocations.length; i++) {
			if (currentBudget.categoryAllocations[i].categories.includes(categoryId)) {
				return i;
			}
		}
		return null;
	};

	// Filter categories based on search text
	const filteredCategories = useMemo(() => {
		return EXPENSE_CATEGORIES.filter((cat) =>
			cat.name.toLowerCase().includes(searchText.toLowerCase())
		);
	}, [EXPENSE_CATEGORIES, searchText]);

	// Render a category item for selection
	const renderCategoryItem = ({ item }: { item: Category }) => {
		const groupIndex = getCategoryGroup(item.id);
		const isSelected = groupIndex === activeGroupIndex;
		const isInAnyGroup = groupIndex !== null;
		const Icon = ICON_MAP[item.icon];

		return (
			<TouchableOpacity
				className={`flex-row items-center p-3 border-b border-gray-200 ${isSelected ? 'bg-indigo-50' : ''}`}
				onPress={() => {
					if (activeGroupIndex !== null) {
						toggleCategoryInGroup(item.id, activeGroupIndex);
					}
				}}
			>
				<View className="flex-row items-center flex-1">
					<View
						className="w-8 h-8 rounded-full mr-3 items-center justify-center"
						style={{ backgroundColor: item.color }}
					>
						<Icon color={'white'} size={18}/>
					</View>
					<Text className="flex-1 text-gray-800 font-medium">{item.name}</Text>
				</View>

				{isInAnyGroup && (
					<View
						className="flex-row items-center px-2 py-1 rounded-full"
					>
						<Text
							className="text-xs mr-1"
						>
							{currentBudget?.categoryAllocations[groupIndex].name}
						</Text>
						{isSelected && (
							<Check size={16} color={'gray'} />
						)}
					</View>
				)}

				{!isInAnyGroup && activeGroupIndex !== null && (
					<TouchableOpacity
						className="bg-indigo-100 p-1 rounded-full"
						onPress={() => toggleCategoryInGroup(item.id, activeGroupIndex)}
					>
						<Plus size={16} color="#4F46E5" />
					</TouchableOpacity>
				)}
			</TouchableOpacity>
		);
	};

	// Calculate category count for each group
	const getCategoryCountForGroup = (index: number) => {
		if (!currentBudget?.categoryAllocations) return 0;
		return currentBudget.categoryAllocations[index].categories.length;
	};

	// Render a budget allocation group
	const renderAllocationGroup = (group: any, index: number) => {
		const isActive = activeGroupIndex === index;
		const categoryCount = getCategoryCountForGroup(index);

		return (
			<TouchableOpacity
				key={index}
				className={`p-4 mb-3 rounded-xl shadow-sm ${
					isActive ? 'border-2 border-indigo-500 bg-indigo-50' : 'border border-gray-200 bg-white'
				}`}
				onPress={() => setActiveGroupIndex(index === activeGroupIndex ? null : index)}
			>
				<View className="flex-row justify-between items-center">
					<View className="flex-row items-center">
						<View
							className="w-10 h-10 rounded-full mr-3 items-center justify-center"
							style={{ backgroundColor: group.color + '30' }}
						>
							<Text className="font-bold" style={{ color: group.color }}>
								{group.percentage}%
							</Text>
						</View>
						<View>
							<Text className="font-bold text-gray-800 text-base">{group.name}</Text>
							<Text className="text-xs text-gray-500">{group.description}</Text>
						</View>
					</View>
					<View className="flex-row items-center">
						<View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
							<Text className="text-xs text-gray-600">{categoryCount}</Text>
						</View>
						<MoveRight size={18} color={isActive ? '#4F46E5' : '#9CA3AF'} />
					</View>
				</View>

				{group.categories.length > 0 && (
					<View className="mt-4 pt-3 border-t border-gray-200">
						<Text className="text-xs text-gray-500 mb-2 font-aregular">Assigned Categories:</Text>
						<View className="flex-row flex-wrap">
							{group.categories.map((catId: string) => {
								const category = EXPENSE_CATEGORIES.find((c) => c.id === catId);
								const Icon = ICON_MAP[category?.icon!];
								return category ? (
									<View
										key={catId}
										className="flex-row items-center bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
									>
										<View
											className="w-4 h-4 rounded-full mr-2 items-center justify-center"
										>
											<Icon size={14} />
										</View>
										<Text className="text-xs text-gray-700 mr-1 font-rmedium">{category.name}</Text>
										<TouchableOpacity
											onPress={() => toggleCategoryInGroup(catId, index)}
											className="ml-1"
										>
											<X size={12} color="#9CA3AF" />
										</TouchableOpacity>
									</View>
								) : null;
							})}
						</View>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	const handleSaveBudget = () => {
		if (!currentBudget?.name || currentBudget?.amount <= 0) {
			Alert.alert('Error', 'Please provide a name and valid amount');
			return;
		}

		setLoading(true);
		try {
			if (currentBudget.id) {
				// Update existing budget
				updateBudget(currentBudget as Budget);
			} else {
				// Create new budget
				createBudget(currentBudget);
			}
			setTimeout(() => {
				setLoading(false);
				setModalVisible(false);
			}, 300); // Small delay for visual feedback
		} catch (error: any) {
			setLoading(false);
			Alert.alert('Error', error.message);
		}
	};

	return (
		<Modal visible={modalVisible} animationType="slide" transparent={true}>
			<View className="flex-1 bg-black bg-opacity-60 justify-end">
				<View className="bg-white rounded-t-2xl p-5 h-5/6">
					{/* Header */}
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-xl font-bold text-gray-800">
							{currentBudget?.id ? 'Update Budget' : 'Create Budget'}
						</Text>
						<TouchableOpacity
							onPress={() => setModalVisible(false)}
							className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
						>
							<X size={20} color="#6B7280" />
						</TouchableOpacity>
					</View>

					<View className="bg-indigo-50 p-3 rounded-xl mb-5">
						<Text className="text-xs text-indigo-700 font-medium">
							The budget will be created as a draft and will not be visible until it is activated.
						</Text>
					</View>

					<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
						{/* Budget Name */}
						<View className="mb-5">
							<Text className="text-gray-700 mb-2 font-medium text-base">Budget Name</Text>
							<TextInput
								className="bg-gray-100 p-4 rounded-xl text-gray-800 border border-gray-200"
								value={currentBudget?.name}
								onChangeText={(text) => setCurrentBudget({ ...currentBudget!, name: text })}
								placeholder="Enter budget name"
							/>
						</View>

						{/* Budget Amount */}
						<View className="mb-5">
							<Text className="text-gray-700 mb-2 font-medium text-base">Budget Amount</Text>
							<View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
								<View className="p-4">
									<DollarSign size={20} color="#4F46E5" />
								</View>
								<TextInput
									className="flex-1 p-4 text-gray-800"
									value={currentBudget?.amount ? currentBudget.amount.toString() : ''}
									onChangeText={(text) => {
										const amount = text.replace(/[^0-9]/g, '');
										setCurrentBudget({ ...currentBudget!, amount: parseInt(amount || '0') });
									}}
									keyboardType="numeric"
									placeholder="0"
								/>
							</View>
						</View>

						{/* Budget Period */}
						<View className="mb-5">
							<Text className="text-gray-700 mb-2 font-medium text-base">Budget Period</Text>
							<View className="flex-row">
								{['week', 'month', 'year'].map((period) => (
									<TouchableOpacity
										key={period}
										className={`flex-1 py-4 ${period === 'year' ? '' : 'mr-3'} rounded-xl ${
											currentBudget?.periodType === period
												? 'bg-indigo-100 border-2 border-indigo-300'
												: 'bg-gray-100 border border-gray-200'
										}`}
										onPress={() =>
											setCurrentBudget({
												...currentBudget!,
												periodType: period as BudgetPeriodType,
											})
										}
									>
										<Text
											className={`text-center font-medium ${
												currentBudget?.periodType === period ? 'text-indigo-700' : 'text-gray-700'
											}`}
										>
											{period.charAt(0).toUpperCase() + period.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Allocation Rule */}
						<View className="mb-5">
							<Text className="text-gray-700 mb-2 font-medium text-base">Allocation Rule</Text>
							<View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
								{Object.keys(BUDGET_RULE_ALLOCATIONS).map((rule, index, array) => (
									<TouchableOpacity
										key={rule}
										className={`py-4 px-4 flex-row justify-between items-center ${
											index < array.length - 1 ? 'border-b border-gray-200' : ''
										}`}
										onPress={() => {
											setCurrentBudget({
												...currentBudget!,
												ruleType: rule as keyof typeof BUDGET_RULE_ALLOCATIONS,
											});
											// Reset active group when changing rule
											setActiveGroupIndex(null);
										}}
									>
										<View className="flex-row items-center">
											<View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
												<SlidersHorizontal size={18} color="#4F46E5" />
											</View>
											<View>
												<Text className="font-medium text-gray-800">{rule} Rule</Text>
												<Text className="text-xs text-gray-500 mt-1">
													{rule === '50-30-20'
														? 'Needs 50%, Wants 30%, Savings 20%'
														: rule === '10-70-20'
															? 'Savings 10%, Expenses 70%, Investments 20%'
															: 'Necessities 80%, Discretionary 20%'}
												</Text>
											</View>
										</View>

										{currentBudget?.ruleType === rule ? (
											<View className="bg-indigo-100 w-6 h-6 rounded-full items-center justify-center">
												<Check size={16} color="#4F46E5" />
											</View>
										) : null}
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Category Allocations */}
						{currentBudget?.ruleType && currentBudget?.categoryAllocations && (
							<View className="mb-5">
								<View className="flex-row justify-between items-center mb-2">
									<Text className="text-gray-700 font-medium text-base">Category Allocations</Text>
									{activeGroupIndex !== null && (
										<TouchableOpacity
											onPress={() => setActiveGroupIndex(null)}
											className="bg-gray-100 px-3 py-1 rounded-full"
										>
											<Text className="text-xs text-indigo-600 font-medium">Done</Text>
										</TouchableOpacity>
									)}
								</View>

								<Text className="text-xs text-gray-500 mb-3">
									{activeGroupIndex !== null
										? `Select categories for "${currentBudget.categoryAllocations[activeGroupIndex].name}"`
										: 'Tap a group to assign categories'}
								</Text>

								{loading ? (
									<View className="items-center justify-center py-10">
										<ActivityIndicator size="large" color="#4F46E5" />
										<Text className="text-gray-500 mt-3">Loading allocation groups...</Text>
									</View>
								) : (
									<>
										{/* Render allocation groups */}
										{currentBudget.categoryAllocations.map((group: any, index: number) =>
											renderAllocationGroup(group, index)
										)}
									</>
								)}

								{/* Show category selection when a group is active */}
								{activeGroupIndex !== null && (
									<View className="bg-white rounded-xl border border-gray-200 mt-3 pb-2">
										<View className="p-3 border-b border-gray-200">
											<TextInput
												className="bg-gray-100 px-3 py-2 rounded-lg text-gray-800"
												value={searchText}
												onChangeText={setSearchText}
												placeholder="Search categories..."
											/>
										</View>

										<FlatList
											data={filteredCategories}
											renderItem={renderCategoryItem}
											keyExtractor={(item) => item.id}
											nestedScrollEnabled={true}
											style={{ maxHeight: 250 }}
											ListEmptyComponent={() => (
												<View className="items-center justify-center py-10">
													<Text className="text-gray-500">No categories found</Text>
												</View>
											)}
										/>
									</View>
								)}
							</View>
						)}

						{/* Status */}
						<View className="mb-5">
							<Text className="text-gray-700 mb-2 font-medium text-base">Status</Text>
							<View className="flex-row">
								{['draft', 'active'].map((status) => (
									<TouchableOpacity
										key={status}
										className={`flex-1 py-4 ${status === 'active' ? '' : 'mr-3'} rounded-xl ${
											currentBudget?.status === status
												? 'bg-indigo-100 border-2 border-indigo-300'
												: 'bg-gray-100 border border-gray-200'
										}`}
										onPress={() =>
											setCurrentBudget({ ...currentBudget!, status: status as BudgetStatus })
										}
									>
										<Text
											className={`text-center font-medium ${
												currentBudget?.status === status ? 'text-indigo-700' : 'text-gray-700'
											}`}
										>
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</ScrollView>

					{/* Save Button */}
					<TouchableOpacity
						className={`py-4 rounded-xl mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
						onPress={handleSaveBudget}
						disabled={loading}
					>
						{loading ? (
							<View className="flex-row justify-center items-center">
								<ActivityIndicator size="small" color="#FFFFFF" />
								<Text className="text-white font-bold text-center ml-2">
									{currentBudget?.id ? 'Updating...' : 'Creating...'}
								</Text>
							</View>
						) : (
							<Text className="text-white font-bold text-center">
								{currentBudget?.id ? 'Update Budget' : 'Create Budget'}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

export default CreateEditBudget;
