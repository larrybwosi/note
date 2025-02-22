import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, BusFront, Coffee, ShoppingCart, Video, Calendar } from 'lucide-react-native';
import { colorScheme } from 'nativewind';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
	FadeInDown,
	FadeInRight,
	LinearTransition,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';

// Custom Icons with different colors
const CustomShoppingCart = () => <ShoppingCart size={24} color="#FF5252" />;
const CustomBusFront = () => <BusFront size={24} color="#3F7AFF" />;
const CustomVideo = () => <Video size={24} color="#7B68EE" />;
const CustomCoffee = () => <Coffee size={24} color="#FFB800" />;

type TransactionItemProps = {
	logo: React.ReactElement;
	company: string;
	description: string;
	amount: string;
	date: string;
};

const TransactionItem = ({
	logo,
	company,
	description,
	amount,
	date,
}: TransactionItemProps): React.ReactElement => {
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
				className="flex-row items-center justify-between p-4 mb-2 rounded-2xl bg-white dark:bg-gray-700/50"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.05,
					shadowRadius: 4,
					elevation: 2,
				}}
			>
				<View className="flex-row items-center flex-1">
					<View
						className="w-12 h-12 rounded-2xl justify-center items-center overflow-hidden bg-gray-50 dark:bg-gray-600"
						style={{
							shadowColor: '#000',
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.1,
							shadowRadius: 4,
							elevation: 2,
						}}
					>
						{logo}
					</View>
					<View className="ml-3 flex-1">
						<Text className="font-rmedium text-gray-800 dark:text-gray-100">{company}</Text>
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

const NoRecentTransactions = () => {
	return (
		<Animated.View entering={FadeInDown.duration(400)} className="items-center justify-center py-6">
			<View className="bg-gray-50 dark:bg-gray-700/30 rounded-3xl p-6 items-center">
				<View className="bg-gray-100 dark:bg-gray-600 rounded-full p-4 mb-4">
					<Calendar size={32} className="text-gray-400 dark:text-gray-300" />
				</View>
				<Text className="font-rmedium text-gray-800 dark:text-gray-200 text-lg mb-2">
					No Recent Transactions
				</Text>
				<Text className="text-gray-500 dark:text-gray-400 text-center text-sm">
					Transactions older than a week will appear in your history
				</Text>
			</View>
		</Animated.View>
	);
};

const DateHeader = ({ date }: { date: string }) => (
	<View className="flex-row items-center mb-3 mt-1">
		<View className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
		<Text className="text-gray-500 dark:text-gray-400 font-rmedium mx-3">{date}</Text>
		<View className="h-[1px] flex-1 bg-gray-200 dark:bg-gray-700" />
	</View>
);

const OperationsCard = (): React.ReactElement => {
	const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
	const isDarkMode = colorScheme.get() === 'dark';
	const gradientColors = isDarkMode ? ['#1A202C', '#2D3748'] : ['#fffbeb', '#fff'];

	// Sample transactions with proper dates
	const transactions = [
		{
			logo: <CustomShoppingCart />,
			company: 'Groceries',
			description: 'Restocked the fridge',
			amount: '-$34.99',
			date: 'Today',
			timestamp: new Date(),
		},
		{
			logo: <CustomBusFront />,
			company: 'Transport',
			description: 'Morning bus to work',
			amount: '-$59.99',
			date: 'Today',
			timestamp: new Date(),
		},
		{
			logo: <CustomVideo />,
			company: 'Blizzard Entertainment',
			description: '6-Month Subscription',
			amount: '-$79.89',
			date: 'Yesterday',
			timestamp: new Date(Date.now() - 86400000),
		},
		{
			logo: <CustomCoffee />,
			company: 'Breakfast',
			description: 'Breakfast with Larry',
			amount: '-$7.99',
			date: 'This Week',
			timestamp: new Date(Date.now() - 86400000 * 3),
		},
	];

	// Group transactions by date 
	const groupedTransactions = transactions.reduce(
		(groups, transaction) => {
			const { date } = transaction;
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(transaction);
			return groups;
		},
		{} as Record<string, typeof transactions>
	);

	// Check if we have recent transactions (within a week)
	const hasRecentTransactions = transactions.some(
		(t) => t.timestamp > new Date(Date.now() - 86400000 * 7)
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
			className="w-full rounded-3xl p-4 mb-4"
		>
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-lg font-amedium text-gray-800 dark:text-white">Operations</Text>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => router.navigate('/transactions')}
					className="flex-row items-center bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full"
				>
					<Text className="text-purple-600 font-rregular text-sm mr-1 dark:text-purple-300">
						View All
					</Text>
					<ArrowRight size={14} color="#7C3AED" />
				</TouchableOpacity>
			</View>

			{hasRecentTransactions ? (
				Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
					<View key={date}>
						<DateHeader date={date} />
						{dateTransactions.map((transaction, index) => (
							<TransactionItem
								key={index}
								logo={transaction.logo}
								company={transaction.company}
								description={transaction.description}
								amount={transaction.amount}
								date={transaction.date}
							/>
						))}
					</View>
				))
			) : (
				<NoRecentTransactions />
			)}
		</AnimatedLinearGradient>
	);
};

export default OperationsCard;
