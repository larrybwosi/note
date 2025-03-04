import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, CalendarDays } from 'lucide-react-native';
import { colorScheme } from 'nativewind';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
	FadeInDown,
	FadeInRight,
	LinearTransition,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
import useStore from 'src/store/useStore';
import { getTransactionCategory, getTransactionIcon, getTransactionTitle } from 'src/utils/getCategory';
import { Transaction } from 'src/types/transaction';
import { observer } from '@legendapp/state/react';

interface TransactionItemProps {
	logo: React.ElementType;
	title: string;
	description: string;
	amount: string;
	date?: string;
	color: string;
}
const TransactionItem = ({ logo: Icon, title, description, amount, date, color }: TransactionItemProps) => {
	const scale = useSharedValue(1);

	const handlePressIn = () => {
		scale.value = withSpring(0.98, { damping: 15 });
	};

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 15 });
	};

	return (
		<TouchableOpacity activeOpacity={0.7} onPressIn={handlePressIn} onPressOut={handlePressOut}>
			<Animated.View
				entering={FadeInRight.duration(400).delay(100)}
				className="flex-row items-center justify-between p-4 mb-2 rounded-2xl bg-white/80 dark:bg-gray-800/50 backdrop-blur-lg"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.05,
					shadowRadius: 4,
					elevation: 2,
				}}
			>
				<View className="flex-row items-center flex-1">
					<View className="w-12 h-12 rounded-2xl justify-center items-center bg-white/80 dark:bg-gray-700">
						<Icon size={24} color={color} />
					</View>
					<View className="ml-3 flex-1">
						<Text className="font-rmedium text-gray-800 dark:text-gray-100">{title}</Text>
						<Text className="text-gray-500 text-xs dark:text-gray-400">{description}</Text>
					</View>
				</View>
				<View className="items-end">
					<Text
						className={`font-rmedium text-base ${amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}
					>
						{amount}
					</Text>
					<Text className="text-gray-400 text-xs mt-1 dark:text-gray-500">{date}</Text>
				</View>
			</Animated.View>
		</TouchableOpacity>
	);
};

const NoRecentTransactions = () => (
	<Animated.View entering={FadeInDown.duration(400)} className="items-center justify-center py-6">
		<View className="bg-gray-50/80 dark:bg-gray-800/30 rounded-3xl p-6 items-center backdrop-blur-sm">
			<View className="bg-gray-100 dark:bg-gray-700 rounded-full p-4 mb-4">
				<CalendarDays size={32} className="text-gray-400 dark:text-gray-300" />
			</View>
			<Text className="font-rmedium text-gray-800 dark:text-gray-200 text-lg mb-2">
				No Recent Transactions
			</Text>
			<Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
				Your recent transactions will appear here
			</Text>
		</View>
	</Animated.View>
);

const DateHeader = ({ label }: { label: string }) => (
	<View className="flex-row items-center mb-3 mt-4">
		<View className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
		<Text className="text-gray-600 dark:text-gray-300 font-rmedium mx-3 text-sm">{label}</Text>
		<View className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
	</View>
);

const OperationsCard = (): React.ReactElement => {
	const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
	const isDarkMode = colorScheme.get() === 'dark';
	const gradientColors = isDarkMode ? ['#111827', '#111827'] : ['#f8fafc', '#fff'];

	const { transactions } = useStore();

	const groupTransactionsByTimeframe = (transactions: Transaction[]) => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const oneWeekAgo = new Date(today);
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
		const twoWeeksAgo = new Date(today);
		twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		const groups: Record<string, Transaction[]> = {
			'Today': [],
			'Yesterday': [],
			'This Week': [],
			'Last Week': [],
			'This Month': [],
		};

		transactions.forEach((transaction) => {
			const transactionDate = new Date(transaction.date);

			if (transactionDate >= today) {
				groups['Today'].push(transaction);
			} else if (transactionDate >= yesterday && transactionDate < today) {
				groups['Yesterday'].push(transaction);
			} else if (transactionDate >= oneWeekAgo && transactionDate < yesterday) {
				groups['This Week'].push(transaction);
			} else if (transactionDate >= twoWeeksAgo && transactionDate < oneWeekAgo) {
				groups['Last Week'].push(transaction);
			} else if (transactionDate >= startOfMonth && transactionDate < twoWeeksAgo) {
				groups['This Month'].push(transaction);
			}
		});

		return groups;
	};

	const groupedTransactions = groupTransactionsByTimeframe(transactions);
	const hasRecentTransactions = Object.values(groupedTransactions).some(
		(group) => group?.length > 0
	);

	return (
		<AnimatedLinearGradient
			colors={gradientColors}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			entering={FadeInDown.delay(400).duration(700).springify()}
			layout={LinearTransition.springify()}
			style={{
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 4 },
				shadowOpacity: 0.08,
				shadowRadius: 12,
				elevation: 4,
			}}
			className="w-full rounded-3xl p-4 h-full"
		>
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-lg font-amedium text-gray-800 dark:text-white">
					Recent Transactions
				</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => router.navigate('/transactions')}
					className="flex-row items-center bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full"
				>
					<Text className="text-purple-600 font-rmedium text-sm mr-1 dark:text-purple-300">
						View All
					</Text>
					<ArrowRight size={14} color="#7C3AED" />
				</TouchableOpacity>
			</View>

			{hasRecentTransactions ? (
				Object.entries(groupedTransactions).map(
					([timeframe, transactions]) =>
						transactions?.length > 0 && (
							<View key={timeframe}>
								<DateHeader label={timeframe} />
								{transactions.map((transaction, index) => (
									<TransactionItem
										key={index}
										logo={getTransactionIcon(transaction.categoryId)}
										title={getTransactionTitle(transaction.categoryId)}
										description={transaction.description}
										amount={transaction.amount.toString()}
										date={transaction.date.toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}
										color={getTransactionCategory(transaction.categoryId).color}
									/>
								))}
							</View>
						)
				)
			) : (
				<NoRecentTransactions />
			)}
		</AnimatedLinearGradient>
	);
};

export default observer(OperationsCard);
