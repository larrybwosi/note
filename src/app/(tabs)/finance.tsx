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
  Extrapolation,
  SlideInRight
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

  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);

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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-rbold text-gray-800 dark:text-gray-100">
            Financial Summary
          </Text>
          <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            <Text className="text-blue-600 dark:text-blue-200 font-rmedium text-sm">
              {savingsRate}% Savings
            </Text>
          </View>
        </View>
        
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mr-2">
                <Ionicons name="arrow-up" size={18} color={colorScheme.get() === 'dark' ? '#34D399' : '#10B981'} />
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Income</Text>
            </View>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(400)}
              className="text-lg font-bold text-green-500"
            >
              ${totalIncome.toLocaleString()}
            </Animated.Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-rose-100 dark:bg-rose-900 rounded-full items-center justify-center mr-2">
                <Ionicons name="arrow-down" size={18} color={colorScheme.get() === 'dark' ? '#FB7185' : '#F43F5E'} />
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Total Expenses</Text>
            </View>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(500)}
              className="text-lg font-bold text-rose-400"
            >
              ${totalExpenses.toLocaleString()}
            </Animated.Text>
          </View>
          
          <View className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mr-2">
                <Ionicons name="wallet" size={18} color={colorScheme.get() === 'dark' ? '#60A5FA' : '#3B82F6'} />
              </View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 font-rregular">Guilt-Free Balance</Text>
            </View>
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

const SuggestionCard = observer(({ suggestion }: { suggestion: string }) => (
  <Animated.View 
    entering={FadeIn.duration(800).delay(700)}
    className="mt-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl"
  >
    <View className="flex-row items-center">
      <View className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full items-center justify-center mr-3">
        <Ionicons name="bulb" size={18} color={colorScheme.get() === 'dark' ? '#FBBF24' : '#D97706'} />
      </View>
      <Text className="flex-1 text-sm dark:text-white font-rregular">
        {suggestion}
      </Text>
    </View>
  </Animated.View>
));

const EmptyState = ({ isDark }: { isDark: boolean }) => (
  <Animated.View 
    entering={FadeIn.duration(800)} 
    exiting={FadeOut}
    className="flex-1 items-center justify-center py-12"
  >
    <View className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
      <Ionicons 
        name="wallet-outline" 
        size={48} 
        color={isDark ? "#9CA3AF" : "#6B7280"} 
      />
    </View>
    <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center font-rregular text-base">
      No transactions recorded yet
    </Text>
    <Text className="text-gray-400 dark:text-gray-500 mt-2 text-center font-rregular text-sm">
      Start tracking your finances by adding your first transaction
    </Text>
  </Animated.View>
);

const FinancePage = observer(() => {
  const isDark = colorScheme.get() === 'dark';
  const { getTotalIncome, getTotalExpenses, getGuiltFreeBalance, getTransactions,  } = useFinancialStore();
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
  const transactions = getTransactions();
  const totalIncome = getTotalIncome();


  const handleDeleteTransaction = useCallback((id: string) => {
    // Implementation here
  }, []);

  const dynamicSuggestion = useComputed(() => {
    const savingsPercentage = (transactions.reduce((sum, transaction) => 
      transaction.type === TransactionType.INCOME ? sum + transaction.amount : sum, 0) / totalIncome) * 100;
    
    if (savingsPercentage < 20) {
      return "💡 Tip: Try to save at least 20% of your income. Consider using the 50/30/20 rule - 50% for needs, 30% for wants, and 20% for savings.";
    } else if (totalExpenses > totalIncome) {
      return "⚠️ Alert: Your expenses are exceeding your income. Review your recent transactions and identify areas where you can reduce spending.";
    } else if (guiltFreeBalance > totalIncome * 0.3) {
      return "🎯 Great work! You're maintaining a healthy financial buffer. Consider investing some of your guilt-free balance for long-term growth.";
    } else {
      return "✨ You're on track! Keep maintaining a good balance between spending and saving while building your emergency fund.";
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
    <SafeAreaView className="flex-1 dark:bg-gray-900">
      <LinearGradient
        colors={isDark 
          ? ['#1a237e', '#1F2937']
          : ['#3b82f6', '#60a5fa']}
        className="absolute top-0 left-0 right-0 h-72"
      />
      
      <Animated.View 
        style={headerStyle} 
        className="p-4"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Animated.Text 
              entering={FadeIn.duration(800)}
              className="text-2xl font-rbold text-white"
            >
              Finance Overview
            </Animated.Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(200)}
              className="text-sm text-gray-100 font-rregular opacity-90"
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Animated.Text>
          </View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => router.navigate(`/ai.transaction?initialType=${financialState.type.get()}`)}
              className="bg-white/20 backdrop-blur-lg px-4 py-3 rounded-xl flex-row items-center"
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text className="text-white font-rmedium ml-2">Add Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <FinanceSummary
          guiltFreeBalance={guiltFreeBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />

        <SuggestionCard suggestion={dynamicSuggestion.get()} />
      </Animated.View>

      <ScrollView 
        className="flex-1 px-4 pt-2"
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {transactions.length === 0 ? (
          <EmptyState isDark={isDark} />
        ) : (
          <Animated.View 
            layout={LinearTransition.springify()} 
            className="my-4 mb-20 space-y-3"
          >
            {transactions
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((transaction, index) => (
                <Animated.View
                  key={transaction.id}
                  entering={SlideInRight.duration(400).delay(index * 100)}
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