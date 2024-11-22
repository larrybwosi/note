import { useCallback, useRef } from 'react';
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
import { PlusCircle } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { router } from 'expo-router';

import TransactionCard from 'src/components/finance/transaction.card';
import useFinancialStore from 'src/store/finance/store';
import EmptyState from 'src/components/finance/empty.state';
import FinanceSummary from 'src/components/finance/summary';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FinancePage: React.FC = observer(() => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { getTransactions } = useFinancialStore();
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
      transform: [{ translateY: withSpring(translateY, { damping: 30, stiffness: 300 }) }],
      opacity: withTiming(opacity, { duration: 300 }),
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 1,
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

  const handleDeleteTransaction = useCallback((id: string) => {
    // Implementation here
  }, []);

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

  const renderTransaction = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View
      entering={SlideInRight.duration(300).delay(index * 50)}
    >
      <TransactionCard
        transaction={item}
        onDelete={() => handleDeleteTransaction(item.id)}
      />
    </Animated.View>
  ), [handleDeleteTransaction]);

  const renderMainContent = useCallback(() => (
    <Animated.FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: SCREEN_HEIGHT * 0.5, marginBottom:20 }}
      ListEmptyComponent={<EmptyState isDark={isDark} />}
      ListHeaderComponent={
        transactions.length > 0 ? (
          <Text className="text-lg my-3 font-rbold text-gray-800 dark:text-gray-100 px-4">
            Transactions
          </Text>
        ) : null
      }
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  ), [transactions, isDark, scrollHandler, renderTransaction]);

  const renders = useRef(0);
  console.log(`Finance: ${++renders.current}`);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
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
              className="text-3xl font-abold text-white"
            >
              Finance
            </Animated.Text>
            <Animated.Text 
              entering={FadeIn.duration(800).delay(200)}
              className="text-base font-aregular text-gray-100 opacity-90"
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Animated.Text>
          </View>
          
          <Animated.View>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={() => router.push('/create.transaction')}
              className="bg-white dark:bg-gray-800 px-4 py-3 rounded-xl flex-row items-center shadow-sm"
            >
              <PlusCircle size={20} className="text-blue-500" />
              <Text className="text-blue-500 font-amedium ml-2">New Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <FinanceSummary />

      </Animated.View>

      <Animated.View>
        {renderMainContent()}
      </Animated.View>
    </SafeAreaView>
  );
});

export default FinancePage;