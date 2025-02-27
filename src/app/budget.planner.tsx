import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import {
	Calendar,
	Plus,
	Trash2,
	Clock,
	DollarSign,
	BarChart3,
	Check,
  Edit,
} from 'lucide-react-native';
import { Budget, BUDGET_RULE_ALLOCATIONS, BudgetPeriodType, BudgetStatus } from 'src/types/transaction';
import { format } from 'date-fns';
import useStore from 'src/store/useStore';
import { observer } from '@legendapp/state/react';

// Sample data
const sampleBudgets: Budget[] = [
	{
		id: '1',
		name: 'Monthly Essentials',
		amount: 2500,
		startDate: new Date('2025-02-01'),
		endDate: new Date('2025-02-28'),
		periodType: 'month',
		ruleType: '50-30-20',
		categories: [
			{ categoryId: '1', allocation: 50 },
			{ categoryId: '2', allocation: 30 },
			{ categoryId: '3', allocation: 20 },
		],
		status: 'active',
	},
	{
		id: '2',
		name: 'Holiday Savings',
		amount: 5000,
		startDate: new Date('2025-01-01'),
		endDate: new Date('2025-12-31'),
		periodType: 'year',
		ruleType: 'custom',
		categories: [
			{ categoryId: '4', allocation: 60 },
			{ categoryId: '5', allocation: 40 },
		],
		status: 'active',
	},
];

// Budget Rule allocations labels generator
const getRuleAllocations = (ruleType: keyof typeof BUDGET_RULE_ALLOCATIONS) => {
	return BUDGET_RULE_ALLOCATIONS[ruleType] || [];
};

