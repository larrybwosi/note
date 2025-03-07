import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import useStore from 'src/store/useStore';
import { Transaction } from 'src/types/transaction';
import TransactionDetailsModal from './details-modal';
import { getTransactionIcon } from 'src/utils/getCategory';

interface TransactionItemProps {
	transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
	const [detailsModalVisible, setDetailsModalVisible] = useState(false);
	const { categories } = useStore();

	const category = categories.find((cat) => cat.id === transaction.categoryId);

	const formatAmount = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(Math.abs(amount));
	};

	const getAmountColor = () => {
		return transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
	};

	const getAmountPrefix = () => {
		return transaction.type === 'income' ? '+' : '-';
	};

	const Icon = getTransactionIcon(transaction.categoryId);

	return (
		<>
			<TouchableOpacity
				className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-3 flex-row items-center"
				onPress={() => setDetailsModalVisible(true)}
			>
				<View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
					<Icon color={category?.color || '#9CA3AF'} />
				</View>

				{/* Transaction Info */}
				<View className="flex-1">
					<Text className="text-base font-rmedium text-gray-900 dark:text-white">
						{transaction.description}
					</Text>
					<Text className="text-xs text-gray-500 dark:text-gray-400">
						{format(transaction.date, 'MMM d, yyyy')} • {category?.name || 'Uncategorized'}
					</Text>
					{transaction.recurring && (
						<View className="flex-row items-center mt-1">
							<Text className="text-xs text-blue-600 dark:text-blue-400">
								Recurring ({transaction.recurring.frequency})
							</Text>
						</View>
					)}
				</View>

				{/* Amount */}
				<View className="items-end">
					<Text className={`text-base font-rbold ${getAmountColor()}`}>
						{getAmountPrefix()}
						{formatAmount(transaction.amount)}
					</Text>
					{transaction.status && (
						<View
							className={`px-2 py-0.5 rounded-full mt-1 ${
								transaction.status === 'completed'
									? 'bg-green-100'
									: transaction.status === 'pending'
										? 'bg-yellow-100'
										: 'bg-red-100'
							}`}
						>
							<Text
								className={`text-xs ${
									transaction.status === 'completed'
										? 'text-green-800'
										: transaction.status === 'pending'
											? 'text-yellow-800'
											: 'text-red-800'
								}`}
							>
								{transaction.status === 'due-to-pay'
									? 'Due'
									: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
							</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>

			<TransactionDetailsModal
				transaction={transaction}
				visible={detailsModalVisible}
				onClose={() => setDetailsModalVisible(false)}
			/>
		</>
	);
};
