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
import { useFinanceStore } from 'src/lib';
import {
  PREDEFINED_CATEGORY_GROUPS,
  Transaction,
  TransactionType,
  TransactionStatus,
} from 'src/lib/types';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { createTransaction, getCategory } = useFinanceStore();

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

  const getTransactionIcon = () => {
    // First try to get the category-specific icon
    if (transaction.categoryId) {
      return getCategoryIcon(transaction.categoryId);
    }

    // Fallback to transaction type icon if no category or category not found
    switch (transaction.type) {
      case TransactionType.INCOME:
        return <ArrowUp color="#10b981" size={24} />;
      case TransactionType.EXPENSE:
        return <ArrowDown color="#ef4444" size={24} />;
      default:
        return <RefreshCw color="#3b82f6" size={24} />;
    }
  };

  const getAmountColor = () => {
    switch (transaction.type) {
      case TransactionType.INCOME:
        return 'text-green-500';
      case TransactionType.EXPENSE:
      default:
        return 'text-blue-500';
    }
  };

  const getCategoryName = () => {
    if (transaction.categoryId) {
      const category = Object.values(PREDEFINED_CATEGORY_GROUPS).find(
        (cat) => cat.id === transaction.categoryId
      );
      return category?.name || 'Uncategorized';
    }
    return 'Uncategorized';
  };

  return (
    <TouchableOpacity className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-4 mb-2 shadow-sm">
      <View className="mr-4 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
        {getTransactionIcon()}
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-rmedium text-base">
          {transaction.description}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-rregular text-sm">
          {getCategoryName()}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 font-rregular text-xs">
          {transaction.date.toLocaleDateString()}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`font-rbold text-base ${getAmountColor()}`}>
          {transaction.type === TransactionType.INCOME
            ? '+'
            : '-'}
          ${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <Text
          className={`text-xs font-rregular ${
            transaction.status === TransactionStatus.COMPLETED
              ? 'text-green-500'
              : transaction.status === TransactionStatus.PENDING
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
