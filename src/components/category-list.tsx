import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
	Check,
	CreditCard,
	PlusCircle,
	TrendingUp,
} from 'lucide-react-native';
import { TransactionType, Category } from 'src/types/transaction';
import { getTransactionIcon } from 'src/utils/getCategory';

interface CategoryListProps {
	type: TransactionType;
	selectedCategories: string[];
	setSelectedCategories: (categories: string[]) => void;
	categories: Category[];
	expandedGroups: Record<TransactionType, boolean>;
	toggleGroup: (type: TransactionType) => void;
	customCategory: Category;
	setCustomModalVisible: (visible: boolean) => void;
	setCustomCategory: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
	type,
	selectedCategories,
	setSelectedCategories,
	categories,
	expandedGroups,
	toggleGroup,
	customCategory,
	setCustomModalVisible,
	setCustomCategory,
}) => {
	const isExpanded = expandedGroups[type];
	const Icon = type === 'expense' ? CreditCard : TrendingUp;

	// Enhanced gradient colors for better visual appeal
	const gradientColors = type === 'expense' ? ['#FF6B6B', '#FF4757'] : ['#4FD1C5', '#0BC5EA'];

	const handleToggleCategory = useCallback(
		(categoryId: string) => {
			const newSelectedCategories = selectedCategories.includes(categoryId)
				? selectedCategories.filter((id) => id !== categoryId)
				: [...selectedCategories, categoryId];
			setSelectedCategories(newSelectedCategories);
		},
		[selectedCategories, setSelectedCategories]
	);

	const selectedCount = selectedCategories.filter((id) =>
		categories.some((cat) => cat.id === id)
	).length;

	return (
		<View className="mb-10">
			{/* Header Section - Enhanced with more depth and polish */}
			<TouchableOpacity
				onPress={() => toggleGroup(type)}
				className="flex-row justify-between items-center bg-white rounded-3xl p-4 shadow-lg border border-gray-100"
				style={{
					elevation: 4,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
				}}
			>
				<View className="flex-row items-center">
					<LinearGradient
						colors={gradientColors}
						style={{borderRadius:20}}
						className="w-14 h-14 mr-5 items-center justify-center rounded-2xl"
						start={{ x: 0.1, y: 0.2 }}
						end={{ x: 0.9, y: 0.9 }}
					>
						<Icon size={24} color="#FFFFFF" />
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
					<View
						className="px-4 py-2 rounded-full mr-4"
						style={{
							backgroundColor:
								selectedCount > 0 ? (type === 'expense' ? '#FFF5F5' : '#E6FFFA') : '#F3F4F6',
						}}
					>
						<Text
							className="text-sm font-bold"
							style={{
								color: selectedCount > 0 ? (type === 'expense' ? '#F56565' : '#38B2AC') : '#6B7280',
							}}
						>
							{selectedCount}/{categories.length}
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			{/* Expanded Section - Improved layout and card design */}
			{isExpanded && (
				<View
					className="bg-white rounded-3xl border border-gray-100 p-5 mt-3 shadow-md"
					style={{
						elevation: 2,
						shadowColor: '#000',
						shadowOffset: { width: 0, height: 1 },
						shadowOpacity: 0.05,
						shadowRadius: 5,
					}}
				>
					<View className="bg-gray-50 rounded-xl p-4 mb-5">
						<Text className="text-gray-600 font-amedium">
							{type === 'expense'
								? 'Select at least 3 expense categories to track your spending patterns'
								: 'Select at least 3 income categories to track your revenue sources'}
						</Text>
					</View>

					<View className="flex-row flex-wrap justify-between">
						{categories.map((category) => {
							const isSelected = selectedCategories.includes(category.id);
							const Icon = getTransactionIcon(category.id);
							const subcategories = category.subcategories;

							return (
								<TouchableOpacity
									key={category.id}
									onPress={() => handleToggleCategory(category.id)}
									className="mb-4 p-3 rounded-2xl flex-row items-center"
									style={{
										width: '48%',
										elevation: isSelected ? 4 : 1,
										backgroundColor: isSelected
											? type === 'expense'
												? '#FFF5F5'
												: '#E6FFFA'
											: '#ffffff',
										borderWidth: isSelected ? 2 : 1,
										borderColor: isSelected
											? type === 'expense'
												? '#FC8181'
												: '#4FD1C5'
											: '#e2e8f0',
										shadowColor: '#000',
										shadowOffset: { width: 0, height: isSelected ? 2 : 1 },
										shadowOpacity: isSelected ? 0.1 : 0.05,
										shadowRadius: isSelected ? 4 : 2,
									}}
								>
									<View
										className="w-10 h-10 rounded-xl mr-3 items-center justify-center"
										style={{ backgroundColor: category.color }}
									>
										<Icon size={20} color="#FFFFFF" />
									</View>
									<View className="flex-1">
										<Text
											className="font-bold text-base"
											style={{
												color: isSelected
													? type === 'expense'
														? '#E53E3E'
														: '#319795'
													: '#1F2937',
											}}
											numberOfLines={1}
										>
											{category.name}
										</Text>

										{subcategories && subcategories.length > 0 && (
											<View className="mt-2">
												<View className="flex-row flex-wrap">
													{subcategories.slice(0, 2).map((subcat, idx) => (
														<View key={idx} className="bg-gray-100 rounded-md px-2 py-1 mr-1 mb-1">
															<Text className="text-xs text-gray-700">{subcat}</Text>
														</View>
													))}
													{subcategories.length > 2 && (
														<View className="bg-gray-100 rounded-md px-2 py-1">
															<Text className="text-xs text-gray-700">
																+{subcategories.length - 2}
															</Text>
														</View>
													)}
												</View>
											</View>
										)}

										{category.isCustom && (
											<View className="mt-1 bg-gray-100 self-start rounded-md px-2 py-1">
												<Text className="text-gray-500 text-xs">Custom</Text>
											</View>
										)}
									</View>

									{isSelected && (
										<View
											className="absolute top-2 right-2 rounded-full w-6 h-6 items-center justify-center"
											style={{
												backgroundColor: type === 'expense' ? '#E53E3E' : '#38B2AC',
											}}
										>
											<Check size={14} color="#FFFFFF" />
										</View>
									)}
								</TouchableOpacity>
							);
						})}

						{/* Add custom category button - Enhanced design */}
						<TouchableOpacity
							onPress={() => {
								setCustomCategory({ ...customCategory, type });
								setCustomModalVisible(true);
							}}
							className="mb-4 rounded-2xl flex-row items-center justify-center border-2 border-dashed bg-white"
							style={{
								width: '48%',
								height: 100,
								borderColor: type === 'expense' ? '#FEB2B2' : '#B2F5EA',
							}}
						>
							<View className="items-center">
								<View
									className="w-12 h-12 rounded-full mb-2 items-center justify-center"
									style={{
										backgroundColor: type === 'expense' ? '#FFF5F5' : '#E6FFFA',
									}}
								>
									<PlusCircle size={24} color={type === 'expense' ? '#F56565' : '#38B2AC'} />
								</View>
								<Text
									className="font-bold text-sm"
									style={{
										color: type === 'expense' ? '#E53E3E' : '#319795',
									}}
								>
									Add Custom
								</Text>
							</View>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
};

export default CategoryList;
