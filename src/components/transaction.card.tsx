import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  LinearTransition,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { Transaction, TransactionType, TransactionStatus } from '../store/finance/types';

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: () => void;
}

const getTransactionColor = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.INCOME:
      return 'text-green-500';
    case TransactionType.EXPENSE:
      return 'text-red-500';
    case TransactionType.TRANSFER:
      return 'text-blue-500';
    case TransactionType.SAVINGS:
      return 'text-purple-500';
    case TransactionType.INVESTMENT:
      return 'text-yellow-600';
    case TransactionType.DEBT_PAYMENT:
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
};

interface StatusBadgeProps {
  status: TransactionStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case TransactionStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case TransactionStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className="px-2 py-1 rounded-full">
      <Text className={`text-xs font-rmedium ${getStatusStyle(status)}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Text>
    </View>
  );
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onDelete }) => {
  const deleteGesture = Gesture.Pan()
    .activeOffsetX(-50)
    .onEnd((_, success) => {
      if (success) {
        runOnJS(onDelete)();
      }
    });

  const isIncome = transaction.type === TransactionType.INCOME;
  const transactionColor = getTransactionColor(transaction.type);

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View
        entering={SlideInRight.springify()}
        exiting={SlideOutLeft}
        layout={LinearTransition.springify()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <View className="p-4">
          {/* Header with Title and Amount */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="font-medium text-lg text-gray-800 dark:text-gray-200">
                {transaction?.title}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {transaction?.description}
              </Text>
            </View>
            <View className="items-end">
              <Text className={`font-bold text-lg ${transactionColor}`}>
                {isIncome ? '+' : '-'}${Math.abs(transaction?.amount).toLocaleString()}
              </Text>
              {transaction?.paymentMethod && (
                <Text className="text-xs text-gray-500 mt-1">via {transaction?.paymentMethod}</Text>
              )}
            </View>
          </View>

          {/* Details Row */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center space-x-2">
              <View className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                <Text className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  {transaction?.category?.name}
                </Text>
              </View>
              <StatusBadge status={transaction?.status} />
            </View>

            <View className="flex-row items-center space-x-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(`${transaction?.date}T${transaction?.time}`), 'PPp')}
              </Text>
              {transaction?.location && (
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  • {transaction?.location}
                </Text>
              )}
            </View>
          </View>

          {/* Tags Row */}
          {transaction?.tags && transaction?.tags.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-1">
              {transaction?.tags.map((tag) => (
                <View key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Text className="text-xs text-gray-600 dark:text-gray-300">{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default TransactionCard;
