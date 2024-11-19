import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
  SlideInRight,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Lightbulb, PlusCircle } from 'lucide-react-native';
import { observer, useComputed } from '@legendapp/state/react';
import { LinearGradient } from 'expo-linear-gradient';
import { colorScheme } from 'nativewind';
import { router } from 'expo-router';

import TransactionCard from 'src/components/finance/transaction.card';
import { TransactionType } from 'src/store/finance/types';
import useFinancialStore from 'src/store/finance/store';
import { useRef } from 'react';
import EmptyState from 'src/components/finance/empty.state';
import FinanceSummary from 'src/components/finance/summary';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);


const SuggestionCard = observer(({ suggestion }: { suggestion: string }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 150 }),
      withSpring(1)
    );
  };

  return (
    <TouchableOpacity onPressIn={onPressIn} activeOpacity={0.9}>
      <Animated.View 
        entering={FadeIn.duration(800).delay(700)}
        style={animatedStyle}
        className="mt-4 bg-white/10 backdrop-blur-lg p-4 rounded-xl"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-amber-300 dark:bg-amber-900 rounded-full items-center justify-center mr-3">
            <Lightbulb size={20} color={colorScheme.get() === 'dark' ? '#FBBF24' : '#D97706'} />
          </View>
          <View className="flex-1">
            <Text className="dark:text-white font-rmedium mb-1">Financial Insight</Text>
            <Text className="dark:text-gray-200 text-sm font-rregular">
              {suggestion}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FinancePage = observer(() => {
  const isDark = colorScheme.get() === 'dark';
  const { getTotalIncome, getTotalExpenses, getGuiltFreeBalance, getTransactions } = useFinancialStore();
  const scrollY = useSharedValue(0);

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCREEN_HEIGHT * 0.3],
      [0, -SCREEN_HEIGHT * 0.3],
      Extrapolation.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [0, SCREEN_HEIGHT * 0.2],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ 
        translateY: withSpring(translateY, {
          damping: 30,
          stiffness: 300,
          mass: 0.5,
        }) 
      }],
      opacity: withTiming(opacity, {
        duration: 300,
        // easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCREEN_HEIGHT * 0.3],
      [0, -SCREEN_HEIGHT * 0.3],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ 
        translateY: withSpring(translateY, {
          damping: 30,
          stiffness: 300,
          mass: 0.5,
        }) 
      }],
      flex: 1,
    };
  });

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCREEN_HEIGHT * 0.2],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: withTiming(opacity, {
        duration: 300,
        // easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT * 0.4,
    };
  });

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ 
      scale: withSpring(buttonScale.value, {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      }) 
    }],
  }));

  const guiltFreeBalance = getGuiltFreeBalance();
  const totalExpenses = getTotalExpenses();
  const transactions = getTransactions();
  const totalIncome = getTotalIncome();

  const handleDeleteTransaction = (id: string) => {
    // Implementation here
  };

  const dynamicSuggestion = useComputed(() => {
    const savingsPercentage = (transactions.reduce((sum, transaction) => 
      transaction.type === TransactionType.INCOME ? sum + transaction.amount : sum, 0) / totalIncome) * 100;
    
    if (savingsPercentage < 20) {
      return "💡 Consider the 50/30/20 rule - 50% for needs, 30% for wants, and 20% for savings to build a stronger financial foundation.";
    } else if (totalExpenses > totalIncome) {
      return "⚠️ Your expenses are exceeding income. Let's review your spending patterns and find areas to optimize.";
    } else if (guiltFreeBalance > totalIncome * 0.3) {
      return "🎯 Great financial health! Consider exploring investment opportunities for long-term growth.";
    } else {
      return "✨ You're maintaining a good financial balance. Keep building your emergency fund!";
    }
  });

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    });
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    });
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });


  const mainContent = () => (
    <Animated.ScrollView 
      className="flex-1 mt-4"
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: SCREEN_HEIGHT * 0.6, paddingBottom: 20 }}
    >
      {!transactions.length ? (
        <EmptyState isDark={isDark} />
      ) : (
        <Animated.View 
          layout={LinearTransition
            .springify()
            .mass(0.5)
            .damping(30)
            .stiffness(300)} 
          className="px-4 space-y-3"
        >
          <Text className="text-lg my-3 font-abold text-gray-800 dark:text-gray-100">Transactions</Text>
          {transactions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((transaction, index) => (
              <Animated.View
                key={transaction.id}
                entering={SlideInRight
                  .duration(300)
                  .delay(index * 50)}
              >
                <TransactionCard
                  transaction={transaction}
                  onDelete={() => handleDeleteTransaction(transaction.id)}
                />
              </Animated.View>
            ))}
        </Animated.View>
      )}
    </Animated.ScrollView> 
  );

  const renders = ++useRef(0).current;
  console.log(`Finance: ${renders}`);

  return (
    <AnimatedSafeAreaView layout={LinearTransition.springify()} className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Animated.View style={gradientStyle}>
        <LinearGradient
          colors={isDark ? ['#1a237e', '#1F2937'] : ['#3b82f6', '#60a5fa']}
          style={{ height: '100%' }}
        />
      </Animated.View>
      
      <Animated.View style={headerStyle} className="p-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Animated.Text 
              entering={FadeIn.duration(800)}
              className="text-3xl font-rbold text-white"
            >
              Finance
            </Animated.Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(200)}
              className="text-base text-gray-100 font-rregular opacity-90"
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Animated.Text>
          </View>
          
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => router.navigate(`/create.transaction`)}
              className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl flex-row items-center shadow-sm"
            >
              <PlusCircle size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
              <Text className="text-blue-500 font-rmedium ml-2">New Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <FinanceSummary
          guiltFreeBalance={guiltFreeBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          style={{}}
        />

        <SuggestionCard suggestion={dynamicSuggestion.get()} />
      </Animated.View>

      <Animated.View style={contentStyle}>
        {mainContent()}
      </Animated.View>
    </AnimatedSafeAreaView>
  );
});

export default FinancePage;