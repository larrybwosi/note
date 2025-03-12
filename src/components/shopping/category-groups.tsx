import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart, BarChart } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useStore from 'src/store/useStore';
import { observer } from '@legendapp/state/react';


const BudgetCategoryGroups = () => {
	const [activeView, setActiveView] = useState<'list' | 'chart'>('list');
	const [expanded, setExpanded] = useState<string[]>([]);

	// Store hooks
	const { getActiveBudgetSpending, categories } =
    useStore();
	const currentBudget = getActiveBudgetSpending()?.budget;
	const budgetSpending = getActiveBudgetSpending();
	const budgetGroups = budgetSpending?.groups
	// console.log(JSON.stringify(budgetSpending?.groups, null, 1))

	// Toggle expanded state for a group
	const toggleGroupExpand = (groupName: string) => {
		if (expanded.includes(groupName)) {
			setExpanded(expanded.filter((name) => name !== groupName));
		} else {
			setExpanded([...expanded, groupName]);
		}
	};

	// Calculate spending for a specific group
	const getGroupSpending = (groupCategories: string[]) => {
		if (!budgetSpending || !budgetSpending.groups) return 0;

		// Sum up spending for all categories in this group
		return groupCategories.reduce((total, categoryId) => {
			const categorySpending = budgetSpending.groups[categoryId]?.spent || 0;
			return total + categorySpending;
		}, 0);
	};

	// Calculate allocated amount for a group based on percentage
	const getGroupAllocation = (percentage: number) => {
		if (!currentBudget) return 0;
		return (percentage / 100) * currentBudget.amount;
	};

	// Get category name by ID
	const getCategoryName = (categoryId: string) => {
		const category = categories.find((cat) => cat.id === categoryId);
		return category ? category.name : 'Unknown';
	};

	// Calculate percentage used of a group's allocation
	const getGroupPercentageUsed = (groupCategories: string[], groupPercentage: number) => {
		const spent = getGroupSpending(groupCategories);
		const allocated = getGroupAllocation(groupPercentage);

		if (allocated === 0) return 0;
		return (spent / allocated) * 100;
	};

	// Get color based on percentage used
	const getStatusColor = (percentUsed: number) => {
		if (percentUsed >= 90) return '#EF4444'; // Red
		if (percentUsed >= 70) return '#F59E0B'; // Amber
		return '#10B981'; // Green
	};

	if (!currentBudget || !currentBudget.categoryAllocations) {
		return (
			<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 p-5">
				<Text className="text-lg text-center text-gray-500">No active budget found</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			{/* Header */}
			<View className="px-5 pt-4 pb-5 rounded-b-3xl shadow-sm">
				<Text className="text-xl font-amedium text-gray-800 mb-4 dark:text-white">
					{currentBudget.name}
				</Text>

				<View className="mt-2">
					<View className="mb-4">
						<Text className="text-sm text-gray-500 mb-1 font-aregular dark:text-gray-400">Total Budget</Text>
						<Text className="text-2xl font-bold text-gray-800 dark:text-white">
							${currentBudget.amount.toFixed(2)}
						</Text>
					</View>

					{/* View toggle */}
					<View className="flex-row bg-gray-100 rounded-lg p-1 mt-2">
						<TouchableOpacity
							className={`flex-1 p-2 rounded-md flex-row justify-center items-center ${
								activeView === 'list' && 'bg-white shadow-sm'
							}`}
						>
							<BarChart size={18} color={activeView === 'list' ? '#4F46E5' : '#6B7280'} />
							<Text
								className={`ml-2 font-medium ${
									activeView === 'list' ? 'text-indigo-600' : 'text-gray-500'
								}`}
							>
								List
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							className={`flex-1 p-2 rounded-md flex-row justify-center items-center ${
								activeView === 'chart' ? 'bg-white shadow-sm' : ''
							}`}
						>
							<PieChart size={18} color={activeView === 'chart' ? '#4F46E5' : '#6B7280'} />
							<Text
								className={`ml-2 font-medium ${
									activeView === 'chart' ? 'text-indigo-600' : 'text-gray-500'
								}`}
							>
								Chart
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			{/* Main content */}
			<ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
				<View className="mt-6 mb-10">
					<Text className="text-lg font-rbold text-gray-800 dark:text-gray-200 mb-3">Budget Groups</Text>

					{currentBudget.categoryAllocations.map((group) => {
						const percentUsed = getGroupPercentageUsed(group.categories, group.percentage);
						const isExpanded = expanded.includes(group.name);

						return (
							<View
								key={group.name}
								className="bg-white dark:bg-gray-800 rounded-2xl mb-4 overflow-hidden shadow-sm"
							>
								{/* Group Header */}
								<TouchableOpacity
									onPress={() => toggleGroupExpand(group.name)}
									className="flex-row items-center p-4 border-b border-gray-100"
								>
									<View
										className="w-3 h-3 rounded-full mr-3"
										style={{ backgroundColor: group.color }}
									/>
									<View className="flex-1">
										<Text className="text-base font-amedium text-gray-800 dark:text-gray-200">{group.name}</Text>
										<Text className="text-xs text-gray-500">{group.description}</Text>
									</View>
									<View className="items-end">
										<Text className="text-base font-bold text-gray-800">
											${getGroupAllocation(group.percentage).toFixed(2)}
										</Text>
										<Text className="text-xs text-gray-500">{group.percentage}% of budget</Text>
									</View>
								</TouchableOpacity>

								{/* Progress bar */}
								<View className="px-4 py-2">
									<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
										<View
											style={{
												width: `${Math.min(percentUsed, 100)}%`,
												backgroundColor: getStatusColor(percentUsed),
												height: '100%',
												borderRadius: 8,
											}}
										/>
									</View>
									<View className="flex-row justify-between mt-1">
										<Text className="text-xs text-gray-500">
											${getGroupSpending(group.categories).toFixed(2)} spent
										</Text>
										<Text className="text-xs" style={{ color: getStatusColor(percentUsed) }}>
											{Math.round(percentUsed)}% used
										</Text>
									</View>
								</View>

								{/* Expanded Categories List */}
								{isExpanded && (
									<View className="px-4 pb-4">
										<Text className="text-sm font-medium text-gray-600 mt-2 mb-1">Categories:</Text>
										{group.categories.map((categoryId) => (
											<View
												key={categoryId}
												className="flex-row justify-between py-2 border-b border-gray-100"
											>
												<Text className="text-sm text-gray-700">{getCategoryName(categoryId)}</Text>
												<Text className="text-sm font-medium text-gray-700">
													${(budgetSpending?.groups[categoryId]?.spent || 0).toFixed(2)}
												</Text>
											</View>
										))}
									</View>
								)}
							</View>
						);
					})}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default observer(BudgetCategoryGroups);
