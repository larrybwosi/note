import Animated, { FadeInDown, LinearTransition, useSharedValue, withSpring } from "react-native-reanimated";
import { BadgeDollarSignIcon, PlusCircle } from 'lucide-react-native';
import { TouchableOpacity, Text, View } from 'react-native';
import { observer } from '@legendapp/state/react';
import { router } from 'expo-router';

import useStore from "src/store/useStore";
import { formatCurrency } from "src/utils/currency";

function BalanceCard () {
  const scale = useSharedValue(0.98);
  const { getBalance, getTotalSpent, getRemainingBudget, getActiveBudgetSpending } = useStore();
	const {
		budget: { amount: spendingLimit },
		percentUsed
	} = getActiveBudgetSpending()!;

  const balance = getBalance()
	const totalSpent = getTotalSpent()
	const remaining = getRemainingBudget();
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };
  
  return (
		<Animated.View
			entering={FadeInDown.duration(700).springify()}
			layout={LinearTransition.springify()}
			style={[
				{
					shadowColor: '#000',
					shadowOffset: {
						width: 0,
						height: 4,
					},
					shadowOpacity: 0.08,
					shadowRadius: 12,
					elevation: 4,
				},
			]}
			className="w-full bg-amber-100 rounded-3xl p-5 mb-4"
		>
			<Text className="text-gray-500 text-sm mb-1 font-rregular">Available Balance</Text>
			<Text className="text-4xl font-amedium mb-4 text-gray-800">{formatCurrency(balance)}</Text>

			<View className="mb-2">
				<View className="flex-row justify-between items-center mb-1">
					<Text className="text-gray-500 text-sm font-amedium">Spending Limit</Text>
					<Text className="text-gray-800 font-semibold">{formatCurrency(spendingLimit!)}</Text>
				</View>
				<View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
					<View className="h-2 bg-black rounded-full w-3/4" />
				</View>
			</View>

			<Text className="text-gray-500 text-sm my-3 font-rmedium">
				Spent {formatCurrency(totalSpent)}
			</Text>

			<View className="flex-row justify-between mt-3">
				<TouchableOpacity
					className="bg-black rounded-xl py-3.5 px-6 flex-1 mr-2 items-center flex-row justify-center"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={0.8}
					onPress={() => router.navigate('create.transactions?type=expense')}
				>
					<Text className="text-white font-amedium mr-1">Pay</Text>
					<BadgeDollarSignIcon size={16} color="white" />
				</TouchableOpacity>

				<TouchableOpacity
					className="bg-black rounded-xl py-3.5 px-6 flex-1 ml-2 items-center flex-row justify-center"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={0.8}
					onPress={() => router.navigate('create.transactions?type=income')}
				>
					<Text className="text-white font-amedium mr-1">Deposit</Text>
					<PlusCircle size={16} color="white" />
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
};
export default observer(BalanceCard)