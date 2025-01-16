import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction, TransactionStatus, TransactionType } from 'src/store/types';
import { ArrowUp, ArrowDown, RefreshCw, DollarSign, TrendingUp, CreditCard } from 'lucide-react-native';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case TransactionType.INCOME:
        return <ArrowUp color="#10b981" size={24} />;
      case TransactionType.EXPENSE:
        return <ArrowDown color="#ef4444" size={24} />;
      case TransactionType.TRANSFER:
        return <RefreshCw color="#3b82f6" size={24} />;
      case TransactionType.SAVINGS:
        return <DollarSign color="#8b5cf6" size={24} />;
      case TransactionType.INVESTMENT:
        return <TrendingUp color="#f59e0b" size={24} />;
      case TransactionType.DEBT_PAYMENT:
        return <CreditCard color="#6366f1" size={24} />;
      default:
        return <RefreshCw color="#3b82f6" size={24} />;
    }
  };

  const getAmountColor = () => {
    switch (transaction.type) {
      case TransactionType.INCOME:
      case TransactionType.SAVINGS:
      case TransactionType.INVESTMENT:
        return 'text-green-500';
      case TransactionType.EXPENSE:
      case TransactionType.DEBT_PAYMENT:
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };


  return (
    <TouchableOpacity className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 shadow-sm">
      <View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
        {getTransactionIcon()}
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-rmedium text-base">{transaction.description}</Text>
        <Text className="text-gray-500 dark:text-gray-400 font-rregular text-sm">{transaction.category.name}</Text>
        <Text className="text-gray-500 dark:text-gray-400 font-rregular text-xs">
          {transaction.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-rbold text-base ${getAmountColor()}`}>
          {transaction.type === TransactionType.INCOME || transaction.type === TransactionType.SAVINGS || transaction.type === TransactionType.INVESTMENT
            ? '+'
            : '-'}
          ${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text className={`text-xs font-rregular ${
          transaction.status === TransactionStatus.COMPLETED
            ? 'text-green-500'
            : transaction.status === TransactionStatus.PENDING
            ? 'text-yellow-500'
            : 'text-blue-500'
        }`}>
          {transaction.status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

