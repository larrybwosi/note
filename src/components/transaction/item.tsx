import { View, Text, TouchableOpacity } from 'react-native';
import {
  ArrowUp,
  ArrowDown,
  RefreshCw,
  DollarSign,
  Briefcase,
  Gem,
  Gift,
  Wallet,
  ShoppingCart,
  Video,
  BusFront,
} from 'lucide-react-native';
import { ICON_MAP, Transaction } from 'src/types/transaction';
import { getTransactionCategory, getTransactionTitle } from 'src/utils/getCategory';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'ACTIVE_INCOME':
        return <Briefcase color="#10b981" size={24} />;
      case 'PASSIVE_INCOME':
        return <Gem color="#8b5cf6" size={24} />;
      case 'GIFT':
        return <Gift color="#ef4444" size={24} />;
      case 'GROCERIES':
        return <ShoppingCart color="#ef4444" size={24} />;
        case 'SUBSCRIPTIONS':
        return <Video color="#6366f1" size={24} />;
      case 'LIFESTYLE':
        return <Wallet color="#3b82f6" size={24} />;
      case 'FINANCIAL_GOALS':
        return <DollarSign color="#6366f1" size={24} />;
      case 'TRANSPORT':
        return <BusFront color="#6366f1" size={24} />;
      default:
        return <DollarSign color="#6366f1" size={24} />;
    }
  };


  const getAmountColor = () => {
    switch (transaction.type) {
      case 'income':
        return 'text-green-500';
      case 'expense':
      default:
        return 'text-blue-500';
    }
  };

  function getTransactionIcon(categoryId:string){
    const category = getTransactionCategory(categoryId)
    const Icon = ICON_MAP[categoryId]
    return <Icon color={category.color} size={20}/>
  }

  return (
		<TouchableOpacity className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 shadow-sm">
			<View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
				{getTransactionIcon(transaction.categoryId)}
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
					{transaction.type === 'income' ? '+' : '-'}$
					{Math.abs(transaction.amount).toFixed(2)}
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
