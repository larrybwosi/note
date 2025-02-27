import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction } from 'src/types/transaction';
import { getTransactionCategory, getTransactionIcon, getTransactionTitle } from 'src/utils/getCategory';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {

  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-500';
      case 'expense':
      default:
        return 'text-blue-500';
    }
  };
  const Icon = getTransactionIcon(transaction.categoryId);

  return (
		<TouchableOpacity className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 shadow-sm">
			<View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
				<Icon color={getTransactionCategory(transaction.categoryId).color}/>
			</View>
			<View className="flex-1">
				<Text className="text-gray-900 dark:text-white font-rmedium text-base">
					{transaction.description}
				</Text>
				<Text className="text-gray-500 dark:text-gray-400 font-rregular text-sm">
					{getTransactionTitle(transaction.categoryId)}
				</Text>
				<Text className="text-gray-500 dark:text-gray-400 font-rregular text-xs">
					{transaction.date.toLocaleDateString()}
				</Text>
			</View>
			<View className="items-end">
				<Text className={`font-rbold text-base ${getAmountColor()}`}>
					{transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
				</Text>
				<Text
					className={`text-xs font-rregular ${
						transaction?.status === 'completed'
							? 'text-green-500'
							: transaction.status === 'pending'
								? 'text-yellow-500'
								: 'text-blue-500'
					}`}
				>
					{transaction.status}
				</Text>
			</View>
		</TouchableOpacity>
	);
};
