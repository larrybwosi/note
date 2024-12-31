import { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  Extrapolation,
  SlideInRight,
  interpolate,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from '@legendapp/state/react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, CreditCard, PieChart } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

import FinanceSummary from 'src/components/finance/summary';
import useFinanceStore from 'src/store/finance/actions';
 
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FinancePage: React.FC = observer(() => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { getTransactions } = useFinanceStore();
  const scrollY = useSharedValue(0);

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCREEN_HEIGHT * 0.2],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: withTiming(opacity, { duration: 300 }),
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT * 0.4,
    };
  });

  const buttonScale = useSharedValue(1);

  const transactions = getTransactions();
  const totalBalance = 30;
  const monthlyIncome = 73;
  const monthlyExpenses = 80;
  // const totalBalance = getTotalBalance();
  // const monthlyIncome = getMonthlyIncome();
  // const monthlyExpenses = getMonthlyExpenses();

  const onPressIn = useCallback(() => {
    buttonScale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
  }, []);

  const onPressOut = useCallback(() => {
    buttonScale.value = withSpring(1, { damping: 20, stiffness: 300 });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });


  const MainFinanceCard = useMemo(() => observer(() => {
    return (
      <Animated.View
        entering={FadeIn.duration(800).delay(400)}
        className="mx-4 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-lg mt-4"
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-rbold text-gray-900 dark:text-gray-100">
              Financial Overview
            </Text>
            <Text className="text-sm font-aregular text-gray-500 dark:text-gray-400 mt-1">
              Track your money flow
            </Text>
          </View>
        </View>

        <View className="space-y-5">
          <View className="bg-blue-50 dark:bg-gray-700/50 p-4 rounded-2xl mb-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View className="bg-blue-500/10 p-2 rounded-xl mr-3">
                  <DollarSign size={24} className="text-blue-500" />
                </View>
                <View>
                  <Text className="text-sm font-amedium text-gray-600 dark:text-gray-400">Total Balance</Text>
                  <Text className="font-rregular text-2xl text-gray-900 dark:text-gray-100">${totalBalance.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between gap-2 space-x-4">
            <View className="flex-1 bg-green-50 dark:bg-gray-700/50 p-4 rounded-2xl">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-500/10 p-2 rounded-xl mr-2">
                  <TrendingUp size={20} className="text-green-500" />
                </View>
                <Text className="font-amedium text-gray-600 dark:text-gray-400">Income</Text>
              </View>
              <Text className="font-rregular text-xl text-green-500">+${monthlyIncome.toFixed(2)}</Text>
              <Text className="font-rregular text-xs text-gray-500 dark:text-gray-400 mt-1">This month</Text>
            </View>

            <View className="flex-1 bg-red-50 dark:bg-gray-700/50 p-4 rounded-2xl">
              <View className="flex-row items-center mb-2">
                <View className="bg-red-500/10 p-2 rounded-xl mr-2">
                  <TrendingDown size={20} className="text-red-500" />
                </View>
                <Text className="font-amedium text-gray-600 dark:text-gray-400">Expenses</Text>
              </View>
              <Text className="font-rregular text-xl text-red-500">-${monthlyExpenses.toFixed(2)}</Text>
              <Text className="font-rregular text-xs text-gray-500 dark:text-gray-400 mt-1">This month</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/transactions')}
            className="bg-blue-500 p-4 rounded-2xl mt-2"
          >
            <Text className="text-white text-center font-rregular">
              View Detailed Transaction History
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }), [totalBalance, monthlyIncome, monthlyExpenses]);

  const RecentTransactions = useMemo(() => observer(() => {
    return (
      <Animated.View
        entering={FadeIn.duration(800).delay(600)}
        className="mx-4 mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5"
      >
        <Text className="text-xl font-amedium text-gray-900 dark:text-gray-100 mb-4">
          Recent Transactions
        </Text>
        {transactions.slice(0, 3).map((transaction, index) => (
          <Animated.View
            key={transaction.id}
            entering={SlideInRight.delay(index * 100)}
            className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-full ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'} items-center justify-center mr-3`}>
                {transaction.type === 'INCOME' ? (
                  <TrendingUp size={20} className="text-green-500" />
                ) : (
                  <TrendingDown size={20} className="text-red-500" />
                )}
              </View>
              <View>
                <Text className="font-medium text-gray-900 dark:text-gray-100">{transaction.description}</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>
              {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </Animated.View>
        ))}
        <TouchableOpacity
          onPress={() => router.push('/transactions')}
          className="mt-4"
        >
          <Text className="text-blue-500 font-bold text-center">See All Transactions</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }), [transactions]);

  const QuickActions = useMemo(() => observer(() => {
    return (
      <Animated.View
        entering={FadeIn.duration(800).delay(800)}
        className="mx-4 mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5"
      >
        <Text className="text-xl font-amedium text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => router.navigate('/create.transactions?type=expense')}
            className="bg-red-100 p-4 rounded-xl items-center justify-center w-[48%]"
          >
            <CreditCard size={24} className="text-red-500 mb-2" />
            <Text className="text-red-500 font-amedium">Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.navigate('/create.transactions?type=income')}
            className="bg-green-100 p-4 rounded-xl items-center justify-center w-[48%]"
          >
            <DollarSign size={24} className="text-green-500 mb-2" />
            <Text className="text-green-500 font-amedium">Add Income</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/budget.planner')}
          className="bg-blue-100 p-4 rounded-xl items-center justify-center mt-4"
        >
          <PieChart size={24} className="text-blue-500 mb-2" />
          <Text className="text-blue-500 font-amedium">Budget Planner</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }), []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 pt-4 mb-8">
      <Animated.View style={gradientStyle}>
        <LinearGradient
          colors={isDark ? ['#1a237e', '#1F2937'] : ['#3b82f6', '#60a5fa']}
          style={{ height: '100%' }}
        />
      </Animated.View>
      
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Animated.Text 
                entering={FadeIn.duration(800)}
                className="text-3xl font-abold text-white"
              >
                Finance Dashboard
              </Animated.Text>
              <Animated.Text 
                entering={FadeIn.duration(800).delay(200)}
                className="text-base font-amedium text-gray-100 opacity-90"
              >
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Animated.Text>
            </View>
            
            <Animated.View style={useAnimatedStyle(() => ({
              transform: [{ scale: buttonScale.value }],
            }))}>
              <TouchableOpacity
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() => router.push('/create.transactions')}
                className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl flex-row items-center shadow-sm"
              >
                <PlusCircle size={20} className="text-blue-500" />
                <Text className="text-blue-500 font-amedium ml-2">New Transaction</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <FinanceSummary />

        <MainFinanceCard />
        <RecentTransactions />
        <QuickActions />
      </Animated.ScrollView>
    </SafeAreaView>
  );
});

export default FinancePage;

