import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  runOnJS,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { observable } from '@legendapp/state';
import { observer, useComputed } from '@legendapp/state/react';
import { useColorScheme } from 'nativewind';
import { RecurrenceFrequency, Transaction, TransactionStatus, TransactionType } from 'src/store/finance/types';
import useFinancialStore from 'src/store/finance/store';
import { router } from 'expo-router';

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: TransactionType.INCOME,
    amount: 5000,
    category: { name: 'Salary', type: 'income' },
    createdAt: new Date('2024-05-01T00:00:00'),
    description: 'May 2023 salary',
    paymentMethod: 'Direct Deposit',
    status: TransactionStatus.COMPLETED,
    recurrence: {
      frequency: RecurrenceFrequency.MONTHLY,
      reminderEnabled: false,
    },
  },
  {
    id: '2',
    type: TransactionType.EXPENSE,
    amount: 1500,
    category: { type: 'expense', name: 'Rent' },
    createdAt: new Date('2024-05-01T00:00:00'),
    description: 'May 2023 rent',
    paymentMethod: 'Bank Transfer',
    isEssential: true,
    status: TransactionStatus.COMPLETED,
    recurrence: {
      frequency: RecurrenceFrequency.MONTHLY,
      reminderEnabled: true,
    },
  },
  {
    id: '3',
    type: TransactionType.EXPENSE,
    amount: 200,
    category: { name: 'Groceries', type: 'expense' },
    createdAt: new Date('2024-05-01T00:00:00'),
    description: 'Groceries for the week',
    paymentMethod: 'Credit Card',
    location: 'Local Supermarket',
    status: TransactionStatus.COMPLETED,
    isEssential: true,
    tags: ['food', 'essentials'],
  },
];

// State management
const financialState = observable({
  transactions: mockTransactions,
  type: 'income' as TransactionType
});

// Components
const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const getStatusStyle = (status: TransactionStatus) => {
    const baseStyle = 'px-2 py-1 rounded-full';
    switch (status) {
      case TransactionStatus.COMPLETED:
        return `${baseStyle} bg-green-100 dark:bg-green-900`;
      case TransactionStatus.PENDING:
        return `${baseStyle} bg-yellow-100 dark:bg-yellow-900`;
      case TransactionStatus.UPCOMING:
        return `${baseStyle} bg-red-100 dark:bg-red-900`;
      default:
        return `${baseStyle} bg-gray-100 dark:bg-gray-900`;
    }
  };

const getStatusClass = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.COMPLETED:
      return 'text-green-800 dark:text-green-200';
    case TransactionStatus.PENDING:
      return 'text-yellow-800 dark:text-yellow-200';
    case TransactionStatus.UPCOMING:
      return 'text-red-800 dark:text-red-200';
    default:
      return 'text-gray-800 dark:text-gray-200';
  }
};
  return (
    <View className={getStatusStyle(status)}>
      <Text className={`text-[10px] font-medium ${getStatusClass(status)}`}>{status}</Text>
    </View>
  );
};

const TransactionCard = ({ transaction, onDelete }: { transaction: Transaction; onDelete: () => void }) => {
  const deleteGesture = Gesture.Pan()
    .activeOffsetX(-50)
    .onEnd((_, success) => {
      if (success) {
        runOnJS(onDelete)();
      }
    });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <GestureDetector gesture={deleteGesture}>
      <Animated.View
        entering={SlideInRight.springify()}
        exiting={SlideOutLeft}
        layout={LinearTransition.springify()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="font-rmedium text-base text-gray-800 dark:text-gray-200">
                {transaction.description}
              </Text>
              <Text className="text-xs text-gray-500 font-rmedium dark:text-gray-400">{transaction.category.name}</Text>
            </View>
            <Text className={`font-rbold text-lg ${transaction.type === TransactionType.INCOME ? 'text-green-500' : 'text-red-500'}`}>
              {transaction.type === TransactionType.INCOME ? '+' : '-'}${transaction.amount.toLocaleString()}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <StatusBadge status={transaction.status} />
            <View className="flex-row items-center space-x-2">
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {format(transaction.createdAt, 'MMM d, yyyy')}
              </Text>
              {transaction.recurrence && (
                <Ionicons name="repeat" size={16} color={isDark ? "#9CA3AF" : "#4B5563"} />
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const FinanceSummary = ({ totalIncome, totalExpenses, guiltFreeBalance }: { totalIncome: number; totalExpenses: number; guiltFreeBalance: number }) => {
  return (
    <View className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <Text className="text-xl font-rbold text-gray-800 dark:text-gray-100 mb-4">Financial Summary</Text>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Income</Text>
        <Text className="text-sm font-bold text-green-500">${totalIncome.toLocaleString()}</Text>
      </View>
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Expenses</Text>
        <Text className="text-sm font-bold text-red-500">${totalExpenses.toLocaleString()}</Text>
      </View>
      <View className="flex-row justify-between mb-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Guilt-Free Balance</Text>
        <Text className="text-sm font-bold text-blue-500">${guiltFreeBalance.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const FinancePage = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { getTotalIncome, getTotalExpenses, getGuiltFreeBalance }= useFinancialStore();

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses()
  const guiltFreeBalance = getGuiltFreeBalance()

  const handleDeleteTransaction = useCallback((id: string) => {
    financialState.transactions.set(prev => prev.filter(t => t.id !== id));
  }, []);

  const dynamicSuggestion = useComputed(() => {
    const savingsPercentage = (financialState.transactions.get().reduce((sum, transaction) => 
      transaction.type === TransactionType.INCOME ? sum + transaction.amount : sum, 0) / totalIncome) * 100;
    
    if (savingsPercentage < 20) {
      return "Consider increasing your savings to reach the recommended 20% of your income.";
    } else if (totalExpenses > totalIncome) {
      return "Your expenses are exceeding your income. Try to cut back on non-essential spending.";
    } else if (guiltFreeBalance > totalIncome * 0.3) {
      return "Great job managing your finances! You have a healthy guilt-free balance.";
    } else {
      return "You're on track with your financial goals. Keep up the good work!";
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#111827' : '#F9FAFB'}
      />

      <View className="p-4 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100">
              Finance Overview
            </Text>
            <Text className="text-sm text-gray-500 font-rregular dark:text-gray-400">
              Manage your money wisely
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.navigate(`/add-transaction?initialType=${financialState.type.get()}`)}
            className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-rmedium ml-1">Add Transaction</Text>
          </TouchableOpacity>
        </View>

        <FinanceSummary
         guiltFreeBalance={guiltFreeBalance} 
         totalIncome={totalIncome} 
         totalExpenses={totalExpenses} 
        />

        <View className="mt-4 bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <Text className="text-sm text-blue-800 dark:text-blue-200 font-rregular">
            {dynamicSuggestion.get()}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {financialState.transactions.get().length === 0 ? (
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut}
            className="flex-1 items-center justify-center py-12"
          >
            <Ionicons name="wallet-outline" size={48} color={isDark ? "#9CA3AF" : "#6B7280"} />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center font-rregular">
              No transactions recorded yet.{'\n'}Start tracking your finances!
            </Text>
          </Animated.View>
        ) : (
          <Animated.View layout={LinearTransition.springify()}>
            {financialState.transactions.get()
              .sort((a, b) => new Date(`${b.createdAt}`).getTime() - new Date(`${a.createdAt}`).getTime())
              .map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                />
              ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


export default observer(FinancePage);