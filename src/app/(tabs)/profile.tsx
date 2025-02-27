import { View, Text, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	User,
	Bell,
	Moon,
	Shield,
	CreditCard,
	HelpCircle,
	ChevronRight,
	LogOut,
	Camera,
	Globe,
	Wallet,
	Lock,
	Gift,
  Group,
	DollarSign,
	BugPlay,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { colorScheme } from 'nativewind';
import { use$ } from '@legendapp/state/react';
import { profileData$ } from 'src/store/useProfile';

interface SettingItemProps {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	onPress: () => void;
	rightElement?: React.ReactNode;
	destructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
	icon,
	title,
	subtitle,
	onPress,
	rightElement,
	destructive = false,
}) => (
	<TouchableOpacity
		onPress={onPress}
		className="flex-row items-center p-4 bg-white dark:bg-gray-800 rounded-2xl mb-2"
	>
		<View
			className={`w-10 h-10 rounded-xl items-center justify-center ${
				destructive ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-700'
			}`}
		>
			{icon}
		</View>
		<View className="flex-1 ml-3">
			<Text
				className={`font-rmedium ${destructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
			>
				{title}
			</Text>
			{subtitle && <Text className="text-gray-500 dark:text-gray-400 text-sm">{subtitle}</Text>}
		</View>
		{rightElement || <ChevronRight size={20} className="text-gray-400" />}
	</TouchableOpacity>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
	<Text className="text-gray-500 dark:text-gray-400 font-rmedium text-sm mb-2 ml-1">{title}</Text>
);

const ProfileSettings = () => {
	const darkMode = colorScheme.get() === 'dark';
	const userProfile = use$(profileData$);

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView className="flex-1 p-4">
				{/* Profile Header */}
				<Animated.View entering={FadeInDown.duration(400)} className="items-center mb-6">
					<View className="relative">
						<Image source={{ uri: userProfile.imageUrl }} className="w-24 h-24 rounded-full" />
						<TouchableOpacity
							className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full"
							onPress={() => {
								/* Handle photo change */
							}}
						>
							<Camera size={20} color="white" />
						</TouchableOpacity>
					</View>
					<Text className="text-xl font-rbold text-gray-900 dark:text-white mt-4">
						{userProfile.name}
					</Text>
					<Text className="text-gray-500 dark:text-gray-400">{userProfile.email}</Text>
					<View className="bg-purple-100 dark:bg-purple-900/30 px-4 py-1 rounded-full mt-2">
						<Text className="text-purple-600 dark:text-purple-300 font-rmedium">
							{userProfile.plan}
						</Text>
					</View>
				</Animated.View>

				{/* Account Settings */}
				<Animated.View entering={FadeInDown.delay(100).duration(400)} className="mb-6">
					<SectionHeader title="Account" />
					<SettingItem
						icon={<User size={20} className="text-blue-500" />}
						title="Personal Information"
						subtitle="Update your profile details"
						onPress={() => router.push('/profile_update')}
					/>
					<SettingItem
						icon={<Wallet size={20} className="text-green-500" />}
						title="Payment Methods"
						subtitle="Manage your payment options"
						onPress={() => {}}
					/>
					<SettingItem
						icon={<Gift size={20} className="text-purple-500" />}
						title="Subscription Plan"
						subtitle="Manage your subscription"
						onPress={() => router.push('plans')}
					/>
				</Animated.View>

				{/* Preferences */}
				<Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-6">
					<SectionHeader title="Preferences" />
					<SettingItem
						icon={<Moon size={20} className="text-indigo-500" />}
						title="Dark Mode"
						onPress={() => colorScheme.set(darkMode ? 'light' : 'dark')}
						rightElement={
							<Switch
								value={darkMode}
								onValueChange={() => colorScheme.set(darkMode ? 'light' : 'dark')}
								trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
								thumbColor={darkMode ? '#4F46E5' : '#F1F5F9'}
							/>
						}
					/>
					<SettingItem
						icon={<Bell size={20} className="text-yellow-500" />}
						title="Notifications"
						onPress={() => router.push('/settings?type=notifications')}
					/>
					<SettingItem
						icon={<Globe size={20} className="text-cyan-500" />}
						title="Language"
						subtitle="English (US)"
						onPress={() => {}}
					/>
					<SettingItem
						icon={<DollarSign size={20} className="text-cyan-500" />}
						title="Currency"
						subtitle="USD"
						onPress={() => router.push('/settings?type=currency')}
					/>
					<SettingItem
						icon={<Group size={20} className="text-cyan-500" />}
						title="Categories"
						subtitle="Manage your spending and income categories"
						onPress={() => router.push('/categories')}
					/>
					<SettingItem
						icon={<BugPlay size={20} className="text-cyan-500" />}
						title="Budget Management"
						subtitle="Manage your budgets"
						onPress={() => router.push('/budget.planner')}
					/>
				</Animated.View>

				{/* Security */}
				<Animated.View entering={FadeInDown.delay(300).duration(400)} className="mb-6">
					<SectionHeader title="Security" />
					<SettingItem
						icon={<Lock size={20} className="text-orange-500" />}
						title="Change Password"
						onPress={() => router.push('/settings?type=security')}
					/>
					<SettingItem
						icon={<Shield size={20} className="text-teal-500" />}
						title="Two-Factor Authentication"
						subtitle="Add extra security to your account"
						onPress={() => router.push('/settings?type=security')}
					/>
				</Animated.View>

				{/* Support */}
				<Animated.View entering={FadeInDown.delay(400).duration(400)} className="mb-6">
					<SectionHeader title="Support" />
					<SettingItem
						icon={<HelpCircle size={20} className="text-blue-500" />}
						title="Help & Support"
						subtitle="Get help with your account"
						onPress={() => {}}
					/>
				</Animated.View>

				{/* Logout */}
				<Animated.View entering={FadeInDown.delay(500).duration(400)}>
					<SettingItem
						icon={<LogOut size={20} className="text-red-500" />}
						title="Log Out"
						onPress={() => {}}
						destructive
					/>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default ProfileSettings;
