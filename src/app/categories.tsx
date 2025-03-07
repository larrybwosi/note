import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	TextInput,
	ActivityIndicator,
	Alert,
	Animated,
} from 'react-native';
import {
	PlusCircle,
	Search,
	Check,
	X,
	Tag,
	ArrowRight,
	Info,
	ChevronLeft,
	Star,
} from 'lucide-react-native';
import { Category, DEFAULT_CATEGORIES, ICON_MAP, TransactionType } from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer, use$, useObservable } from '@legendapp/state/react';
import CustomCategoryModal from 'src/components/custom-category-modal';
import CategoryList from 'src/components/category-list';
import { router } from 'expo-router';
import { useRef, useEffect } from 'react';

const CategorySelection = () => {
	// Animation refs
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(20)).current;

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
		expandedGroups: { expense: true, income: false },
		loading: false,
		showInfo: false,
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
		showInfo,
	} = use$(state$);

	const setCategories = state$.categories.set;
	const setSelectedIds = state$.selectedIds.set;
	const setSearchQuery = state$.searchQuery.set;
	const setActiveTab = state$.activeTab.set;
	const setCustomModalVisible = state$.customModalVisible.set;
	const setExpandedGroups = state$.expandedGroups.set;
	const setCustomCategory = state$.customCategory.set;
	const setLoading = state$.loading.set;
	const setShowInfo = state$.showInfo.set;

	// Run entrance animation
	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 600,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 600,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

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
				Alert.alert(
					'Minimum Required',
					'You need at least 3 expense categories for accurate financial tracking.',
					[{ text: 'OK', style: 'default' }]
				);
				return;
			}
			if (category?.type === 'income' && selectedIncomeCount <= 3) {
				Alert.alert(
					'Minimum Required',
					'You need at least 3 income categories for accurate financial tracking.',
					[{ text: 'OK', style: 'default' }]
				);
				return;
			}

			setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
		} else {
			// Add with animation effect
			setSelectedIds([...selectedIds, id]);
		}
	};

	const handleCreateCustomCategory = (newCategory: Category) => {
		setCategories([...categories, newCategory]);
		setSelectedIds([...selectedIds, newCategory.id]);
		setCustomModalVisible(false);

		// Reset custom category form data
		setCustomCategory({
			id: '',
			name: '',
			type: 'expense',
			color: '#4F46E5',
			icon: 'circle',
			isCustom: true,
		});

		// Show success feedback
		Alert.alert('Category Created', `"${newCategory.name}" has been added to your categories.`, [
			{ text: 'Great!', style: 'default' },
		]);
	};

	const handleSave = () => {
		setLoading(true);

		// Simulate API call with timeout
		setTimeout(() => {
			try {
				const existingCategoryIds = existingCategories.map((cat) => cat.id);

				// Filter out only the newly selected categories (not in existing categories)
				const newlySelectedCategories = categories
					.filter((cat) => selectedIds.includes(cat.id) && !existingCategoryIds.includes(cat.id))
					.map((cat) => ({ ...cat, isSelected: true }));

				// Add new categories to store
				newlySelectedCategories.forEach((cat) => {
					addCategory(cat);
				});

				// Navigate back
				router.back();
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

	const handleCreateFromSearch = () => {
		if (searchQuery.trim().length < 2) {
			Alert.alert('Invalid Name', 'Category name must be at least 2 characters');
			return;
		}

		setCustomCategory({
			...customCategory,
			name: searchQuery,
			type: activeTab || ('expense' as TransactionType),
		});
		setCustomModalVisible(true);
	};

	return (
		<SafeAreaView className="bg-gray-50 flex-1">
			<Animated.View
				className="flex-1"
				style={{
					opacity: fadeAnim,
					transform: [{ translateY: slideAnim }],
				}}
			>
				<View className="bg-white rounded-b-3xl shadow-md">
					{/* Header */}
					<View className="p-3 pb-4">
						<View className="flex-row justify-between items-center">
							<TouchableOpacity
								onPress={() => router.back()}
								className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
							>
								<ChevronLeft size={20} color="#374151" />
							</TouchableOpacity>

							<Text className="text-gray-900 text-xl font-bold">Customize Categories</Text>

							<TouchableOpacity
								onPress={() => setShowInfo(!showInfo)}
								className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
							>
								<Info size={20} color={showInfo ? '#4F46E5' : '#374151'} />
							</TouchableOpacity>
						</View>
					</View>

					{/* Info Panel (conditionally shown) */}
					{showInfo && (
						<View className="mx-6 mb-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
							<View className="flex-row">
								<Tag size={20} color="#4F46E5" />
								<View className="ml-3 flex-1">
									<Text className="font-bold text-indigo-800 text-base">
										Why categorize your finances?
									</Text>
									<Text className="text-indigo-700 mt-1 leading-5">
										Categories help you understand your spending patterns and track your financial
										progress. Select categories that match your lifestyle for better insights.
									</Text>

									<View className="mt-3 flex-row items-center">
										<Star size={16} color="#4F46E5" />
										<Text className="ml-2 text-indigo-800 font-medium">
											Choose at least 3 categories of each type
										</Text>
									</View>
								</View>
							</View>
						</View>
					)}

					{/* Search */}
					<View className="px-6 pb-4">
						<View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
							<Search size={18} color="#6B7280" />
							<TextInput
								className="flex-1 ml-2 text-gray-800 font-medium"
								value={searchQuery}
								onChangeText={setSearchQuery}
								placeholder="Search categories..."
								placeholderTextColor="#9CA3AF"
								returnKeyType="search"
							/>
							{searchQuery.length > 0 && (
								<TouchableOpacity
									onPress={() => setSearchQuery('')}
									className="bg-gray-200 rounded-full p-1"
								>
									<X size={16} color="#4B5563" />
								</TouchableOpacity>
							)}
						</View>
					</View>

					{/* Category Type Switch */}
					{searchQuery.length > 0 && (
						<View className="px-6 pb-4 flex-row">
							<TouchableOpacity
								onPress={() => setActiveTab('expense')}
								className={`flex-1 py-3 rounded-l-xl border border-r-0 ${
									activeTab === 'expense'
										? 'bg-indigo-100 border-indigo-200'
										: 'bg-gray-100 border-gray-200'
								}`}
							>
								<Text
									className={`text-center font-bold ${
										activeTab === 'expense' ? 'text-indigo-700' : 'text-gray-500'
									}`}
								>
									Expenses
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setActiveTab('income')}
								className={`flex-1 py-3 rounded-r-xl border border-l-0 ${
									activeTab === 'income'
										? 'bg-teal-100 border-teal-200'
										: 'bg-gray-100 border-gray-200'
								}`}
							>
								<Text
									className={`text-center font-bold ${
										activeTab === 'income' ? 'text-teal-700' : 'text-gray-500'
									}`}
								>
									Income
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				{/* Main Content */}
				<ScrollView
					className="flex-1 px-6"
					contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				>
					{searchQuery ? (
						<View className="mb-6">
							<Text className="text-gray-900 font-bold mb-4 text-lg">Search Results</Text>

							{filteredCategories.length === 0 ? (
								<View className="bg-white p-6 rounded-xl border border-gray-200 items-center shadow-sm">
									<Text className="text-gray-500 mb-3">No categories found</Text>
									<TouchableOpacity
										className="flex-row items-center bg-indigo-500 px-4 py-3 rounded-full"
										onPress={handleCreateFromSearch}
									>
										<PlusCircle size={18} color="#FFFFFF" />
										<Text className="text-white font-bold ml-2">Create "{searchQuery}"</Text>
									</TouchableOpacity>
								</View>
							) : (
								<View className="flex-row flex-wrap justify-between">
									{filteredCategories.map((category) => {
										const isSelected = selectedIds.includes(category.id);
										const Icon = ICON_MAP[category.icon];
										return (
											<TouchableOpacity
												key={category.id}
												onPress={() => handleToggleCategory(category.id)}
												className={`mb-4 p-4 rounded-xl flex-row items-center shadow-sm ${
													isSelected
														? category.type === 'expense'
															? 'bg-red-50 border-2 border-red-200'
															: 'bg-teal-50 border-2 border-teal-200'
														: 'bg-white border border-gray-200'
												}`}
												style={{ width: '48%' }}
											>
												<View
													className="w-12 h-12 rounded-xl mr-3 items-center justify-center"
													style={{ backgroundColor: category.color }}
												>
													<Icon size={20} color="#FFFFFF" />
												</View>

												<View className="flex-1">
													<Text
														className={`font-bold ${
															isSelected
																? category.type === 'expense'
																	? 'text-red-800'
																	: 'text-teal-800'
																: 'text-gray-800'
														}`}
														numberOfLines={1}
													>
														{category.name}
													</Text>

													<View
														className={`mt-1 px-2 py-0.5 rounded-full self-start ${
															category.type === 'expense' ? 'bg-red-100' : 'bg-teal-100'
														}`}
													>
														<Text
															className={`text-xs ${
																category.type === 'expense' ? 'text-red-700' : 'text-teal-700'
															}`}
														>
															{category.type}
														</Text>
													</View>
												</View>

												{isSelected && (
													<View
														className={`absolute top-2 right-2 rounded-full w-6 h-6 items-center justify-center ${
															category.type === 'expense' ? 'bg-red-500' : 'bg-teal-500'
														}`}
													>
														<Check size={14} color="#FFFFFF" />
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

							{/* Category Requirements Progress */}
							<View className="mb-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
								<Text className="font-bold text-gray-900 mb-4 text-lg">Selection Progress</Text>

								{/* Expense Progress */}
								<View className="mb-4">
									<View className="flex-row justify-between mb-2">
										<Text className="text-gray-700 font-medium">Expense Categories</Text>
										<Text
											className={`font-bold ${
												selectedExpenseCount >= 3 ? 'text-green-600' : 'text-gray-500'
											}`}
										>
											{selectedExpenseCount}/3 required
										</Text>
									</View>

									<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
										<View
											className="h-full bg-green-500 rounded-full"
											style={{
												width: `${Math.min(100, (selectedExpenseCount / 3) * 100)}%`,
											}}
										/>
									</View>
								</View>

								{/* Income Progress */}
								<View>
									<View className="flex-row justify-between mb-2">
										<Text className="text-gray-700 font-medium">Income Categories</Text>
										<Text
											className={`font-bold ${
												selectedIncomeCount >= 3 ? 'text-green-600' : 'text-gray-500'
											}`}
										>
											{selectedIncomeCount}/3 required
										</Text>
									</View>

									<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
										<View
											className="h-full bg-green-500 rounded-full"
											style={{
												width: `${Math.min(100, (selectedIncomeCount / 3) * 100)}%`,
											}}
										/>
									</View>
								</View>
							</View>
						</>
					)}
				</ScrollView>

				{/* Floating Save Button */}
				<View className="absolute bottom-0 left-0 right-0">
					<View className="p-5 rounded-t-3xl opacity-90">
						<View className="flex-row justify-between items-center mb-3">
							<Text className="text-gray-600 font-medium">Total Selected:</Text>
							<View className="bg-gray-100 px-3 py-1 rounded-full">
								<Text className="font-bold text-gray-800">{selectedIds.length}</Text>
							</View>
						</View>

						<TouchableOpacity
							className={`py-4 rounded-xl flex-row justify-center items-center ${
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
										className={`font-bold text-center text-lg mr-2 ${
											selectedExpenseCount >= 3 && selectedIncomeCount >= 3
												? 'text-white'
												: 'text-gray-500'
										}`}
									>
										Save Categories
									</Text>
									<ArrowRight
										size={20}
										color={
											selectedExpenseCount >= 3 && selectedIncomeCount >= 3 ? '#FFFFFF' : '#9CA3AF'
										}
									/>
								</>
							)}
						</TouchableOpacity>

						{!(selectedExpenseCount >= 3 && selectedIncomeCount >= 3) && (
							<Text className="text-red-500 text-center mt-2 font-medium">
								Please select at least 3 expense and 3 income categories
							</Text>
						)}
					</View>
				</View>

				{/* Custom Category Modal */}
				<CustomCategoryModal
					createCustomCategory={handleCreateCustomCategory}
					customModalVisible={customModalVisible}
					setCustomModalVisible={setCustomModalVisible}
				/>
			</Animated.View>
		</SafeAreaView>
	);
};

export default observer(CategorySelection);
