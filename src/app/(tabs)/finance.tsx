import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { observer, useComputed } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import { observable } from '@legendapp/state';
import { colorScheme } from 'nativewind';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import TransactionCard from 'src/components/finance/transaction.card';
import { TransactionType } from 'src/store/finance/types';
import useFinancialStore from 'src/store/finance/store';


const financialState = observable({
  transactions: [],
  type: 'income' as TransactionType
});

const FinanceSummary = observer(({ 
  totalIncome, 
  totalExpenses, 
  guiltFreeBalance 
}: { 
  totalIncome: number; 
  totalExpenses: number; 
  guiltFreeBalance: number;
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.98);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(800).delay(300)}
      style={animatedStyle}
      className="mt-4 rounded-2xl overflow-hidden shadow-lg"
    >
      <LinearGradient
        colors={colorScheme.get() === 'dark' 
          ? ['#1F2937', '#111827']
          : ['#ffffff', '#f9fafb']}
        className="p-5"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-xl font-rbold text-gray-800 dark:text-gray-100 mb-4">
          Financial Summary
        </Text>
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Income</Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(400)}
              className="text-lg font-bold text-green-500"
            >
              ${totalIncome.toLocaleString()}
            </Animated.Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Expenses</Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(500)}
              className="text-lg font-bold text-rose-400"
            >
              ${totalExpenses.toLocaleString()}
            </Animated.Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Guilt-Free Balance</Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(600)}
              className="text-lg font-bold text-blue-500"
            >
              ${guiltFreeBalance.toLocaleString()}
            </Animated.Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

const FinancePage = observer(() => {
  const isDark = colorScheme.get() === 'dark';
  const { getTotalIncome, getTotalExpenses, getGuiltFreeBalance, getTransactions } = useFinancialStore();
  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.9],
      Extrapolation.CLAMP
    ),
  }));

  const guiltFreeBalance = getGuiltFreeBalance();
  const totalExpenses = getTotalExpenses();
  const transactions = getTransactions()
  const totalIncome = getTotalIncome();


  const handleDeleteTransaction = useCallback((id: string) => {
    // financialState.transactions.set(prev => prev.filter(t => t.id !== id));
  }, []);

  const dynamicSuggestion = useComputed(() => {
    const savingsPercentage = (transactions.reduce((sum, transaction) => 
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

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  return (
    <SafeAreaView className="flex-1 dark:bg-gray-900 mb-6">
      <LinearGradient
        colors={isDark 
          ? ['#1a237e', '#1F2937']
          : ['#3b82f6', '#60a5fa']}
        className="absolute top-0 left-0 right-0 h-64"
      />
      
      <Animated.View 
        style={headerStyle} 
        className="p-4"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Animated.Text 
              entering={FadeIn.duration(800)}
              className="text-2xl font-rbold dark:text-white"
            >
              Finance Overview
            </Animated.Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(200)}
              className="text-sm dark:text-gray-100 font-rregular"
            >
              Manage your money wisely
            </Animated.Text>
          </View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => router.navigate(`/ai.transaction?initialType=${financialState.type.get()}`)}
              className="bg-blue-500 backdrop-blur-lg px-4 py-2 rounded-xl flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="dark:text-white font-rmedium ml-1">Add Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <FinanceSummary
          guiltFreeBalance={guiltFreeBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        <Animated.View 
          entering={FadeIn.duration(800).delay(700)}
          className="mt-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl"
        >
          <Text className="text-sm dark:text-white font-rregular">
            {dynamicSuggestion.get()}
          </Text>
        </Animated.View>
      </Animated.View>

      <ScrollView 
        className="flex-1 px-4 pt-2"
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {transactions.length === 0 ? (
          <Animated.View 
            entering={FadeIn.duration(800)} 
            exiting={FadeOut}
            className="flex-1 items-center justify-center py-12"
          >
            <Ionicons 
              name="wallet-outline" 
              size={48} 
              color={isDark ? "#9CA3AF" : "#6B7280"} 
            />
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center font-rregular">
              No transactions recorded yet.{'\n'}Start tracking your finances!
            </Text>
          </Animated.View>
        ) : (
          <Animated.View 
            layout={LinearTransition.springify()} 
            className="my-4 mb-3 space-y-3"
          >
            {transactions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((transaction, index) => (
                <Animated.View
                  key={transaction.id}
                  entering={FadeIn.duration(800).delay(index * 100)}
                >
                  <TransactionCard
                    transaction={transaction}
                    onDelete={() => handleDeleteTransaction(transaction.id)}
                  />
                </Animated.View>
              ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

export default FinancePage;