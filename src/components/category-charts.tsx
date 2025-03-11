// CategoryCharts.tsx
import { View, Text, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useColorScheme } from 'react-native';
import { Category } from 'src/types/transaction';
import AnimatedCard from './animated-card';

interface CategoryChartsProps {
	categories: Category[];
	transactions: any[];
	budgets: any[];
}

export const CategoryCharts = ({ categories, transactions, budgets }: CategoryChartsProps) => {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	const screenWidth = Dimensions.get('window').width;

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
			percentage: (spending / budget.amount) * 100,
		};
	};

	const pieChartData = categories.map((category) => ({
		name: category.name,
		spending: calculateCategorySpending(category.id),
		color: category.color,
		legendFontColor: isDark ? '#E5E7EB' : '#4B5563',
		legendFontSize: 12,
	}));

	const barChartData = {
		labels: categories.slice(0, 6).map((c) => c.name.substring(0, 5)),
		datasets: [
			{
				data: categories.slice(0, 6).map((category) => {
					const budget = getBudgetStatus(category.id);
					return budget ? budget.spent : 0;
				}),
			},
		],
	};

	return (
		<>
			<AnimatedCard className="mb-6 mt-4">
				<Text className="text-xl font-amedium text-gray-900 dark:text-white mb-2">
					Spending Overview
				</Text>
				<PieChart
					data={pieChartData}
					width={screenWidth - 48}
					height={220}
					chartConfig={{
						color: (opacity = 1) =>
							isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
					}}
					accessor="spending"
					backgroundColor="transparent"
					paddingLeft="15"
					absolute
				/>
			</AnimatedCard>

			<AnimatedCard className="mb-6">
				<Text className="text-lg font-amedium text-gray-900 dark:text-white mb-2">
					Budget Analysis
				</Text>
				<BarChart
					data={barChartData}
					width={screenWidth - 48}
					height={220}
					yAxisLabel="$"
          yAxisSuffix='k'
					chartConfig={{
						backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
						backgroundGradientFrom: isDark ? '#1F2937' : '#FFFFFF',
						backgroundGradientTo: isDark ? '#1F2937' : '#FFFFFF',
						color: (opacity = 1) =>
							isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
					}}
					style={{
						marginVertical: 8,
						borderRadius: 16,
					}}
				/>
			</AnimatedCard>
		</>
	);
};

export default CategoryCharts;