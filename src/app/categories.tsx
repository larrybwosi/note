import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme } from 'react-native';
import Animated, {
	FadeIn,
	FadeOut,
	SlideInRight,
	withSpring,
	useAnimatedStyle,
	withTiming,
	interpolateColor,
	useSharedValue,
  LinearTransition,
} from 'react-native-reanimated';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useStore } from 'src/store/useStore';
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

const AnimatedCard = ({ children, style }: any) => (
	<Animated.View
		entering={FadeIn.duration(400)}
		exiting={FadeOut.duration(300)}
		layout={LinearTransition.springify()}
		className="bg-white my-2 dark:bg-gray-800 rounded-2xl p-4 shadow-md dark:shadow-gray-900"
		style={style}
	>
		{children}
	</Animated.View>
);

const CategoryProgressBar = ({ percentage }: { percentage: number }) => {
	const width = useSharedValue(0);
	const colorProgress = useSharedValue(0);

	useEffect(() => {
		width.value = withSpring(percentage, { damping: 15 });
		colorProgress.value = withTiming(percentage / 100, { duration: 500 });
	}, [percentage]);

	const animatedStyle = useAnimatedStyle(() => ({
		width: `${Math.min(width.value, 100)}%`,
		backgroundColor: interpolateColor(
			colorProgress.value,
			[0, 0.75, 0.9, 1],
			['#2ECC71', '#F1C40F', '#E74C3C', '#C0392B']
		),
	}));

	return (
		<View className="bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
			<Animated.View className="h-full rounded-full" style={animatedStyle} />
		</View>
	);
};

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
				.filter((t) => t.category === categoryId)
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

	const pieChartData = useMemo(
		() =>
			categories.map((category) => ({
				name: category.name,
				spending: calculateCategorySpending(category.id),
				color: category.color,
				legendFontColor: isDark ? '#E5E7EB' : '#4B5563',
				legendFontSize: 12,
			})),
		[categories, calculateCategorySpending, isDark]
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

	const renderIcon = (iconName: keyof typeof ICON_MAP, size: number, color: string) => {
		const IconComponent = ICON_MAP[iconName];
		return IconComponent ? <IconComponent size={size} color={color} /> : null;
	};
	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<View className="p-4">
				<Text className="text-3xl font-rbold text-gray-900 dark:text-white mb-2">Categories</Text>
				<Text className="text-gray-600 dark:text-gray-400 mb-6">
					Manage your spending categories and track your budget allocations
				</Text>

				{/* Add New Category */}
				<AnimatedCard className="mb-6">
					<Text className="text-lg font-amedium text-gray-900 dark:text-white mb-2">
						Create Category
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 mb-4 font-rregular">
						Choose an icon and color to help identify your new category
					</Text>

					<TextInput
						className="bg-gray-100 dark:bg-gray-700 p-4 rounded-xl mb-4 text-gray-900 dark:text-white"
						value={newCategory}
						onChangeText={setNewCategory}
						placeholder="Category name"
						placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
					/>

					{/* Icon Selection */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
						{ICON_OPTIONS.map((icon) => (
							<TouchableOpacity
								key={icon}
								onPress={() => setSelectedIcon(icon)}
								className={`p-3 mr-2 rounded-xl ${
									selectedIcon === icon ? 'bg-indigo-500' : 'bg-gray-100 dark:bg-gray-700'
								}`}
							>
								{renderIcon(icon, 24, selectedIcon === icon ? '#fff' : '#6B7280')}
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Color Selection */}
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
						{COLOR_OPTIONS.map((color) => (
							<TouchableOpacity
								key={color}
								onPress={() => setSelectedColor(color)}
								style={{ backgroundColor: color }}
								className={`w-10 h-10 mr-2 rounded-xl ${
									selectedColor === color ? 'border-4 border-blue-500' : ''
								}`}
							/>
						))}
					</ScrollView>

					<TouchableOpacity
						onPress={handleAddCategory}
						className="bg-blue-500 dark:bg-blue-600 p-4 rounded-xl"
					>
						<Text className="text-white text-center font-semibold">Create Category</Text>
					</TouchableOpacity>
				</AnimatedCard>

				{/* Spending Distribution */}
				<AnimatedCard className="mb-6 mt-4">
					<Text className="text-xl font-amedium text-gray-900 dark:text-white mb-2">
						Spending Overview
					</Text>
					<Text className="text-gray-600 dark:text-gray-400 mb-4">
						Visual breakdown of your spending across categories
					</Text>
					<PieChart
						data={pieChartData}
						width={screenWidth - 48}
						height={220}
						chartConfig={{
							color: (opacity = 1) =>
								isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
							labelColor: (opacity = 1) =>
								isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
						}}
						accessor="spending"
						backgroundColor="transparent"
						paddingLeft="15"
						absolute
					/>
				</AnimatedCard>

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

				{/* Category List */}
				{categories.map((category) => {
					const budgetStatus = getBudgetStatus(category.id);
					const spending = calculateCategorySpending(category.id);

					return (
						<Animated.View
							key={category.id}
							entering={SlideInRight}
							layout={Layout.springify()}
							className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm"
						>
							<View className="flex-row justify-between items-center mb-3">
								<View className="flex-row items-center">
									<View
										style={{ backgroundColor: category.color }}
										className="w-10 h-10 rounded-xl items-center justify-center mr-3"
									>
										{renderIcon(category.icon, 20, '#fff')}
									</View>
									<View>
										<Text className="text-lg font-semibold text-gray-900 dark:text-white">
											{category.name}
										</Text>
										<Text className="text-sm text-gray-500 dark:text-gray-400">
											{(
												(spending / transactions.reduce((sum, t) => sum + t.amount, 0)) *
												100
											).toFixed(1)}
											% of total
										</Text>
									</View>
								</View>
								{category.isCustom && (
									<TouchableOpacity onPress={() => deleteCategory(category.id)} className="p-2">
										<Trash2 size={20} color="#EF4444" />
									</TouchableOpacity>
								)}
							</View>

							{budgetStatus && (
								<View className="mb-3">
									<View className="flex-row justify-between mb-2">
										<Text className="text-gray-600 dark:text-gray-400">
											${budgetStatus.spent.toLocaleString()} spent
										</Text>
										<Text className="text-gray-600 dark:text-gray-400">
											${budgetStatus.total.toLocaleString()} budget
										</Text>
									</View>
									<CategoryProgressBar percentage={budgetStatus.percentage} />
								</View>
							)}

							<View className="flex-row justify-between">
								<View>
									<Text className="text-sm font-medium text-gray-900 dark:text-white">
										Total Spent
									</Text>
									<Text className="text-lg font-bold text-gray-900 dark:text-white">
										${spending.toLocaleString()}
									</Text>
								</View>
								{budgetStatus && (
									<View>
										<Text className="text-sm font-medium text-gray-900 dark:text-white text-right">
											Remaining
										</Text>
										<Text
											className={`text-lg font-bold text-right ${
												budgetStatus.remaining >= 0 ? 'text-green-500' : 'text-red-500'
											}`}
										>
											${Math.abs(budgetStatus.remaining).toLocaleString()}
										</Text>
									</View>
								)}
							</View>
						</Animated.View>
					);
				})}
			</View>
		</ScrollView>
	);
}

export default Categories;
