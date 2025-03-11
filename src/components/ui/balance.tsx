import Animated, {
	FadeInDown,
	LinearTransition,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import { BadgeDollarSignIcon, PlusCircle } from 'lucide-react-native';
import { TouchableOpacity, Text, View, DimensionValue } from 'react-native';
import { observer } from '@legendapp/state/react';
import { router } from 'expo-router';

import useStore from 'src/store/useStore';
import { formatCurrency } from 'src/utils/currency';
import { useFeedbackModal } from './feedback';
import { TransactionType } from 'src/types/transaction';

function BalanceCard() {
	const scale = useSharedValue(0.98);
	const { getBalance, getTotalSpent, getRemainingBudget, getActiveBudgetSpending } = useStore();
		const { showModal, hideModal } = useFeedbackModal();
	// const {
	// 	budget: { amount: spendingLimit },
	// 	percentUsed,
	// } = getActiveBudgetSpending()!;

	const currentBudget = getActiveBudgetSpending()
	const spendingLimit = currentBudget?.budget?.amount;
	const percentUsed = currentBudget?.percentUsed || 0;

	const balance = getBalance();
	const totalSpent = getTotalSpent();
	const remaining = getRemainingBudget();

	const handlePressIn = () => {
		scale.value = withSpring(0.98, { damping: 10 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 10 });
	};

	const handlePress = (type: TransactionType) => {
		if(!currentBudget) {
			showModal({
				type: 'info',
				title: 'No Budget Selected',
				message: 'Please select a budget before adding an item.',
				primaryButtonText: 'OK',
				secondaryButtonText: 'Cancel',
				onPrimaryAction: () => router.push('/create-edit-budget'),
				onSecondaryAction: () => hideModal(),
			});
			return
		}
		router.navigate(`create.transactions?type=${type}`);
	};

	// Calculate progress width based on percentUsed
	const progressWidth = `${Math.min(percentUsed, 100)}%`;

	// Determine progress bar color based on percentage
	const getProgressColor = () => {
		if (percentUsed >= 90) return 'bg-red-500';
		if (percentUsed >= 75) return 'bg-orange-500';
		return 'bg-black';
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
			className="w-full bg-amber-100 rounded-3xl p-5 mb-4 mx-2"
		>
			<Text className="text-gray-500 text-sm mb-1 font-rregular">Available Balance</Text>
			<Text className="text-4xl font-amedium mb-4 text-gray-800">{formatCurrency(balance)}</Text>

			<View className="mb-2">
				<View className="flex-row justify-between items-center mb-1">
					<Text className="text-gray-500 text-sm font-amedium">Spending Limit</Text>
					<Text className="text-gray-800 font-semibold">{formatCurrency(spendingLimit || 0)}</Text>
				</View>
				<View className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
					<View
						className={`h-2 ${getProgressColor()} rounded-full`}
						style={{ width: progressWidth as DimensionValue }}
					/>
				</View>
			</View>

			<View className="flex-row justify-between items-center my-3">
				<Text className="text-gray-500 text-sm font-rmedium">
					Spent {formatCurrency(totalSpent)}
				</Text>
				<Text className="text-gray-500 text-sm font-rmedium">{percentUsed?.toFixed(0)}% used</Text>
			</View>

			<View className="flex-row justify-between mt-3">
				<TouchableOpacity
					className="bg-black rounded-xl py-3 px-6 flex-1 mr-2 items-center flex-row justify-center"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={0.8}
					onPress={() => handlePress('expense')}
				>
					<Text className="text-white font-amedium mr-1">Pay</Text>
					<BadgeDollarSignIcon size={16} color="white" />
				</TouchableOpacity>

				<TouchableOpacity
					className="bg-black rounded-xl py-3 px-6 flex-1 ml-2 items-center flex-row justify-center"
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					activeOpacity={0.8}
					onPress={() => handlePress('income')}
				>
					<Text className="text-white font-amedium mr-1">Deposit</Text>
					<PlusCircle size={16} color="white" />
				</TouchableOpacity>
			</View>
		</Animated.View>
	);
}

export default observer(BalanceCard);
