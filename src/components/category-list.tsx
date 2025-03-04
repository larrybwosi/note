import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
	Banknote,
	Check,
	ChevronDown,
	ChevronUp,
	CreditCard,
	PlusCircle,
	TrendingUp,
	X,
} from 'lucide-react-native';
import { ICON_MAP, TransactionType, Category } from 'src/types/transaction';

interface CategoryListProps {
	type: TransactionType;
	selectedCategories: string[];
	setSelectedCategories: (categories: string[]) => void;
	expenseCategories: Category[];
	incomeCategories: Category[];
	expandedGroups: Record<TransactionType, boolean>;
	toggleGroup: (type: TransactionType) => void;
	customCategory: Partial<Category>;
	setCustomModalVisible: (visible: boolean) => void;
	setCustomCategory: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = React.memo(
	({
		type,
		selectedCategories,
		setSelectedCategories,
		expenseCategories,
		incomeCategories,
		expandedGroups,
		toggleGroup,
		customCategory,
		setCustomModalVisible,
		setCustomCategory,
	}) => {
		const typeCategories = type === 'expense' ? expenseCategories : incomeCategories;
		const isExpanded = expandedGroups[type];
		const Icon = type === 'expense' ? CreditCard : TrendingUp;
		const gradientColors = type === 'expense' ? ['#FF6B6B', '#FF8C66'] : ['#4FD1C5', '#38B2AC'];

		const handleToggleCategory = useCallback(
			(categoryId: string) => {
				const newSelectedCategories = selectedCategories.includes(categoryId)
					? selectedCategories.filter((id) => id !== categoryId)
					: [...selectedCategories, categoryId];
				setSelectedCategories(newSelectedCategories);
			},
			[selectedCategories, setSelectedCategories]
		);

		const getIcon = useCallback((iconName: string) => {
			return ICON_MAP[iconName] || Banknote;
		}, []);

		return (
			<View className="mb-8">
				{/* Header Section */}
				<TouchableOpacity
					onPress={() => toggleGroup(type)}
					className="flex-row justify-between items-center bg-white rounded-2xl p-5 shadow-md border border-gray-100"
					style={{ elevation: 2 }}
				>
					<View className="flex-row items-center">
						<LinearGradient
							colors={gradientColors}
							className="w-12 h-12 mr-4 items-center justify-center"
							style={{ borderRadius: 22 }}
						>
							<Icon size={20} color="#FFFFFF" />
						</LinearGradient>
						<View>
							<Text className="font-rbold text-xl text-gray-800">
								{type === 'expense' ? 'Expenses' : 'Income'}
							</Text>
							<Text className="text-gray-500 text-sm font-amedium mt-1">
								{type === 'expense'
									? 'Track where your money goes'
									: 'Monitor your earnings and cash flow'}
							</Text>
						</View>
					</View>
					<View className="flex-row items-center">
						<View className="bg-gray-100 px-4 py-2 rounded-full mr-3">
							<Text className="text-gray-700 text-sm font-medium">
								{
									selectedCategories.filter((id) => typeCategories.some((cat) => cat.id === id))
										.length
								}
								/{typeCategories.length}
							</Text>
						</View>
						{isExpanded ? (
							<ChevronUp size={22} color="#6B7280" />
						) : (
							<ChevronDown size={22} color="#6B7280" />
						)}
					</View>
				</TouchableOpacity>

				{/* Expanded Section */}
				{isExpanded && (
					<View
						className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mt-2 shadow-sm"
						style={{ elevation: 1 }}
					>
						<Text className="text-gray-600 text-sm mb-4 px-2 font-amedium">
							{type === 'expense'
								? 'Select at least 3 expense categories to track your spending patterns'
								: 'Select at least 3 income categories to track your revenue sources'}
						</Text>

						<View className="flex-row flex-wrap justify-between">
							{typeCategories.map((category) => {
								const isSelected = selectedCategories.includes(category.id);
								const Icon = getIcon(category.icon);
								const subcategories = category.subcategories;

								return (
									<TouchableOpacity
										key={category.id}
										onPress={() => handleToggleCategory(category.id)}
										className="mb-3 p-3 rounded-2xl flex-row items-center shadow-sm"
										style={{
											width: '48%',
											elevation: isSelected ? 3 : 1,
											backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
											borderWidth: isSelected ? 2 : 1,
											borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
										}}
									>
										<View
											className="w-12 h-12 rounded-full mr-3 items-center justify-center"
											style={{ backgroundColor: category.color }}
										>
											<Icon size={20} color="#FFFFFF" />
										</View>
										<View className="flex-1">
											<Text
												className={`font-amedium ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}
												style={{ color: isSelected ? '#4338ca' : '#1F2937' }}
												numberOfLines={1}
											>
												{category.name}
											</Text>
											{subcategories && subcategories.length > 0 && (
												<View className="mt-2 pt-2 border-t border-gray-100">
													<Text className="text-xs font-rmedium text-gray-500 mb-1">Includes:</Text>
													<View className="flex-row flex-wrap">
														{subcategories.slice(0, 2).map((subcat, idx) => (
															<View
																key={idx}
																className="bg-gray-200 rounded-full px-2 py-1 mr-1 mb-1"
															>
																<Text className="text-xs text-gray-700">{subcat}</Text>
															</View>
														))}
														{subcategories.length > 2 && (
															<View className="bg-gray-200 rounded-full px-2 py-1 mr-1 mb-1">
																<Text className="text-xs text-gray-700">
																	+{subcategories.length - 2}
																</Text>
															</View>
														)}
													</View>
												</View>
											)}
											<Text className="text-gray-500 text-xs mt-1" numberOfLines={1}>
												{category.isCustom ? 'Custom category' : ''}
											</Text>
										</View>
										{isSelected && (
											<View className="absolute top-2 right-2 bg-indigo-500 rounded-full w-6 h-6 items-center justify-center">
												<Check size={14} color="#FFFFFF" />
											</View>
										)}
									</TouchableOpacity>
								);
							})}

							{/* Add custom category button */}
							<TouchableOpacity
								onPress={() => {
									setCustomCategory({ ...customCategory, type });
									setCustomModalVisible(true);
								}}
								className="mb-3 p-3 rounded-2xl flex-row items-center border-2 border-dashed border-gray-300 bg-white"
								style={{ width: '48%' }}
							>
								<View className="w-12 h-12 rounded-full mr-3 bg-gray-100 items-center justify-center">
									<PlusCircle size={20} color="#6B7280" />
								</View>
								<Text className="text-gray-600 font-bold">Add Custom</Text>
							</TouchableOpacity>
						</View>

						{/* Selected categories section */}
						{selectedCategories.length > 0 && (
							<View
								className="mt-6 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm"
								style={{ elevation: 1 }}
							>
								<Text className="font-bold text-gray-800 mb-3">Selected Categories</Text>
								<View className="flex-row flex-wrap">
									{typeCategories
										.filter((cat) => selectedCategories.includes(cat.id))
										.map((category) => (
											<View
												key={category.id}
												className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 m-1"
											>
												<View
													className="w-5 h-5 rounded-full mr-2"
													style={{ backgroundColor: category.color }}
												/>
												<Text className="text-sm text-gray-700 font-medium">{category.name}</Text>
												<TouchableOpacity
													className="ml-2 bg-white rounded-full p-1"
													onPress={() => handleToggleCategory(category.id)}
												>
													<X size={14} color="#6B7280" />
												</TouchableOpacity>
											</View>
										))}
								</View>
							</View>
						)}
					</View>
				)}
			</View>
		);
	}
);

export default CategoryList;
