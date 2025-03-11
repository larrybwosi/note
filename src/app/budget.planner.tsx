import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import {
	Plus,
	AlertCircle,
	ChevronRight,
} from 'lucide-react-native';
import { Budget } from 'src/types/transaction';
import useStore from 'src/store/useStore';
import { observer } from '@legendapp/state/react';
import BudgetDetails from 'src/components/budget-details';
import { router } from 'expo-router';
import EmptyState from 'src/components/budget/empty-state';
import BudgetCard from 'src/components/budget/card';
import { useFeedbackModal } from 'src/components/ui/feedback';

// Color palette for categories



const BudgetManagement = () => {
	const [activeTab, setActiveTab] = useState('active');
	const [currentBudget, setCurrentBudget] = useState<Budget>();
	const [detailsVisible, setDetailsVisible] = useState(false);
	const [hasActiveBudget, setHasActiveBudget] = useState(false);

	const { budgets, activateBudget, deleteBudget } = useStore();
			const { showModal, hideModal } = useFeedbackModal()

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
		showModal({
			type: 'confirmation',
			title: 'Delete Budget',
			message: 'Are you sure you want to delete this budget? This action cannot be undone.',
			primaryButtonText: 'Delete',
			onPrimaryAction: () => {
				deleteBudget(id);
				if (detailsVisible) setDetailsVisible(false);
			},
			secondaryButtonText: 'Cancel',
			onSecondaryAction: () => setDetailsVisible(false),
		});
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
