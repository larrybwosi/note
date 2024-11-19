import Animated, { LinearTransition, SlideInRight, SlideOutLeft, runOnJS } from "react-native-reanimated";
import { CalendarDays, CheckCircle, CreditCard, MapPin, Repeat, XCircle } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text, View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";

import { Transaction, TransactionStatus, TransactionType } from 'src/store/finance/types';
import { colorScheme } from "nativewind";

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const getStatusStyle = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-100 dark:bg-green-900/50';
      case TransactionStatus.PENDING:
        return 'bg-yellow-100 dark:bg-yellow-900/50';
      case TransactionStatus.UPCOMING:
        return 'bg-blue-100 dark:bg-blue-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-900/50';
    }
  };

  const getStatusTextStyle = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'text-green-800 dark:text-green-200';
      case TransactionStatus.PENDING:
        return 'text-yellow-800 dark:text-yellow-200';
      case TransactionStatus.UPCOMING:
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <View className={`px-2.5 py-1 rounded-full ${getStatusStyle(status)}`}>
      <Text className={`text-xs font-medium ${getStatusTextStyle(status)}`}>
        {status}
      </Text>
    </View>
  );
};

const RecurrenceTag = ({ frequency }: { frequency: string }) => (
  <View className="flex-row items-center space-x-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/50 rounded-full">
    <Repeat size={12} className="text-purple-600 dark:text-purple-300" />
    <Text className="text-xs font-medium text-purple-600 dark:text-purple-300">
      {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
    </Text>
  </View>
);

const PaymentMethodTag = ({ method }: { method: string }) => (
  <View className="flex-row items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
    <CreditCard size={12} className="text-gray-600 dark:text-gray-300" />
    <Text className="text-[10px] font-amedium text-gray-600 dark:text-gray-300">
      {method}
    </Text>
  </View>
);

const ActionButtons = ({ onAccept, onReject }: { onAccept?: () => void; onReject?: () => void }) => (
  <View className="flex-row space-x-2 mt-3 pt-3 gap-1 border-t border-gray-100 dark:border-gray-700">
    <TouchableOpacity 
      onPress={onAccept}
      className="flex-1 flex-row items-center justify-center space-x-1 bg-green-400 py-2 rounded-lg"
    >
      <CheckCircle size={16} className="text-white" />
      <Text className="text-sm font-amedium text-white">Accept</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      onPress={onReject}
      className="flex-1 flex-row items-center justify-center space-x-1 bg-rose-400 py-2 rounded-lg"
    >
      <XCircle size={16} className="text-white" />
      <Text className="text-sm font-amedium text-white">Reject</Text>
    </TouchableOpacity>
  </View>
);

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  showAttachments?: boolean;
}
const TransactionCard = ({ 
  transaction, 
  onDelete,
  showActions = false,
  onAccept,
  onReject,
  showAttachments = false
}:TransactionCardProps) => {
  const deleteGesture = Gesture.Pan()
    .activeOffsetX(-50)
    .onEnd((_, success) => {
      if (success) {
        runOnJS(onDelete)();
      }
    });
    
  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME:
        return 'text-green-500 dark:text-green-400';
      case TransactionType.EXPENSE:
        return 'text-red-500 dark:text-red-400';
      case TransactionType.TRANSFER:
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View
        entering={SlideInRight.springify()}
        exiting={SlideOutLeft}
        layout={LinearTransition.springify()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700"
      >
        <View className="p-4">
          {/* Header Section */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-4">
              <Text className="text-base font-amedium text-gray-800 dark:text-gray-200 mb-1">
                {transaction.description}
              </Text>
              <View className="flex-row items-center space-x-2 gap-2">
                <Text className="text-sm font-aregular text-gray-500 dark:text-gray-400">
                  {transaction.category.name}
                </Text>
                {transaction.isEssential && (
                  <View className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 rounded">
                    <Text className="text-xs text-red-600 font-aregular dark:text-red-300">Essential</Text>
                  </View>
                )}
              </View>
            </View>
            <Text className={`text-lg font-bold ${getAmountColor(transaction.type)}`}>
              {transaction.type === TransactionType.EXPENSE ? '-' : '+'}
              ${transaction.amount.toLocaleString()}
            </Text>
          </View>

          {/* Tags Section */}
          {transaction.tags && transaction.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mb-3">
              {transaction.tags.map((tag) => (
                <LinearGradient style={{borderRadius:20}} colors={['#a5f3fc', '#cffafe']} key={tag} className="px-2 py-1 rounded-full">
                  <Text className="text-xs text-gray-600 dark:text-gray-500 font-aregular ">{tag}</Text>
                </LinearGradient>
              ))}
            </View>
          )}

          {/* Details Row */}
          <View className="flex-row items-center justify-between mb-2">
            <StatusBadge status={transaction.status} />
            <View className="flex-row items-center space-x-2">
              {transaction.recurringFrequency && (
                <RecurrenceTag frequency={transaction.recurringFrequency} />
              )}
              {transaction.paymentMethod && (
                <PaymentMethodTag method={transaction.paymentMethod} />
              )}
            </View>
          </View>

          {/* Additional Info */}
          <View className="flex-row justify-between items-center mt-2">
            <View className="flex-row items-center space-x-2">
              <CalendarDays size={12} className="text-gray-500 dark:text-gray-400" />
              <Text className="text-xs font-aregular text-gray-500 dark:text-gray-400">
                {format(transaction.createdAt, 'MMM d, yyyy')}
              </Text>
            </View>
            {transaction.location && (
              <View className="flex-row items-center mt-1 space-x-1">
                <MapPin size={14} className="text-gray-500 dark:text-gray-400" />
                <Text className="text-[10px] font-aregular text-gray-500 dark:text-gray-400">
                  {transaction.location}
                </Text>
              </View>
            )}
          </View>

          {/* Notes Section */}
          {transaction.notes && (
            <View className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-300">
                {transaction.notes}
              </Text>
            </View>
          )}

          {/* Attachments Section */}
          {showAttachments && transaction.attachments && transaction.attachments.length > 0 && (
            <View className="mt-2 flex-row items-center space-x-2">
              {/* <Ionicons name="attach" size={14} className="text-gray-500 dark:text-gray-400" /> */}
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {transaction.attachments.length} attachment(s)
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {showActions && (
            <ActionButtons onAccept={onAccept} onReject={onReject} />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default TransactionCard;