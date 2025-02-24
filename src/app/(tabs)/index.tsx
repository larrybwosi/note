import { use$ } from '@legendapp/state/react';
import { Bell } from 'lucide-react-native';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import BalanceCard from 'src/components/ui/balance';
import OperationsCard from 'src/components/ui/operations';
import { profileData$ } from 'src/store/useProfile';

// Main App Component
export default function BankingApp(): React.ReactElement {
  return (
		<Animated.View
			layout={LinearTransition.springify()}
			className="flex-1 bg-gray-50 dark:bg-gray-900"
		>
			<StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" hidden={true} />
			<View className=" flex justify-between flex-row px-4 py-4 bg-white dark:bg-gray-800 items-center">
				<View className="px-4 pb-2 mt-4">
					<Text className="text-2xl font-rbold text-gray-800 mt-2 dark:text-white">
						Hello {use$(profileData$.name)} 👋
					</Text>
					<Text className="text-gray-500 dark:text-gray-400">Welcome back!</Text>
				</View>
				<Bell className="mt-6" color="gray" size={24} />
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 32 }}
			>
				<View className="px-4 ">
					<BalanceCard />
					<OperationsCard />
				</View>
			</ScrollView>
		</Animated.View>
	);
}

