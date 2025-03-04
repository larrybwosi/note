import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import {
	Calendar,
	Plus,
	Trash2,
	Clock,
	DollarSign,
	BarChart3,
  Edit,
} from 'lucide-react-native';
import { Budget, BUDGET_RULE_ALLOCATIONS } from 'src/types/transaction';
import { format } from 'date-fns';
import useStore from 'src/store/useStore';
import { observer } from '@legendapp/state/react';
import BudgetDetails from 'src/components/budget-details';
import { router } from 'expo-router';


// Budget Rule allocations labels generator
const getRuleAllocations = (ruleType: keyof typeof BUDGET_RULE_ALLOCATIONS) => {
	return BUDGET_RULE_ALLOCATIONS[ruleType] || [];
};

// Color palette for categories 
const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const BudgetManagement = () => {
	const [activeTab, setActiveTab] = useState('active');
	const [currentBudget, setCurrentBudget] = useState<Budget>();
	const [detailsVisible, setDetailsVisible] = useState(false);
 
	const { budgets, activateBudget, deleteBudget } = useStore();
	// Filter budgets based on active tab  
  const filteredBudgets = budgets.filter((budget) =>
		activeTab === 'all' ? true : budget.status === activeTab
	);
	
	
	const handleCreateBudget = () => {
		//@ts-ignore
		setCurrentBudget({
			name: '',
			amount: 0,
			startDate: new Date(),
			endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
			periodType: 'month',
			ruleType: '50-30-20',
			status: 'draft',
		});
		router.push('create-edit-budget');
	}; 

	const handleEditBudget = (budget: Budget) => {
		setCurrentBudget({ ...budget });
		router.push(`create-edit-budget?selectedBudgetId=${budget.id}`);
	};

	  const handleActivateBudget = (id: string) => {
			try {
				const result = activateBudget(id); 
				if (!result) {
					Alert.alert('Error', 'Failed to activate budget');
				}
				setActiveTab('active')
			} catch (error:any) {
				Alert.alert('Error ⚠️', `Failed to activate budget. Some unknown error occured, please check the input fields are correct then try again.`);
			}
		}; 
  const handleDeleteBudget = (id: string) => {
		Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', onPress: () => deleteBudget(id), style: 'destructive' },
		]);
	};

	const handleViewDetails = (budget: Budget) => {
		setCurrentBudget(budget);
		setDetailsVisible(true);
	};



	// Calculate remaining days
	const getRemainingDays = (endDate: Date) => {
		const today = new Date();
		const end = new Date(endDate);
		const diffTime = end.getTime() - today.getTime()
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

  const calculateProgress = (budget: Budget) => {
		const start = new Date(budget.startDate).getTime();
		const end = new Date(budget.endDate).getTime();
		const now = Date.now();
		return ((now - start) / (end - start)) * 100;
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-indigo-600 pt-12 pb-4 px-4">
				<View className="flex-row justify-between items-center">
					<View>
						<Text className="text-white text-xl font-bold">Budget Management</Text>
						<Text className="text-indigo-200 mt-1">Track & organize your financial goals</Text>
					</View>
					<TouchableOpacity className="bg-white rounded-full p-3" onPress={handleCreateBudget}>
						<Plus size={20} color="#4F46E5" />
					</TouchableOpacity>
				</View>

				{/* Tabs */}
				<View className="flex-row mt-6 bg-indigo-700 rounded-lg p-1">
					<TouchableOpacity
						className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'active' ? 'bg-white' : 'bg-transparent'}`}
						onPress={() => setActiveTab('active')}
					>
						<Text
							className={`text-center font-medium ${activeTab === 'active' ? 'text-indigo-600' : 'text-white'}`}
						>
							Active
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'draft' ? 'bg-white' : 'bg-transparent'}`}
						onPress={() => setActiveTab('draft')}
					>
						<Text
							className={`text-center font-medium ${activeTab === 'draft' ? 'text-indigo-600' : 'text-white'}`}
						>
							Drafts
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						className={`flex-1 py-2 px-4 rounded-md ${activeTab === 'expired' ? 'bg-white' : 'bg-transparent'}`}
						onPress={() => setActiveTab('expired')}
					>
						<Text
							className={`text-center font-medium ${activeTab === 'expired' ? 'text-indigo-600' : 'text-white'}`}
						>
							Expired
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Budget List */}
			<ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
				{filteredBudgets?.length === 0 ? (
					<View className="flex-1 items-center justify-center py-10">
						<View className="bg-gray-100 rounded-full p-4 mb-4">
							<BarChart3 size={32} color="#6B7280" />
						</View>
						<Text className="text-gray-600 text-lg font-medium">No budgets found</Text>
						<Text className="text-gray-500 text-center mt-2 mb-6">
							{activeTab === 'active'
								? "You don't have any active budgets."
								: activeTab === 'draft'
									? 'Start creating a new budget to save as draft.'
									: 'No expired budgets to display.'}
						</Text>
						<TouchableOpacity
							className="bg-indigo-600 py-3 px-6 rounded-lg"
							onPress={handleCreateBudget}
						>
							<Text className="text-white font-medium">Create Budget</Text>
						</TouchableOpacity>
					</View>
				) : (
					filteredBudgets?.map((budget) =>{
						const budgetRuleAllocations = getRuleAllocations(budget?.ruleType)?.groups;
						return (
							<TouchableOpacity
								key={budget.id}
								className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
								onPress={() => handleViewDetails(budget)}
							>
								<View className="p-4">
									<View className="flex-row justify-between items-center mb-2">
										<Text className="font-rbold text-lg text-gray-800">{budget.name}</Text>
										<View
											className={`px-3 py-1 rounded-full ${
												budget.status === 'active'
													? 'bg-green-100'
													: budget.status === 'draft'
														? 'bg-blue-100'
														: 'bg-gray-100'
											}`}
										>
											<Text
												className={`text-xs font-rmedium ${
													budget.status === 'active'
														? 'text-green-800'
														: budget.status === 'draft'
															? 'text-blue-800'
															: 'text-gray-800'
												}`}
											>
												{budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
											</Text>
										</View>
									</View>

									<View className="flex-row justify-between items-center mb-3">
										<View className="flex-row items-center">
											<DollarSign size={16} color="#6B7280" />
											<Text className="text-gray-700 ml-1 font-medium">
												${budget.amount.toLocaleString()}
											</Text>
										</View>
										<View className="flex-row items-center">
											<Calendar size={16} color="#6B7280" />
											<Text className="text-gray-700 ml-1 font-amedium text-sm">
												{format(new Date(budget.startDate), 'MMM d, yyyy')} -{' '}
											{format(new Date(budget.endDate), 'MMM d, yyyy')} ({budget.periodType})
											</Text>
										</View>
									</View>

									{/* Budget Rule Type */}
									<View className="flex-row mb-3">
										<View className="flex-row flex-wrap">
											{budgetRuleAllocations.map((allocation, index) => (
												<View key={index} className="flex-row items-center mr-3 mb-1">
													<View
														className="w-3 h-3 rounded-full mr-1"
														style={{
															backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS?.length],
														}}
													/>
													<Text className="text-xs text-gray-600">
														{allocation.name} ({allocation.percentage}%)
													</Text>
												</View>
											))}
											{budget.ruleType === 'custom' && (
												<Text className="text-xs text-gray-600">Custom allocation</Text>
											)}
										</View>
									</View>

									{/* Progress Bar */}
									{budget.status === 'active' && (
										<View className="mt-1">
											<View className="flex-row justify-between items-center mb-1">
												<Text className="text-xs text-gray-500">Progress</Text>
												<View className="flex-row items-center">
													<Clock size={12} color="#6B7280" />
													<Text className="text-xs text-gray-500 ml-1">
														{getRemainingDays(budget.endDate)} days left
													</Text>
												</View>
											</View>
											<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
												<View
													className="h-full bg-indigo-600 rounded-full"
													style={{ width: `${calculateProgress(budget)}%` }}
												/>
											</View>
										</View>
									)}

									{/* Actions */}
									<View className="flex-row justify-end mt-3 pt-2 border-t border-gray-100">
										<TouchableOpacity className="p-2" onPress={() => handleEditBudget(budget)}>
											<Edit size={18} color="#4F46E5" />
										</TouchableOpacity>
										<TouchableOpacity
											className="p-2 ml-2"
											onPress={() => handleDeleteBudget(budget.id)}
										>
											<Trash2 size={18} color="#EF4444" />
										</TouchableOpacity>
									</View>
								</View>
								{budget.status === 'draft' && (
									<TouchableOpacity
										className="bg-indigo-600 py-2 px-4 rounded-xl mt-2"
										onPress={() => handleActivateBudget(budget.id)}
									>
										<Text className="text-white text-sm font-medium">Activate Budget</Text>
									</TouchableOpacity>
								)}
							</TouchableOpacity>
						);})
				)}
			</ScrollView>

			{/* Budget Details Modal */}
			<BudgetDetails
				currentBudget={currentBudget}
				detailsVisible={detailsVisible}
				handleDeleteBudget={handleDeleteBudget}
				handleEditBudget={handleEditBudget}
				setDetailsVisible={setDetailsVisible}
			/>
		</View>
	);
};

export default observer(BudgetManagement);
