import { View, Text } from 'react-native';
import { Receipt, PlusCircle, CreditCard, Wallet, DollarSign } from 'lucide-react-native';

const EmptyTransactions = () => {
  return (
    <View className=" justify-center items-center p-2 my-6">
      {/* Decorative Background Elements */}
      <View className="absolute top-10 right-10 opacity-20">
        <CreditCard size={32} className="text-blue-500 dark:text-blue-400" />
      </View>
      <View className="absolute bottom-10 left-10 opacity-20">
        <Wallet size={32} className="text-green-500 dark:text-green-400" />
      </View>
      <View className="absolute top-20 left-20 opacity-20">
        <DollarSign size={32} className="text-yellow-500 dark:text-yellow-400" />
      </View>

      {/* Main Icon Container with enhanced styling */}
      <View className="mb-8">
        <View className="bg-blue-500/10 dark:bg-blue-400/10 rounded-full p-8">
          <View className="bg-blue-500/20 dark:bg-blue-400/20 rounded-full p-6">
            <View className="bg-blue-500 dark:bg-blue-400 rounded-full p-4">
              <Receipt size={48} color="white" strokeWidth={1.5} />
            </View>
          </View>
        </View>
      </View>

      {/* Enhanced Text Content */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm w-[300px]">
        <Text className="text-2xl font-rbold text-gray-900 dark:text-white text-center mb-3">
          No Transactions Yet
        </Text>
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-6 leading-6">
          Ready to take control of your finances? Start by adding your first transaction to begin
          tracking your money flow.
        </Text>

        {/* Enhanced Getting Started Hint */}
        <View className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex-row items-center">
          <View className="bg-blue-500 rounded-full p-2 mr-3">
            <PlusCircle size={20} color="white" strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-rmedium text-blue-600 dark:text-blue-400 mb-1">
              Quick Start
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-300">
              Tap the + button to record your first transaction
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EmptyTransactions;
