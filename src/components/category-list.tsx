import { View, Text, useColorScheme } from 'react-native';
import Animated, { SlideInRight, LinearTransition } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';
import { Trash2, Edit, ChevronUp, ChevronDown } from 'lucide-react-native';
import { Category, ICON_MAP } from 'src/types/transaction';
import { useState } from 'react';

interface CategoryListProps {
	categories: Category[];
	transactions: any[];
	budgets: any[];
	onDelete: (id: string) => void;
	onEdit: (category: Category) => void;
}

type SortKey = 'name' | 'type' | 'spending' | 'budget' | null;
type SortDirection = 'asc' | 'desc';

const CategoryList = ({
	categories,
	transactions,
	budgets,
	onDelete,
	onEdit,
}: CategoryListProps) => {
	const [sortBy, setSortBy] = useState<SortKey>(null);
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const colorScheme = useColorScheme();

	// Utility function to get adaptive colors
	const getColor = (lightColor: string, darkColor: string) =>
		colorScheme === 'dark' ? darkColor : lightColor;

	const calculateCategorySpending = (categoryId: string) => {
		return transactions
			.filter((t) => t.category === categoryId)
			.reduce((sum, t) => sum + t.amount, 0);
	};

	const getBudgetStatus = (categoryId: string) => {
		const budget = budgets.find((b) => b.categoryId === categoryId);
		const spending = calculateCategorySpending(categoryId);
		if (!budget) return null;
		return {
			total: budget.amount,
			spent: spending,
			remaining: budget.amount - spending,
			percentage: Math.min((spending / budget.amount) * 100, 100),
		};
	};

	const renderIcon = (iconName: keyof typeof ICON_MAP, size: number, color: string) => {
		const IconComponent = ICON_MAP[iconName];
		return IconComponent ? <IconComponent size={size} color={color} /> : null;
	};

	const handleSort = (key: SortKey) => {
		if (sortBy === key) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(key);
			setSortDirection('asc');
		}
	};

	const sortedCategories = [...categories].sort((a, b) => {
		if (!sortBy) return 0;

		const getValue = (category: Category) => {
			switch (sortBy) {
				case 'spending':
					return calculateCategorySpending(category.id);
				case 'budget':
					return getBudgetStatus(category.id)?.total || 0;
				case 'type':
					return category.type;
				default:
					return category.name.toLowerCase();
			}
		};

		const modifier = sortDirection === 'asc' ? 1 : -1;
		return getValue(a) > getValue(b) ? 1 * modifier : -1 * modifier;
	});

	return (
		<View className={`flex-1 p-4 ${getColor('bg-white', 'bg-gray-900')}`}>
			{/* Header */}
			<View className="flex-row justify-between mb-4 px-2">
				<TouchableOpacity
					className="flex-1 flex-row items-center gap-1"
					onPress={() => handleSort('name')}
				>
					<Text className={`text-sm font-semibold ${getColor('text-gray-800', 'text-gray-200')}`}>
						Category
					</Text>
					{sortBy === 'name' &&
						(sortDirection === 'asc' ? (
							<ChevronUp size={16} color={getColor('#4b5563', '#e5e7eb')} />
						) : (
							<ChevronDown size={16} color={getColor('#4b5563', '#e5e7eb')} />
						))}
				</TouchableOpacity>

				<TouchableOpacity
					className="flex-1 flex-row items-center gap-1"
					onPress={() => handleSort('spending')}
				>
					<Text className={`text-sm font-semibold ${getColor('text-gray-800', 'text-gray-200')}`}>
						Spending
					</Text>
					{sortBy === 'spending' &&
						(sortDirection === 'asc' ? (
							<ChevronUp size={16} color={getColor('#4b5563', '#e5e7eb')} />
						) : (
							<ChevronDown size={16} color={getColor('#4b5563', '#e5e7eb')} />
						))}
				</TouchableOpacity>

				<TouchableOpacity
					className="flex-1 flex-row items-center gap-1"
					onPress={() => handleSort('budget')}
				>
					<Text className={`text-sm font-semibold ${getColor('text-gray-800', 'text-gray-200')}`}>
						Budget
					</Text>
					{sortBy === 'budget' &&
						(sortDirection === 'asc' ? (
							<ChevronUp size={16} color={getColor('#4b5563', '#e5e7eb')} />
						) : (
							<ChevronDown size={16} color={getColor('#4b5563', '#e5e7eb')} />
						))}
				</TouchableOpacity>
			</View>

			{/* Category List */}
			{sortedCategories.map((category) => {
				const budgetStatus = getBudgetStatus(category.id);
				const spending = calculateCategorySpending(category.id);
				const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
				const percentageOfTotal = totalSpending > 0 ? (spending / totalSpending) * 100 : 0;

				return (
					<Animated.View
						key={category.id}
						entering={SlideInRight}
						layout={LinearTransition}
						className={`rounded-lg p-4 mb-3 ${getColor('bg-white', 'bg-gray-800')} shadow-sm`}
					>
						{/* Category Header */}
						<View className="flex-row items-center mb-3">
							<View className={`p-2 rounded-lg mr-3`} style={{ backgroundColor: category.color }}>
								{renderIcon(category.icon, 20, '#fff')}
							</View>

							<View className="flex-1">
								<Text className={`font-semibold ${getColor('text-gray-800', 'text-gray-100')}`}>
									{category.name}
								</Text>
								<Text className={`text-xs ${getColor('text-gray-500', 'text-gray-400')}`}>
									{category.type}
								</Text>
							</View>

							<View className="flex-row gap-2">
								<TouchableOpacity onPress={() => onEdit(category)}>
									<Edit size={18} color={getColor('#666', '#9ca3af')} />
								</TouchableOpacity>
								<TouchableOpacity onPress={() => onDelete(category.id)}>
									<Trash2 size={18} color="#e74c3c" />
								</TouchableOpacity>
							</View>
						</View>

						{/* Budget Progress */}
						{budgetStatus && (
							<View className="mt-2">
								<View className={`h-2 rounded-full ${getColor('bg-gray-100', 'bg-gray-700')}`}>
									<Animated.View
										className="h-full rounded-full"
										style={{
											width: `${budgetStatus.percentage}%`,
											backgroundColor: budgetStatus.percentage > 100 ? '#e74c3c' : category.color,
										}}
									/>
								</View>

								<View className="flex-row justify-between mt-2">
									<Text className={`text-xs ${getColor('text-gray-600', 'text-gray-300')}`}>
										Spent: ${budgetStatus.spent.toFixed(2)}
									</Text>
									<Text className={`text-xs ${getColor('text-gray-600', 'text-gray-300')}`}>
										Remaining: ${Math.max(budgetStatus.remaining, 0).toFixed(2)}
									</Text>
								</View>
							</View>
						)}

						{/* Spending Details */}
						<View className="flex-row justify-between items-center mt-3">
							<Text className={`text-xs ${getColor('text-gray-600', 'text-gray-300')}`}>
								{percentageOfTotal.toFixed(1)}% of total spending
							</Text>
							<Text className={`font-semibold ${getColor('text-gray-800', 'text-gray-100')}`}>
								${spending.toFixed(2)}
							</Text>
						</View>
					</Animated.View>
				);
			})}
		</View>
	);
};

export default CategoryList;
