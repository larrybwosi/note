import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native'
import { formatDate } from 'date-fns';
import { BUDGET_RULE_ALLOCATIONS } from 'src/types/transaction';

interface BudgetDetailsProps {
  detailsVisible: boolean;
  setDetailsVisible: (value: boolean) => void;
  currentBudget: any;
  handleEditBudget: (budget: any) => void;
  handleDeleteBudget: (budgetId: string) => void;
}

const getRuleAllocations = (ruleType: keyof typeof BUDGET_RULE_ALLOCATIONS) => {
  return BUDGET_RULE_ALLOCATIONS[ruleType] || [];
};

function BudgetDetails({ detailsVisible, setDetailsVisible, currentBudget, handleEditBudget, handleDeleteBudget }: BudgetDetailsProps): React.ReactElement {

const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const ruleAllocations = getRuleAllocations(currentBudget?.ruleType);
  return (
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
											{currentBudget.status.charAt(0).toUpperCase() + currentBudget.status.slice(1)}
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
											{formatDate(new Date(currentBudget.startDate || new Date()), 'MMM dd, yyyy')}
										</Text>
									</View>
									<View>
										<Text className="text-gray-500 text-xs font-amedium">End Date</Text>
										<Text className="font-medium text-gray-800 mt-1">
											{/* {formatDate(new Date(currentBudget.endDate), 'MMM dd, yyyy')} */}
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
										<Text className="font-medium text-gray-700">{currentBudget?.ruleType}</Text>
									</Text>

									<View className="flex-row flex-wrap mt-2">
										{ruleAllocations.groups.map((allocation, index) => (
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
													${(currentBudget.amount * (allocation.percentage / 100)).toLocaleString()}
													<Text className="text-gray-500"> ({allocation.percentage}%)</Text>
												</Text>
											</View>
										))}

										{currentBudget?.ruleType === 'custom' && (
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
	);
}

export default BudgetDetails;