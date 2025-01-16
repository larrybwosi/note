import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle } from 'lucide-react-native';
import { Transaction } from 'src/lib/types';

interface AITransactionProps {
  transaction: Transaction;
  onAccept: (transaction: Transaction) => void;
  onReject: (transaction: Transaction) => void;
}

export const AITransaction: React.FC<AITransactionProps> = ({ transaction, onAccept, onReject }) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {transaction.description}
      </Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-700 dark:text-gray-300">Amount: ${transaction.amount}</Text>
        <Text className="text-gray-700 dark:text-gray-300">{transaction.category}</Text>
      </View>
      <Text className="text-gray-700 dark:text-gray-300 mb-4">
        Date: {new Date(transaction.createdAt).toLocaleDateString()}
      </Text>
      <View className="flex-row justify-end">
        <TouchableOpacity
          onPress={() => onAccept(transaction)}
          className="bg-green-500 rounded-full p-2 mr-2"
        >
          <CheckCircle size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onReject(transaction)}
          className="bg-red-500 rounded-full p-2"
        >
          <XCircle size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

