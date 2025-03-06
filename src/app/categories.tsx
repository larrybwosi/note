import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { PlusCircle, Search, Check, X, Tag, ArrowRight } from 'lucide-react-native';
import { Category, DEFAULT_CATEGORIES, ICON_MAP, TransactionType } from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer, use$, useObservable } from '@legendapp/state/react';
import CustomCategoryModal from 'src/components/custom-category-modal';
import CategoryList from 'src/components/category-list';
import { router } from 'expo-router';

const CategorySelection = () => {
	// Default selections (at least 3 of each type)
	const defaultSelected = ['salary', 'part_time_job', 'gifts', 'housing', 'food', 'clothing'];

	const { categories: existingCategories, addCategory } = useStore();
	// Initialize selected IDs with existing categories' IDs if they exist, otherwise use defaults
	const initialSelectedIds =
		existingCategories.length > 0 ? existingCategories.map((cat) => cat.id) : defaultSelected;

	// Merge existing categories with default categories, ensuring no duplicates
	const mergedCategories = [
		...DEFAULT_CATEGORIES,
		...existingCategories.filter(
			(existingCat) => !DEFAULT_CATEGORIES.some((defaultCat) => defaultCat.id === existingCat.id)
		),
	];

	const state$ = useObservable({
		categories: mergedCategories,
		selectedIds: initialSelectedIds,
		searchQuery: '',
		activeTab: 'expense' as TransactionType,
		customModalVisible: false,
		expandedGroups: { expense: true, income: true },
		loading: false,
		customCategory: {
			name: '',
			type: 'expense',
			color: '#4F46E5',
			icon: 'circle',
			isCustom: true,
		} as Category,
	});

	const {
		categories,
		selectedIds,
		searchQuery,
		activeTab,
		customModalVisible,
		expandedGroups,
		customCategory,
		loading,
	} = use$(state$);
	const setCategories = state$.categories.set;
	const setSelectedIds = state$.selectedIds.set;
	const setSearchQuery = state$.searchQuery.set;
	const setActiveTab = state$.activeTab.set;
	const setCustomModalVisible = state$.customModalVisible.set;
	const setExpandedGroups = state$.expandedGroups.set;
	const setCustomCategory = state$.customCategory.set;
	const setLoading = state$.loading.set;

	const filteredCategories = categories.filter((category) => {
		const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesType = !activeTab || category.type === activeTab;
		return matchesSearch && matchesType;
	});

	const expenseCategories = categories.filter((cat) => cat.type === 'expense');
	const incomeCategories = categories.filter((cat) => cat.type === 'income');

	const selectedExpenseCount = selectedIds.filter(
		(id) => categories.find((cat) => cat.id === id)?.type === 'expense'
	).length;

	const selectedIncomeCount = selectedIds.filter(
		(id) => categories.find((cat) => cat.id === id)?.type === 'income'
	).length;

	const handleToggleCategory = (id: string) => {
		if (selectedIds.includes(id)) {
			// Check if removing would violate minimum requirements
			const category = categories.find((cat) => cat.id === id);
			if (category?.type === 'expense' && selectedExpenseCount <= 3) {
				Alert.alert('Cannot Remove', 'You need at least 3 expense categories');
				return;
			}
			if (category?.type === 'income' && selectedIncomeCount <= 3) {
				Alert.alert('Cannot Remove', 'You need at least 3 income categories');
				return;
			}

			setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
		} else {
			setSelectedIds([...selectedIds, id]);
		}
	};

	const handleCreateCustomCategory = (newCategory: Category) => {
		setCategories([...categories, newCategory]);
		setSelectedIds([...selectedIds, newCategory.id]);
		setCustomModalVisible(false);
		setCustomCategory({
			id: '',
			name: '',
			type: 'expense',
			color: '#4F46E5',
			icon: 'circle',
			isCustom: true,
		});
	};

	const handleSave = () => {
		setLoading(true);
		setTimeout(() => {
			try {
				const existingCategoryIds = existingCategories.map((cat) => cat.id);

				// Filter out only the newly selected categories (not in existing categories)
				const newlySelectedCategories = categories
					.filter((cat) => selectedIds.includes(cat.id) && !existingCategoryIds.includes(cat.id))
					.map((cat) => ({ ...cat, isSelected: true }));
				newlySelectedCategories.forEach((cat) => {
					addCategory(cat);
				})
				router.back()
			setLoading(false);
			} catch (error: any) {
				setLoading(false);
				Alert.alert('Error', error.message);
			}
		}, 800);
	};

	const toggleGroup = (type: TransactionType) => {
		setExpandedGroups({
			...expandedGroups,
			[type]: !expandedGroups[type],
		});
	};

	return (
		<SafeAreaView className="bg-opacity-50 justify-center items-center flex-1 h-full">
			<View className="bg-white rounded-2xl w-full">
				{/* Header */}
				<View className="p-2 rounded-t-2xl">
					<View className="flex-row justify-between items-center">
						<View>
							<Text className=" dark:text-gray-200 text-xl font-bold">Select Your Categories</Text>
						</View>
					</View>
				</View>

				{/* Search */}
				<View className="px-4 py-3 border-b border-gray-200">
					<View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
						<Search size={18} color="#6B7280" />
						<TextInput
							className="flex-1 ml-2 text-gray-800"
							value={searchQuery}
							onChangeText={setSearchQuery}
							placeholder="Search categories..."
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity onPress={() => setSearchQuery('')}>
								<X size={16} color="#6B7280" />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Main Content */}
				<ScrollView className="p-4" showsVerticalScrollIndicator={false}>
					{searchQuery ? (
						<View className="mb-4">
							<Text className="text-gray-700 font-medium mb-2">Search Results</Text>
							{filteredCategories.length === 0 ? (
								<View className="bg-gray-50 p-4 rounded-xl border border-gray-200 items-center">
									<Text className="text-gray-500">No categories found</Text>
									<TouchableOpacity
										className="mt-2 flex-row items-center bg-indigo-100 px-3 py-2 rounded-full"
										onPress={() => {
											setCustomCategory({
												...customCategory,
												name: searchQuery,
												type: activeTab || ('expense' as TransactionType),
											});
											setCustomModalVisible(true);
										}}
									>
										<PlusCircle size={16} color="#4F46E5" />
										<Text className="text-indigo-600 font-medium ml-1">Create "{searchQuery}"</Text>
									</TouchableOpacity>
								</View>
							) : (
								<View className="flex-row flex-wrap">
									{filteredCategories.map((category) => {
										const isSelected = selectedIds.includes(category.id);
										const Icon = ICON_MAP[category.icon];
										return (
											<TouchableOpacity
												key={category.id}
												onPress={() => handleToggleCategory(category.id)}
												className={`m-1 p-3 rounded-xl flex-row items-center border ${
													isSelected
														? 'border-2 border-indigo-500 bg-indigo-50'
														: 'border-gray-200 bg-white'
												}`}
												style={{ width: '47%' }}
											>
												<View
													className="w-10 h-10 rounded-full mr-2 items-center justify-center"
													style={{ backgroundColor: category.color }}
												>
													<Icon size={18} color="#FFFFFF" />
												</View>
												<View className="flex-1">
													<Text
														className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}
														numberOfLines={1}
													>
														{category.name}
													</Text>
													<Text className="text-gray-500 text-xs" numberOfLines={1}>
														{category.type.charAt(0).toUpperCase() + category.type.slice(1)}
													</Text>
												</View>
												{isSelected && (
													<View className="absolute top-1 right-1 bg-indigo-100 rounded-full w-5 h-5 items-center justify-center">
														<Check size={12} color="#4F46E5" />
													</View>
												)}
											</TouchableOpacity>
										);
									})}
								</View>
							)}
						</View>
					) : (
						<>
							<View className="mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
								<View className="flex-row items-start">
									<Tag size={20} color="#4F46E5" />
									<View className="ml-2 flex-1">
										<Text className="font-medium text-indigo-800">
											Why categorize your finances?
										</Text>
										<Text className="text-indigo-700 text-sm mt-1">
											Categories help you understand your spending habits and track your financial
											progress. Select categories that match your lifestyle for better insights.
										</Text>
									</View>
								</View>
							</View>

							{/* Expense Categories */}
							<CategoryList
								customCategory={customCategory!}
								setCustomCategory={setCustomCategory}
								setCustomModalVisible={setCustomModalVisible}
								expandedGroups={expandedGroups}
								categories={expenseCategories}
								selectedCategories={selectedIds}
								setSelectedCategories={setSelectedIds}
								toggleGroup={toggleGroup}
								type="expense"
							/>

							{/* Income Categories */}
							<CategoryList
								customCategory={customCategory!}
								setCustomCategory={setCustomCategory}
								setCustomModalVisible={setCustomModalVisible}
								expandedGroups={expandedGroups}
								categories={incomeCategories}
								selectedCategories={selectedIds}
								setSelectedCategories={setSelectedIds}
								toggleGroup={toggleGroup}
								type="income"
							/>

							<View className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
								<Text className="font-amedium text-gray-800 mb-2">Category Requirements</Text>
								<View className="flex-row items-center mb-2">
									<View
										className={`w-4 h-4 rounded-full mr-2 ${selectedExpenseCount >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}
									>
										{selectedExpenseCount >= 3 && <Check size={12} color="#FFFFFF" />}
									</View>
									<Text className="text-gray-600 font-aregular">
										At least 3 expense categories selected
									</Text>
								</View>
								<View className="flex-row items-center">
									<View
										className={`w-4 h-4 rounded-full mr-2 ${selectedIncomeCount >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}
									>
										{selectedIncomeCount >= 3 && <Check size={12} color="#FFFFFF" />}
									</View>
									<Text className="text-gray-600 font-aregular">
										At least 3 income categories selected
									</Text>
								</View>
							</View>
						</>
					)}
				</ScrollView>

				{/* Footer */}
				<View className="p-4 border-t border-gray-200 bg-gray-50">
					<View className="flex-row justify-between mb-3">
						<Text className="text-gray-600 font-amedium">Selected Categories:</Text>
						<Text className="font-medium text-gray-800">{selectedIds.length}</Text>
					</View>
					<TouchableOpacity
						className={`py-3 rounded-xl flex-row justify-center items-center ${
							selectedExpenseCount >= 3 && selectedIncomeCount >= 3
								? 'bg-indigo-600'
								: 'bg-gray-300'
						}`}
						onPress={handleSave}
						disabled={!(selectedExpenseCount >= 3 && selectedIncomeCount >= 3)}
					>
						{loading ? (
							<ActivityIndicator color="#FFFFFF" size="small" />
						) : (
							<>
								<Text
									className={`font-abold text-center mr-2 ${
										selectedExpenseCount >= 3 && selectedIncomeCount >= 3
											? 'text-white'
											: 'text-gray-500'
									}`}
								>
									Save Categories
								</Text>
								<ArrowRight
									size={18}
									color={
										selectedExpenseCount >= 3 && selectedIncomeCount >= 3 ? '#FFFFFF' : '#9CA3AF'
									}
								/>
							</>
						)}
					</TouchableOpacity>
					{!(selectedExpenseCount >= 3 && selectedIncomeCount >= 3) && (
						<Text className="text-red-500 text-xs text-center mt-2">
							Please select at least 3 expense and 3 income categories
						</Text>
					)}
				</View>

				{/* Custom Category Modal */}
				<CustomCategoryModal
					createCustomCategory={handleCreateCustomCategory}
					customModalVisible={customModalVisible}
					setCustomModalVisible={setCustomModalVisible}
				/>
			</View>
		</SafeAreaView>
	);
};

export default observer(CategorySelection);