// Color palette for categories 
const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const BudgetManagement = () => {
	const [activeTab, setActiveTab] = useState('active');
	const [modalVisible, setModalVisible] = useState(false); 
	const [currentBudget, setCurrentBudget] = useState<Budget>();
	const [detailsVisible, setDetailsVisible] = useState(false);
 
	const { budgets, activateBudget, deleteBudget, updateBudget, createBudget } = useStore();
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
			categories: [],
			status: 'draft',
		});
		setModalVisible(true);
	}; 

	const handleEditBudget = (budget: Budget) => {
		setCurrentBudget({ ...budget });
		setModalVisible(true);
	};

	  const handleActivateBudget = (id: string) => {
			try {
				const result = activateBudget(id); 
				if (!result) {
					Alert.alert('Error', 'Failed to activate budget');
				}
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

  const handleSaveBudget = () => {
		if (!currentBudget?.name || currentBudget?.amount <= 0) {
			Alert.alert('Error', 'Please provide a name and valid amount');
			return;
		}

		try {
			if (currentBudget.id) {
				// Update existing budget
				updateBudget(currentBudget as Budget);
			} else {
				// Create new budget
				createBudget({
					name: currentBudget.name,
					amount: currentBudget.amount,
					periodType: currentBudget.periodType,
					ruleType: currentBudget.ruleType,
					startDate: currentBudget.startDate,
					customAllocations:
						currentBudget.ruleType === 'custom' ? currentBudget.categories : undefined,
				});
			}
			setModalVisible(false);
		} catch (error:any) {
			Alert.alert('Error', error.message);
		}
	};

	// Format date to readable string
	const formatDate = (date: Date) => {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
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
			<ScrollView className="flex-1 px-4 pt-4">
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
					filteredBudgets.map((budget) => (
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
										<Text className="text-gray-700 ml-1">
											{format(new Date(budget.startDate), 'MMM d, yyyy')} -{' '}
											{format(new Date(budget.endDate), 'MMM d, yyyy')} ({budget.periodType})
										</Text>
									</View>
								</View>

								{/* Budget Rule Type */}
								<View className="flex-row mb-3">
									<View className="flex-row flex-wrap">
										{getRuleAllocations(budget.ruleType).map((allocation, index) => (
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
					))
				)}
			</ScrollView>

			{/* Add/Edit Budget Modal */}
			<Modal visible={modalVisible} animationType="slide" transparent={true}>
				<View className="flex-1 bg-black bg-opacity-50 justify-end">
					<View className="bg-white rounded-t-xl p-4 h-5/6">
						<View className="flex-row justify-between items-center mb-6">
							<Text className="text-xl font-bold text-gray-800">
								{currentBudget?.id ? 'Update Budget' : 'Create Budget'}
							</Text>
							<TouchableOpacity onPress={() => setModalVisible(false)}>
								<Text className="text-indigo-600 font-medium">Cancel</Text>
							</TouchableOpacity>
						</View>

						<ScrollView className="flex-1">
							<View className="mb-4">
								<Text className="text-gray-700 mb-1 font-amedium">Budget Name</Text>
								<TextInput
									className="bg-gray-100 p-3 rounded-lg text-gray-800"
									value={currentBudget?.name}
									onChangeText={(text) => setCurrentBudget({ ...currentBudget!, name: text })}
									placeholder="Enter budget name"
								/>
							</View>

							<View className="mb-4">
								<Text className="text-gray-700 mb-1 font-amedium">Budget Amount</Text>
								<View className="flex-row items-center bg-gray-100 rounded-lg">
									<View className="p-3">
										<DollarSign size={20} color="#6B7280" />
									</View>
									<TextInput
										className="flex-1 p-3 text-gray-800"
										value={currentBudget?.amount ? currentBudget.amount.toString() : ''}
										onChangeText={(text) => {
											const amount = text.replace(/[^0-9]/g, '');
											setCurrentBudget({ ...currentBudget!, amount: parseInt(amount || '0') });
										}}
										keyboardType="numeric"
										placeholder="0"
									/>
								</View>
							</View>

							<View className="mb-4">
								<Text className="text-gray-700 mb-1 font-amedium">Budget Period</Text>
								<View className="flex-row">
									{['week', 'month', 'year'].map((period) => (
										<TouchableOpacity
											key={period}
											className={`flex-1 py-3 ${period === 'year' ? '' : 'mr-2'} rounded-lg ${
												currentBudget?.periodType === period
													? 'bg-indigo-100 border border-indigo-300'
													: 'bg-gray-100'
											}`}
											onPress={() =>
												setCurrentBudget({
													...currentBudget!,
													periodType: period as BudgetPeriodType,
												})
											}
										>
											<Text
												className={`text-center font-rmedium ${
													currentBudget?.periodType === period ? 'text-indigo-700' : 'text-gray-700'
												}`}
											>
												{period.charAt(0).toUpperCase() + period.slice(1)}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>

							<View className="mb-4">
								<Text className="text-gray-700 mb-1 font-medium">Allocation Rule</Text>
								<View className="bg-gray-100 rounded-lg">
									{['50-30-20', '10-70-20', '80-20'].map((rule) => (
										<TouchableOpacity
											key={rule}
											className={`py-3 px-4 flex-row justify-between items-center ${
												rule !== 'custom' ? 'border-b border-gray-200' : ''
											}`}
											onPress={() =>
												setCurrentBudget({
													...currentBudget!,
													ruleType: rule as keyof typeof BUDGET_RULE_ALLOCATIONS,
												})
											}
										>
											<View>
												<Text className="font-medium text-gray-800">
													{rule === 'custom' ? 'Custom Allocation' : `${rule} Rule`}
												</Text>
												<Text className="text-xs text-gray-500 mt-1">
													{rule === '50-30-20'
														? 'Needs 50%, Wants 30%, Savings 20%'
														: rule === '10-70-20'
															? 'Savings 10%, Expenses 70%, Investments 20%'
															: rule === '80-20'
																? 'Necessities 80%, Discretionary 20%'
																: 'Create your own custom allocation'}
												</Text>
											</View>
											{currentBudget?.ruleType === rule && <Check size={20} color="#4F46E5" />}
										</TouchableOpacity>
									))}
								</View>
							</View>

							<View className="mb-4">
								<Text className="text-gray-700 mb-1 font-medium">Status</Text>
								<View className="flex-row">
									{['draft', 'active'].map((status) => (
										<TouchableOpacity
											key={status}
											className={`flex-1 py-3 ${status === 'active' ? '' : 'mr-2'} rounded-lg ${
												currentBudget?.status === status
													? 'bg-indigo-100 border border-indigo-300'
													: 'bg-gray-100'
											}`}
											onPress={() =>
												setCurrentBudget({ ...currentBudget!, status: status as BudgetStatus })
											}
										>
											<Text
												className={`text-center font-medium ${
													currentBudget?.status === status ? 'text-indigo-700' : 'text-gray-700'
												}`}
											>
												{status.charAt(0).toUpperCase() + status.slice(1)}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</ScrollView>

						<TouchableOpacity
							className="bg-indigo-600 py-4 rounded-lg mt-4"
							onPress={handleSaveBudget}
						>
							<Text className="text-white font-bold text-center">
								{currentBudget?.id ? 'Update Budget' : 'Create Budget'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Budget Details Modal */}
			<Modal visible={detailsVisible} animationType="slide" transparent={true}>
				<View className="flex-1 bg-black bg-opacity-50 justify-end">
					<View className="bg-white rounded-t-xl p-4 h-3/4">
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-xl font-amedium text-gray-800">Budget Details</Text>
							<TouchableOpacity onPress={() => setDetailsVisible(false)}>
								<Text className="text-indigo-600 font-amedium">Close</Text>
							</TouchableOpacity>
						</View>

						{currentBudget && (
							<ScrollView className="flex-1">
								<View className="bg-indigo-50 p-4 rounded-xl mb-4">
									<Text className="text-indigo-900 text-2xl font-bold">
										${currentBudget.amount.toLocaleString()}
									</Text>
									<Text className="text-indigo-700">{currentBudget.name}</Text>

									<View className="flex-row items-center mt-3">
										<View
											className={`px-3 py-1 rounded-full ${
												currentBudget.status === 'active'
													? 'bg-green-100'
													: currentBudget.status === 'draft'
														? 'bg-blue-100'
														: 'bg-gray-100'
											}`}
										>
											<Text
												className={`text-xs font-medium ${
													currentBudget.status === 'active'
														? 'text-green-800'
														: currentBudget.status === 'draft'
															? 'text-blue-800'
															: 'text-gray-800'
												}`}
											>
												{currentBudget.status.charAt(0).toUpperCase() +
													currentBudget.status.slice(1)}
											</Text>
										</View>

										<Text className="text-indigo-700 ml-2 text-sm">
											{currentBudget.periodType.charAt(0).toUpperCase() +
												currentBudget.periodType.slice(1)}
											ly
										</Text>
									</View>
								</View>

								{/* Dates Section */}
								<View className="bg-white mb-4 rounded-xl border border-gray-200">
									<View className="p-4 border-b border-gray-200">
										<Text className="font-amedium text-gray-800">Budget Period</Text>
									</View>
									<View className="p-4 flex-row justify-between">
										<View>
											<Text className="text-gray-500 text-xs font-amedium">Start Date</Text>
											<Text className="font-medium text-gray-800 mt-1">
												{formatDate(new Date(currentBudget.startDate))}
											</Text>
										</View>
										<View>
											<Text className="text-gray-500 text-xs font-amedium">End Date</Text>
											<Text className="font-medium text-gray-800 mt-1">
												{formatDate(new Date(currentBudget.endDate))}
											</Text>
										</View>
									</View>
								</View>

								{/* Allocation Rules */}
								<View className="bg-white mb-4 rounded-xl border border-gray-200">
									<View className="p-4 border-b border-gray-200">
										<Text className="font-medium text-gray-800">Budget Allocation</Text>
									</View>
									<View className="p-4">
										<Text className="text-gray-500 text-sm mb-2">
											Rule Type:{' '}
											<Text className="font-medium text-gray-700">{currentBudget.ruleType}</Text>
										</Text>

										<View className="flex-row flex-wrap mt-2">
											{getRuleAllocations(currentBudget.ruleType).map((allocation, index) => (
												<View key={index} className="mr-4 mb-3">
													<View className="flex-row items-center">
														<View
															className="w-4 h-4 rounded-full mr-2"
															style={{
																backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS?.length],
															}}
														/>
														<Text className="font-medium text-gray-800">{allocation.name}</Text>
													</View>
													<Text className="text-gray-600 text-sm ml-6">
														$
														{(
															currentBudget.amount *
															(allocation.percentage / 100)
														).toLocaleString()}
														<Text className="text-gray-500"> ({allocation.percentage}%)</Text>
													</Text>
												</View>
											))}

											{currentBudget.ruleType === 'custom' && (
												<Text className="text-gray-600">Custom allocation details</Text>
											)}
										</View>
									</View>
								</View>

								{/* Actions */}
								<View className="flex-row justify-between mt-2 mb-6">
									<TouchableOpacity
										className="flex-1 mr-2 py-3 bg-indigo-600 rounded-lg"
										onPress={() => {
											setDetailsVisible(false);
											handleEditBudget(currentBudget);
										}}
									>
										<Text className="text-white font-medium text-center">Edit Budget</Text>
									</TouchableOpacity>

									<TouchableOpacity
										className="flex-1 ml-2 py-3 bg-red-100 rounded-lg"
										onPress={() => {
											setDetailsVisible(false);
											handleDeleteBudget(currentBudget.id);
										}}
									>
										<Text className="text-red-600 font-medium text-center">Delete</Text>
									</TouchableOpacity>
								</View>
							</ScrollView>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default observer(BudgetManagement);
