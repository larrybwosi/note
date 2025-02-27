import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, useColorScheme } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import {
	Book,
	Briefcase,
	Building,
	Camera,
	Car,
	Coffee,
	CreditCard,
	Dumbbell,
	Gift,
	Heart,
	Home,
	Plane,
	ShoppingCart,
	Smartphone,
	Trash2,
	Utensils,
	Volleyball,
	Wallet,
} from 'lucide-react-native';
import CategoryList from 'src/components/category-list';
import { Category } from 'src/types/transaction';
import CategoryCharts from 'src/components/category-charts';
import CategoryForm from 'src/components/category-form';
import AnimatedCard from 'src/components/animated-card';
import useStore from 'src/store/useStore';

const COLOR_OPTIONS = [
	'#FF6B6B',
	'#4ECDC4',
	'#45B7D1',
	'#96CEB4',
	'#FFEEAD',
	'#D4A5A5',
	'#9B59B6',
	'#3498DB',
	'#F1C40F',
	'#2ECC71',
];

const ICON_MAP = {
	utensils: Utensils,
	car: Car,
	home: Home,
	medical: Heart,
	cart: ShoppingCart,
	plane: Plane,
	business: Briefcase,
	card: CreditCard,
	wallet: Wallet,
	gift: Gift,
	basketball: Volleyball,
	book: Book,
	building: Building,
	coffee: Coffee,
	camera: Camera,
	fitness: Dumbbell,
	phone: Smartphone,
};
const ICON_OPTIONS = Object.keys(ICON_MAP);


function Categories() {
	const { categories, transactions, budgets, addCategory, deleteCategory } = useStore();
	const [newCategory, setNewCategory] = useState('');
	const [selectedIcon, setSelectedIcon] = useState<(typeof ICON_OPTIONS)[number]>(ICON_OPTIONS[0]);
	const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';
	const screenWidth = Dimensions.get('window').width;

	const calculateCategorySpending = useCallback(
		(categoryId: string) => {
			return transactions
				.filter((t) => t.categoryId === categoryId)
				.reduce((sum, t) => sum + t.amount, 0);
		},
		[transactions]
	);

	const getBudgetStatus = useCallback(
		(categoryId: string) => {
			const budget = budgets.find((b) => b.categoryId === categoryId);
			const spending = calculateCategorySpending(categoryId);
			if (!budget) return null;
			return {
				total: budget.amount,
				spent: spending,
				remaining: budget.amount - spending,
				percentage: (spending / budget.amount) * 100,
			};
		},
		[budgets, calculateCategorySpending]
	);
	
	const barChartData = useMemo(
		() => ({
			labels: categories.slice(0, 6).map((c) => c.name.substring(0, 5)),
			datasets: [
				{
					data: categories.slice(0, 6).map((category) => {
						const budget = getBudgetStatus(category.id);
						return budget ? budget.spent : 0;
					}),
				},
			],
		}),
		[categories, getBudgetStatus]
	);

	const handleAddCategory = () => {
		if (!newCategory.trim()) return;

		addCategory({
			id: Date.now().toString(),
			name: newCategory.trim(),
			type: 'expense',
			color: selectedColor,
			icon: selectedIcon,
			isCustom: true,
		});

		setNewCategory('');
	};

	const handleDeleteCategory = (categoryId: string) => {
		deleteCategory(categoryId);
	};

	const handleEditCategory = (category: Category) => {
		// const category = categories.find((c) => c.id === categoryId);
		// if (category) {
		// 	// TODO: Add category editing logic here
		// }
	};

	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<View className="p-4">
				<Text className="text-3xl font-rbold text-gray-900 dark:text-white mb-2">Categories</Text>
				<Text className="text-gray-600 dark:text-gray-400 mb-6">
					Manage your spending categories and track your budget allocations
				</Text>

				{/* Add New Category */}
				<CategoryForm onSubmit={handleAddCategory} />

				{/* Spending Distribution */}
				<CategoryCharts categories={categories} budgets={budgets} transactions={transactions} />

				{/* Budget vs Actual */}
				<AnimatedCard className="mb-6">
					<Text className="text-lg font-amedium text-gray-900 dark:text-white mb-2">
						Budget Analysis
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 mb-4">
						Compare your actual spending against set budgets
					</Text>
					<BarChart
						data={barChartData}
						width={screenWidth - 48}
						height={220}
						yAxisLabel="$"
						yAxisSuffix="k"
						chartConfig={{
							backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
							backgroundGradientFrom: isDark ? '#1F2937' : '#FFFFFF',
							backgroundGradientTo: isDark ? '#1F2937' : '#FFFFFF',
							decimalPlaces: 0,
							color: (opacity = 1) =>
								isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 122, 255, ${opacity})`,
							labelColor: (opacity = 1) =>
								isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
							style: {
								borderRadius: 16,
							},
						}}
						style={{
							marginVertical: 8,
							borderRadius: 16,
						}}
					/>
				</AnimatedCard>
				
				<CategoryList categories={categories} transactions={transactions} budgets={budgets} onDelete={handleDeleteCategory} onEdit={handleEditCategory} />
			</View>
		</ScrollView>
	);
}

export default Categories;
