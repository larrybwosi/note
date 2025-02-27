import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
	Calendar,
	ArrowLeft,
	Plus,
	DollarSign,
	ChevronDown,
	Clock,
	ArrowUpDown,
	Filter,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Import types
import { Budget, Category, ICON_MAP, Transaction } from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { router, useLocalSearchParams } from 'expo-router';

interface CategoryDetailsProps {
	category: Category;
	transactions: Transaction[];
	budget: Budget | null;
	onUpdateBudget: (budget: Budget) => void;
	onCreateBudget: (budget: Partial<Budget>) => void;
	onGoBack: () => void;
	onViewTransaction: (transaction: Transaction) => void;
}

const CategoryDetails = ({
	
}: CategoryDetailsProps) => {
  const { categories, transactions:trans, budgets } = useStore();
  const {id:categoryId} = useLocalSearchParams()
  
  const category = categories.find((c) => c.id === categoryId);
  const transactions = trans.filter((t) => t.categoryId === categoryId);
  const budget = budgets.find((b) => b.categories.find((c) => c.categoryId === categoryId));

  const	onUpdateBudget = (budget: Budget) => {};
	const onCreateBudget = (budget: Partial<Budget>) => {};
  const onViewTransaction = (transaction: Transaction) => {};


	const [isEditingBudget, setIsEditingBudget] = useState(false);
	const [budgetAmount, setBudgetAmount] = useState(budget?.amount.toString() || '');
	const [budgetPeriod, setBudgetPeriod] = useState<'weekly' | 'monthly' | 'yearly'>(
		budget?.period || 'monthly'
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
	const [startDate, setStartDate] = useState(budget?.startDate || new Date());
	const [endDate, setEndDate] = useState(
		budget?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
	);

	// State for transactions
	const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
	const [sortAsc, setSortAsc] = useState(false);
	const [filterActive, setFilterActive] = useState(false);

	// Render the category icon
	const renderIcon = (iconName: keyof typeof ICON_MAP, size: number, color: string) => {
		const IconComponent = ICON_MAP[iconName];
		return IconComponent ? <IconComponent size={size} color={color} /> : null;
	};

	// Calculate spending and budget metrics
	const totalSpent = useMemo(
		() => transactions.reduce((sum, t) => sum + t.amount, 0),
		[transactions]
	);

	const budgetRemaining = budget ? budget.amount - totalSpent : null;
	const budgetPercentage = budget ? (totalSpent / budget.amount) * 100 : null;

	// Sort and filter transactions
	const sortedTransactions = useMemo(() => {
		return [...transactions].sort((a, b) => {
			if (sortBy === 'date') {
				const comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
				return sortAsc ? -comparison : comparison;
			} else {
				const comparison = b.amount - a.amount;
				return sortAsc ? -comparison : comparison;
			}
		});
	}, [transactions, sortBy, sortAsc]);

	// Handle budget form submission
	const handleSaveBudget = () => {
		const numAmount = parseFloat(budgetAmount);

		if (isNaN(numAmount) || numAmount <= 0) {
			// Handle validation error
			return;
		}

		if (budget) {
			// Update existing budget
			onUpdateBudget({
				...budget,
				amount: numAmount,
				period: budgetPeriod,
				startDate,
				endDate,
			});
		} else {
			// Create new budget
			// onCreateBudget({
			// 	categoryId: category.id,
			// 	amount: numAmount,
			// 	period: budgetPeriod,
			// 	startDate,
			// 	endDate,
			// });
		}
		setIsEditingBudget(false);
	};

	// Handle date picker
	const handleDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			if (datePickerMode === 'start') {
				setStartDate(selectedDate);
			} else {
				setEndDate(selectedDate);
			}
		}
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return `$${amount.toFixed(2)}`;
	};

	// Format date
	const formatDate = (date: Date) => {
		return format(new Date(date), 'MMM d, yyyy');
	};

	// Get budget status color
	const getBudgetStatusColor = () => {
		if (!budgetPercentage) return '#10B981';
		if (budgetPercentage > 100) return '#EF4444';
		if (budgetPercentage > 85) return '#F59E0B';
		return '#10B981';
	};

  if(!category) {
    return <Text>Category not found</Text>
  };
	return (
		<ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<View className="bg-white dark:bg-gray-800 pt-7.5 pb-4 px-4 shadow-sm">
				<TouchableOpacity onPress={()=>router.back()} className="flex-row items-center mb-4">
					<ArrowLeft size={20} color="#3B82F6" />
					<Text className="text-blue-500 ml-1">Back to Categories</Text>
				</TouchableOpacity>

				<View className="flex-row items-center">
					<View
						style={{ backgroundColor: category.color }}
						className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
					>
						{renderIcon(category.icon, 32, '#fff')}
					</View>
					<View>
						<Text className="text-2xl font-amedium text-gray-900 dark:text-white">
							{category.name}
						</Text>
						<Text className="text-gray-500 dark:text-gray-400">{category.type} Category</Text>
					</View>
				</View>
			</View>

			{/* Budget Section */}
			<Animated.View
				entering={FadeIn.delay(100)}
				className="bg-white dark:bg-gray-800 mt-4 px-4 py-5 rounded-xl mx-4 shadow-sm"
			>
				<Text className="text-lg font-amedium text-gray-900 dark:text-white mb-3">Budget</Text>

				{!isEditingBudget ? (
					<>
						{budget ? (
							<View>
								<View className="flex-row justify-between items-center mb-2">
									<Text className="text-gray-600 dark:text-gray-300">
										{formatCurrency(budget.amount)} ({budget.period})
									</Text>
									<TouchableOpacity
										onPress={() => setIsEditingBudget(true)}
										className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full"
									>
										<Text className="text-blue-600 dark:text-blue-400 text-sm">Edit Budget</Text>
									</TouchableOpacity>
								</View>

								<View className="mb-2">
									<View className="flex-row justify-between mb-1">
										<Text className="text-sm text-gray-600 dark:text-gray-300">
											{formatCurrency(totalSpent)} spent of {formatCurrency(budget.amount)}
										</Text>
										<Text
											className={`text-sm font-amedium ${
												budgetRemaining && budgetRemaining >= 0
													? 'text-green-600 dark:text-green-400'
													: 'text-red-600 dark:text-red-400'
											}`}
										>
											{budgetRemaining && budgetRemaining >= 0
												? `${formatCurrency(budgetRemaining)} remaining`
												: `${formatCurrency(Math.abs(budgetRemaining || 0))} over`}
										</Text>
									</View>

									<View className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
										<View
											style={{
												width: `${Math.min(budgetPercentage || 0, 100)}%`,
												backgroundColor: getBudgetStatusColor(),
											}}
											className="h-full rounded-full"
										/>
									</View>
								</View>

								<Text className="text-xs text-gray-500 dark:text-gray-400 mt-2">
									{formatDate(budget.startDate)} - {formatDate(budget.endDate)}
								</Text>
							</View>
						) : (
							<View className="items-center py-6">
								<Text className="text-gray-500 dark:text-gray-400 mb-3">
									No budget set for this category
								</Text>
								<TouchableOpacity
									onPress={() => setIsEditingBudget(true)}
									className="flex-row items-center bg-blue-500 px-4 py-2 rounded-full"
								>
									<Plus size={16} color="#fff" />
									<Text className="text-white ml-1">Create Budget</Text>
								</TouchableOpacity>
							</View>
						)}
					</>
				) : (
					<Animated.View entering={FadeInDown}>
						<View className="mb-4">
							<Text className="text-gray-600 dark:text-gray-300 mb-1">Amount</Text>
							<View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
								<DollarSign size={20} color="#6B7280" />
								<TextInput
									value={budgetAmount}
									onChangeText={setBudgetAmount}
									keyboardType="numeric"
									className="flex-1 text-gray-800 dark:text-gray-200 pl-2"
									placeholder="0.00"
									placeholderTextColor="#9CA3AF"
								/>
							</View>
						</View>

						<View className="mb-4">
							<Text className="text-gray-600 dark:text-gray-300 mb-1">Period</Text>
							<TouchableOpacity className="flex-row justify-between items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3">
								<Text className="text-gray-800 dark:text-gray-200">
									{budgetPeriod.charAt(0).toUpperCase() + budgetPeriod.slice(1)}
								</Text>
								<ChevronDown size={18} color="#6B7280" />
							</TouchableOpacity>
						</View>

						<View className="mb-4">
							<Text className="text-gray-600 dark:text-gray-300 mb-1">Date Range</Text>
							<View className="flex-row gap-2">
								<TouchableOpacity
									onPress={() => {
										setDatePickerMode('start');
										setShowDatePicker(true);
									}}
									className="flex-1 flex-row justify-between items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3"
								>
									<Text className="text-gray-800 dark:text-gray-200">{formatDate(startDate)}</Text>
									<Calendar size={18} color="#6B7280" />
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => {
										setDatePickerMode('end');
										setShowDatePicker(true);
									}}
									className="flex-1 flex-row justify-between items-center border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3"
								>
									<Text className="text-gray-800 dark:text-gray-200">{formatDate(endDate)}</Text>
									<Calendar size={18} color="#6B7280" />
								</TouchableOpacity>
							</View>
						</View>

						{showDatePicker && (
							<DateTimePicker
								value={datePickerMode === 'start' ? startDate : endDate}
								mode="date"
								display="default"
								onChange={handleDateChange}
							/>
						)}

						<View className="flex-row gap-3 mt-2">
							<TouchableOpacity
								onPress={() => setIsEditingBudget(false)}
								className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg items-center"
							>
								<Text className="text-gray-700 dark:text-gray-300">Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={handleSaveBudget}
								className="flex-1 py-3 bg-blue-500 rounded-lg items-center"
							>
								<Text className="text-white font-amedium">Save Budget</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				)}
			</Animated.View>

			{/* Transactions Section */}
			<Animated.View
				entering={FadeIn.delay(200)}
				className="bg-white dark:bg-gray-800 mt-4 px-4 py-5 rounded-xl mx-4 shadow-sm mb-6"
			>
				<View className="flex-row justify-between items-center mb-4">
					<Text className="text-lg font-amedium text-gray-900 dark:text-white">Transactions</Text>

					<View className="flex-row">
						<TouchableOpacity
							onPress={() => {
								if (sortBy === 'date') {
									setSortAsc(!sortAsc);
								} else {
									setSortBy('date');
									setSortAsc(false);
								}
							}}
							className={`p-2 rounded-full mr-2 ${
								sortBy === 'date'
									? 'bg-blue-100 dark:bg-blue-900/30'
									: 'bg-gray-100 dark:bg-gray-700'
							}`}
						>
							<Clock size={18} color={sortBy === 'date' ? '#3B82F6' : '#6B7280'} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => {
								if (sortBy === 'amount') {
									setSortAsc(!sortAsc);
								} else {
									setSortBy('amount');
									setSortAsc(false);
								}
							}}
							className={`p-2 rounded-full mr-2 ${
								sortBy === 'amount'
									? 'bg-blue-100 dark:bg-blue-900/30'
									: 'bg-gray-100 dark:bg-gray-700'
							}`}
						>
							<ArrowUpDown size={18} color={sortBy === 'amount' ? '#3B82F6' : '#6B7280'} />
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => setFilterActive(!filterActive)}
							className={`p-2 rounded-full ${
								filterActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
							}`}
						>
							<Filter size={18} color={filterActive ? '#3B82F6' : '#6B7280'} />
						</TouchableOpacity>
					</View>
				</View>

				{sortedTransactions?.length > 0 ? (
					sortedTransactions?.map((transaction) => (
						<TouchableOpacity
							key={transaction.id}
							onPress={() => onViewTransaction(transaction)}
							className="flex-row items-center py-3 border-b border-gray-100 dark:border-gray-700"
						>
							<View
								style={{ backgroundColor: category.color + '40' }}
								className="w-10 h-10 rounded-full items-center justify-center mr-3"
							>
								{renderIcon(category.icon, 18, category.color)}
							</View>

							<View className="flex-1">
								<Text className="text-gray-800 dark:text-gray-200">{transaction.description}</Text>
								<Text className="text-xs text-gray-500 dark:text-gray-400">
									{formatDate(transaction.date)}
									{transaction.subcategory && ` • ${transaction.subcategory}`}
									{transaction.recurring && ` • Recurring (${transaction.recurring.frequency})`}
								</Text>
							</View>

							<Text
								className={`font-amedium ${
									transaction.type === 'expense'
										? 'text-red-600 dark:text-red-400'
										: 'text-green-600 dark:text-green-400'
								}`}
							>
								{transaction.type === 'expense' ? '-' : '+'}
								{formatCurrency(transaction.amount)}
							</Text>
						</TouchableOpacity>
					))
				) : (
					<View className="items-center py-6">
						<Text className="text-gray-500 dark:text-gray-400">
							No transactions in this category
						</Text>
					</View>
				)}
			</Animated.View>
		</ScrollView>
	);
};

export default CategoryDetails;
