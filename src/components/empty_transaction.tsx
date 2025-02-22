import { View, Text } from 'react-native';
import { Receipt, PlusCircle, CreditCard, Wallet, DollarSign, XCircle } from 'lucide-react-native';
import { Animated } from 'react-native';
import { useEffect, useState } from 'react';


const EmptyState = ({ type = 'no-transactions', searchQuery = '' }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderNoTransactions = () => (
    <View className="justify-center items-center p-2 my-6">
      <View className="absolute top-0 right-0 w-full h-full">
        <View className="absolute top-10 right-10 opacity-20">
          <CreditCard size={32} className="text-blue-500" />
        </View>
        <View className="absolute bottom-10 left-10 opacity-20">
          <Wallet size={32} className="text-green-500" />
        </View>
        <View className="absolute top-20 left-20 opacity-20">
          <DollarSign size={32} className="text-yellow-500" />
        </View>
      </View>

      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        <View className="mb-8">
          <View className="bg-blue-500/10 rounded-full p-8">
            <View className="bg-blue-500/20 rounded-full p-6">
              <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-4 shadow-lg">
                <Receipt size={48} color="white" strokeWidth={1.5} />
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg w-[320px]">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white text-center mb-3">
            Ready to Track?
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-6 leading-6">
            Start your financial journey by adding your first transaction. Track expenses, monitor income, and stay on top of your finances.
          </Text>

          <View className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4">
            <View className="flex-row items-center">
              <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-2 mr-3">
                <PlusCircle size={20} color="white" strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-rmedium text-blue-600 dark:text-blue-400 mb-1">
                  Quick Start
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-300">
                  Tap the + button to begin your journey
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );

  const renderNoResults = () => (
    <View className="justify-center items-center p-2 my-6">
      <Animated.View style={{ opacity: fadeAnim }} className="items-center">
        <View className="mb-8">
          <View className="bg-orange-500/10 rounded-full p-8">
            <View className="bg-orange-500/20 rounded-full p-6">
              <View className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-full p-4">
                <XCircle size={48} color="white" strokeWidth={1.5} />
              </View>
            </View>
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg w-[320px]">
          <Text className="text-2xl font-rbold text-gray-900 dark:text-white text-center mb-3">
            No Results Found
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-4">
            No transactions match "{searchQuery}"
          </Text>
          <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
            Try adjusting your search or filters
          </Text>
        </View>
      </Animated.View>
    </View>
  );

  return type === 'no-transactions' ? renderNoTransactions() : renderNoResults();
};
export default EmptyState;
