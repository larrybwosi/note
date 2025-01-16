import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Transaction } from 'src/store/types';
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react-native';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'INCOME':
        return <ArrowUpRight size={20} color="#10B981" />;
      case 'EXPENSE':
        return <ArrowDownRight size={20} color="#EF4444" />;
      case 'TRANSFER':
        return <RefreshCw size={20} color="#3B82F6" />;
    }
  };

  return (
    <View>
      {transactions.map((transaction) => (
        <TouchableOpacity
          key={transaction.id}
          className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg mb-2"
        >
          <View className="flex-row items-center">
            <View className="mr-3">{getTransactionIcon(transaction.type)}</View>
            <View>
              <Text className="text-gray-900 dark:text-white font-rbold">{transaction.description}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">{transaction.category.name}</Text>
            </View>
          </View>
          <View>
            <Text className={`text-right font-rbold ${
              transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'
            }`}>
              {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {transaction.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

