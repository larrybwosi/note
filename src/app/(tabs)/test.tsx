import { View, Text, ScrollView, StatusBar, SafeAreaView } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import BalanceCard from 'src/components/ui/balance';
import OperationsCard from 'src/components/ui/operations';

// Main App Component
export default function BankingApp(): React.ReactElement {
  return (
    <Animated.View layout={LinearTransition.springify()} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View className="px-4 pb-2 mt-4">
        <Text className="text-2xl font-rbold text-gray-800 mt-2">Hello Larry 👋</Text>
        <Text className="text-gray-500">February 16, 2025</Text>
      </View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 32}}
      >
        <View className="px-4 ">
          <BalanceCard />
          <OperationsCard/>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

