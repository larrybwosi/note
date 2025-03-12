import { useState, useEffect } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import useStore from 'src/store/useStore';
import { formatCurrency } from 'src/utils/currency';
import { observer } from '@legendapp/state/react';

const SpendingOverview = (): React.ReactElement => {
	const [animatedValue] = useState(new Animated.Value(0));
	const { categories, getActiveBudgetSpending, getCategoryMonthlyTotal } =
		useStore();
	const EXPENSE_CATEGORIES = categories.filter((cat) => cat.type === 'expense');

	const currentBudgetSpending = getActiveBudgetSpending();
	const totalSpent = currentBudgetSpending?.totalSpent;

	// Animate component on mount
	useEffect(() => {
		Animated.timing(animatedValue, {
			toValue: 1,
			duration: 800,
			useNativeDriver: true,
		}).start();
	}, []);

	const getCategoryPercentage = (categoryTotal: number) => {
		const total = currentBudgetSpending?.totalSpent || 0;
		return total > 0 ? Math.round((categoryTotal / total) * 100) : 0;
	};

	// Sort categories by total spending
	const sortedCategories = [...EXPENSE_CATEGORIES].sort(
		(a, b) => (getCategoryMonthlyTotal(b.id) || 0) - (getCategoryMonthlyTotal(a.id) || 0)
	);

	// Get top categories for display
	const topCategories = sortedCategories.slice(0, 4);

	// Calculate mock percentage change (would come from real data)
	const changePercent = 12;

	// Define category colors similar to the image
	const categoryColors = {
		'Lifestyle': '#BAB3F4', // Purple
		'Food': '#B5D1F6', // Light blue
		'Clothing': '#D2D2D2', // Gray
		'Living Cost': '#B3E6E3', // Teal
		'Coffee': '#F9C7CC', // Pink
	};

	return (
		<Animated.View
			className="w-full bg-white dark:bg-gray-800 rounded-3xl p-6 mb-4 shadow-sm"
			style={{
				opacity: animatedValue,
				transform: [
					{
						translateY: animatedValue.interpolate({
							inputRange: [0, 1],
							outputRange: [20, 0],
						}),
					},
				],
			}}
		>
			{/* Header */}
			<View className="flex-row justify-between items-center mb-6">
				<Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">Spending Overview</Text>
				<Pressable className="h-8 w-8 bg-gray-100 rounded-full justify-center items-center">
					<Text className="text-lg font-semibold text-gray-700">↻</Text>
				</Pressable>
			</View>

			{/* Total Expense Section */}
			<View className="mb-6">
				<Text className="text-sm text-gray-500 mb-1 font-aregular dark:text-gray-300">Total Expense</Text>
				<View className="flex-row items-baseline">
					<Text className="text-4xl font-bold text-gray-800 dark:text-gray-50">
						{formatCurrency(totalSpent || 0)}
					</Text>
					<View className="flex-row items-center ml-2 bg-red-100 px-2 py-0.5 rounded-full">
						<TrendingUp size={12} color="#EF4444" />
						<Text className="text-xs font-bold text-red-500 ml-1">+{changePercent}%</Text>
					</View>
				</View>
			</View>

			{/* Category Bars - Horizontal Stack */}
			<View className="h-7 flex-row mb-5 rounded-lg overflow-hidden">
				{topCategories.map((category, index) => {
					const categoryTotal = getCategoryMonthlyTotal(category.id) || 0;
					const percentage = getCategoryPercentage(categoryTotal);
					const color =
						categoryColors[category.name as keyof typeof categoryColors] || category.color;

					return (
						<View
							key={category.id}
							style={{
								width: `${percentage}%`,
								backgroundColor: color,
							}}
						/>
					);
				})}
			</View>

			{/* Category Labels */}
			<View className="flex-row flex-wrap justify-between">
				{topCategories.map((category) => {
					const categoryTotal = getCategoryMonthlyTotal(category.id) || 0;
					const percentage = getCategoryPercentage(categoryTotal);
					const color =
						categoryColors[category.name as keyof typeof categoryColors] || category.color;

					return (
						<View key={category.id} className="items-center" style={{ width: '20%' }}>
							<View className="w-3 h-3 rounded-sm mb-1" style={{ backgroundColor: color }} />
							<Text className="text-xs text-gray-700 dark:text-gray-200 font-aregular">{category.name}</Text>
							<Text className="text-xs font-rmedium text-gray-700 dark:text-gray-100">{percentage}%</Text>
						</View>
					);
				})}
			</View>
		</Animated.View>
	);
};

export default observer(SpendingOverview);
