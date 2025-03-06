import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import {
	Calendar,
	Plus,
	Trash2,
	Clock,
	DollarSign,
	BarChart3,
	Edit,
	AlertCircle,
	ChevronRight,
} from 'lucide-react-native';
import { Budget, BUDGET_RULE_ALLOCATIONS } from 'src/types/transaction';
import { format } from 'date-fns';
import useStore from 'src/store/useStore';
import { observer } from '@legendapp/state/react';
import BudgetDetails from 'src/components/budget-details';
import { router } from 'expo-router';

// Color palette for categories
const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Budget Rule allocations labels generator
const getRuleAllocations = (ruleType: string) => {
	return BUDGET_RULE_ALLOCATIONS[ruleType] || [];
};

const BudgetCard = ({
	budget,
	onView,
	onEdit,
	onDelete,
	onActivate,
}: {
	budget: Budget;
	onView: (budget: Budget)=>void;
	onEdit: (id:Budget) => void;
	onDelete: (id: string) => void;
	onActivate: (id: string) => void;
}) => {
	const budgetRuleAllocations = getRuleAllocations(budget?.ruleType)?.groups;

	// Calculate remaining days
	const getRemainingDays = (endDate: Date) => {
		const today = new Date();
		const end = new Date(endDate);
		const diffTime = end.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays > 0 ? diffDays : 0;
	};

	const calculateProgress = (budget: Budget) => {
		const start = new Date(budget.startDate).getTime();
		const end = new Date(budget.endDate).getTime();
		const now = Date.now();
		const progress = ((now - start) / (end - start)) * 100;
		return Math.min(Math.max(progress, 0), 100); // Ensure between 0-100
	};

	return (
		<View className="bg-white rounded-xl mb-4 shadow overflow-hidden border border-gray-100">
			{/* Status indicator strip */}
			<View
				className={`h-1.5 w-full ${
					budget.status === 'active'
						? 'bg-green-500'
						: budget.status === 'draft'
							? 'bg-blue-500'
							: 'bg-gray-400'
				}`}
			/>

			<TouchableOpacity className="p-4" onPress={() => onView(budget)} activeOpacity={0.7}>
				<View className="flex-row justify-between items-center mb-3">
					<Text className="font-bold text-lg text-gray-800">{budget.name}</Text>
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
							className={`text-xs font-medium ${
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

				{/* Amount and Date Range */}
				<View className="mb-3">
					<View className="flex-row items-center mb-1.5">
						<DollarSign size={16} color="#4F46E5" />
						<Text className="text-gray-800 ml-1 font-bold text-base">
							${budget.amount.toLocaleString()}
						</Text>
					</View>
					<View className="flex-row items-center">
						<Calendar size={16} color="#6B7280" />
						<Text className="text-gray-600 ml-1 font-medium text-sm">
							{format(new Date(budget.startDate), 'MMM d, yyyy')} -{' '}
							{format(new Date(budget.endDate), 'MMM d, yyyy')}
						</Text>
					</View>
					<Text className="text-gray-500 text-xs ml-5">
						{budget.periodType.charAt(0).toUpperCase() + budget.periodType.slice(1)}ly budget
					</Text>
				</View>

				{/* Budget Rule Allocations */}
				<View className="bg-gray-50 p-2.5 rounded-lg mb-3">
					<Text className="text-xs font-medium text-gray-500 mb-2">
						ALLOCATION RULE: {budget.ruleType}
					</Text>
					<View className="flex-row flex-wrap">
						{budgetRuleAllocations.map((allocation, index) => (
							<View key={index} className="flex-row items-center mr-3 mb-1.5">
								<View
									className="w-3 h-3 rounded-full mr-1"
									style={{
										backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS?.length],
									}}
								/>
								<Text className="text-xs text-gray-700">
									{allocation.name} ({allocation.percentage}%)
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Progress Bar for Active Budgets */}
				{budget.status === 'active' && (
					<View className="mt-2 mb-1">
						<View className="flex-row justify-between items-center mb-1">
							<Text className="text-xs font-medium text-gray-600">Progress</Text>
							<View className="flex-row items-center">
								<Clock size={12} color="#6B7280" />
								<Text className="text-xs text-gray-600 ml-1 font-medium">
									{getRemainingDays(budget.endDate)} days left
								</Text>
							</View>
						</View>
						<View className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
							<View
								className="h-full rounded-full"
								style={{
									width: `${calculateProgress(budget)}%`,
									backgroundColor: calculateProgress(budget) > 80 ? '#EF4444' : '#4F46E5',
								}}
							/>
						</View>
					</View>
				)}
			</TouchableOpacity>

			{/* Actions Footer */}
			<View className="flex-row border-t border-gray-100">
				<TouchableOpacity
					className="flex-1 p-3 flex-row justify-center items-center"
					onPress={() => onEdit(budget)}
				>
					<Edit size={16} color="#4F46E5" />
					<Text className="ml-1.5 text-indigo-600 font-medium">Edit</Text>
				</TouchableOpacity>

				<View className="w-px bg-gray-100" />

				<TouchableOpacity
					className="flex-1 p-3 flex-row justify-center items-center"
					onPress={() => onDelete(budget.id)}
				>
					<Trash2 size={16} color="#EF4444" />
					<Text className="ml-1.5 text-red-500 font-medium">Delete</Text>
				</TouchableOpacity>

				{budget.status === 'draft' && (
					<>
						<View className="w-px bg-gray-100" />
						<TouchableOpacity
							className="flex-1 p-3 flex-row justify-center items-center bg-indigo-50"
							onPress={() => onActivate(budget.id)}
						>
							<Text className="text-indigo-700 font-medium">Activate</Text>
						</TouchableOpacity>
					</>
				)}
			</View>
		</View>
	);
};

const EmptyState = ({ activeTab, onCreateBudget }: { activeTab:string ;onCreateBudget: ()=> void }) => (
	<View className="items-center justify-center py-10">
		<View className="bg-gray-100 rounded-full p-4 mb-4">
			<BarChart3 size={40} color="#6B7280" />
		</View>
		<Text className="text-gray-700 text-lg font-bold">No budgets found</Text>
		<Text className="text-gray-500 text-center mt-2 mb-6 px-8">
			{activeTab === 'active'
				? "You don't have any active budgets yet. Create and activate one to track your finances."
				: activeTab === 'draft'
					? 'Start creating a new budget to save as draft.'
					: 'No expired budgets to display.'}
		</Text>
		<TouchableOpacity
			className="bg-indigo-600 py-3 px-6 rounded-xl shadow-sm"
			onPress={onCreateBudget}
		>
			<Text className="text-white font-bold">Create New Budget</Text>
		</TouchableOpacity>
	</View>
);

const BudgetManagement = () => {
	const [activeTab, setActiveTab] = useState('active');
	const [currentBudget, setCurrentBudget] = useState<Budget>();
	const [detailsVisible, setDetailsVisible] = useState(false);
	const [hasActiveBudget, setHasActiveBudget] = useState(false);

	const { budgets, activateBudget, deleteBudget } = useStore();

	// Filter budgets based on active tab
	const filteredBudgets = budgets.filter((budget) =>
		activeTab === 'all' ? true : budget.status === activeTab
	);

	// Check if there's an active budget
	useEffect(() => {
		const activeExists = budgets.some((budget) => budget.status === 'active');
		setHasActiveBudget(activeExists);
	}, [budgets]);

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
			categoryAllocations: [],
		});
		router.push('create-edit-budget');
	};

	const handleEditBudget = (budget:Budget) => {
		setCurrentBudget({ ...budget });
		router.push(`create-edit-budget?selectedBudgetId=${budget.id}`);
	};

	const handleActivateBudget = (id: string) => {
		if (hasActiveBudget) {
			Alert.alert(
				'Active Budget Exists',
				'You already have an active budget. Do you want to deactivate it and activate this one instead?',
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Proceed',
						onPress: () => {
							try {
								const result = activateBudget(id);
								if (!result) {
									Alert.alert('Error', 'Failed to activate budget');
								}
								setActiveTab('active');
							} catch (error) {
								Alert.alert(
									'Error ⚠️',
									'Failed to activate budget. Please check your inputs and try again.'
								);
							}
						},
					},
				]
			);
		} else {
			try {
				const result = activateBudget(id);
				if (!result) {
					Alert.alert('Error', 'Failed to activate budget');
				}
				setActiveTab('active');
			} catch (error) {
				Alert.alert(
					'Error ⚠️',
					'Failed to activate budget. Please check your inputs and try again.'
				);
			}
		}
	};

	const handleDeleteBudget = (id:string) => {
		Alert.alert(
			'Delete Budget',
			'Are you sure you want to delete this budget? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress: () => {
						deleteBudget(id);
						if (detailsVisible) setDetailsVisible(false);
					},
					style: 'destructive',
				},
			]
		);
	};

	const handleViewDetails = (budget:Budget) => {
		setCurrentBudget(budget);
		setDetailsVisible(true);
	};

	const TabButton = ({ label, tabName }: { label:string; tabName: string }) => (
		<TouchableOpacity
			className={`flex-1 py-2.5 px-4 rounded-lg ${activeTab === tabName ? 'bg-white' : 'bg-transparent'}`}
			onPress={() => setActiveTab(tabName)}
		>
			<Text
				className={`text-center font-medium ${activeTab === tabName ? 'text-indigo-600' : 'text-white'}`}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View className="flex-1 bg-gray-50">
			<StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

			{/* Header */}
			<View className="bg-indigo-600 pt-14 pb-5 px-4">
				<View className="flex-row justify-between items-center">
					<View>
						<Text className="text-white text-xl font-bold">Budget Management</Text>
						<Text className="text-indigo-200 mt-1">Take control of your finances</Text>
					</View>
					<TouchableOpacity
						className="bg-white rounded-full p-3 shadow-sm"
						onPress={handleCreateBudget}
					>
						<Plus size={20} color="#4F46E5" />
					</TouchableOpacity>
				</View>

				{/* Active Budget Indicator */}
				{hasActiveBudget && activeTab !== 'active' && (
					<TouchableOpacity
						className="mt-3 bg-indigo-500 p-2 rounded-lg flex-row items-center"
						onPress={() => setActiveTab('active')}
					>
						<AlertCircle size={16} color="#fff" />
						<Text className="text-white ml-2 flex-1">You have an active budget</Text>
						<ChevronRight size={16} color="#fff" />
					</TouchableOpacity>
				)}

				{/* Tabs */}
				<View className="flex-row mt-4 bg-indigo-700 rounded-xl p-1">
					<TabButton label="Active" tabName="active" />
					<TabButton label="Drafts" tabName="draft" />
					<TabButton label="Expired" tabName="expired" />
				</View>
			</View>

			{/* Budget List */}
			<ScrollView
				className="flex-1 px-4 pt-4"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={filteredBudgets?.length === 0 ? { flexGrow: 1 } : {}}
			>
				{filteredBudgets?.length === 0 ? (
					<EmptyState activeTab={activeTab} onCreateBudget={handleCreateBudget} />
				) : (
					<>
						{activeTab === 'active' && (
							<View className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
								<Text className="text-indigo-700 text-xs font-medium">
									Only one budget can be active at a time.
									{activeTab !== 'active' &&
										hasActiveBudget &&
										' You already have an active budget.'}
								</Text>
							</View>
						)}

						{filteredBudgets.map((budget) => (
							<BudgetCard
								key={budget.id}
								budget={budget}
								onView={handleViewDetails}
								onEdit={handleEditBudget}
								onDelete={handleDeleteBudget}
								onActivate={handleActivateBudget}
							/>
						))}

						{/* Add some bottom padding */}
						<View className="h-6" />
					</>
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
