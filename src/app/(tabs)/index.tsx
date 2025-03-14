import { use$ } from '@legendapp/state/react';
import { Bell } from 'lucide-react-native';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BudgetQuickLinks from 'src/components/quick-links';
import BalanceCard from 'src/components/ui/balance';
import OperationsCard from 'src/components/ui/operations';
import { profileData$ } from 'src/store/useProfile';
import useStore from 'src/store/useStore';

// Main App Component
export default function Home() {
	const { transactions } = useStore();
  return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<StatusBar barStyle="dark-content" backgroundColor="#18181b" hidden={true} />
			<View className=" flex justify-between flex-row px-4 py-4 bg-white dark:bg-zinc-900 items-center">
				<View className="px-2 pb-2 mt-2">
					<Text className="text-2xl font-rbold text-gray-800 mt-2 dark:text-white">
						Hello {use$(profileData$.name).split(' ')[0]} 👋
					</Text>
					<Text className="text-gray-500 dark:text-gray-400 font-aregular">Welcome back!</Text>
				</View>
				<Bell className="mt-6" color="gray" size={24} />
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 32 }}
			>
				<BalanceCard />
				<View className="px-4 ">
					{transactions.length === 0 ? <BudgetQuickLinks/> : <OperationsCard />}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

