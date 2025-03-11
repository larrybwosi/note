import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import {
	Bell,
	Mail,
	DollarSign,
	Users,
	Gift,
	AlertTriangle,
	ChevronRight,
	Info,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define notification channel types
interface NotificationChannel {
	id: string;
	name: string;
	description: string;
	icon: any; // LucideIcon type
	enabled: boolean;
}

interface NotificationsSettingsProps {
	onChannelToggle?: (channelId: string, enabled: boolean) => Promise<boolean>;
	initialChannels?: NotificationChannel[];
}

const NotificationsSettings = ({
}: NotificationsSettingsProps) => {
  
	const onChannelToggle = async (channelId: string, enabled: boolean) => {
    // Mock API request to toggle notification channel
    return true;
  }
	// const initialChannels = [];	// Default notification channels if not provided
	const defaultChannels: NotificationChannel[] = [
		{
			id: 'email',
			name: 'Email Notifications',
			description: 'Receive notifications via email',
			icon: Mail,
			enabled: true,
		},
		{
			id: 'push',
			name: 'Push Notifications',
			description: 'Receive push notifications on your device',
			icon: Bell,
			enabled: true,
		},
		{
			id: 'payments',
			name: 'Payment Notifications',
			description: 'Notifications about payments and transactions',
			icon: DollarSign,
			enabled: true,
		},
		{
			id: 'social',
			name: 'Social Activity',
			description: 'Notifications about likes, comments, and follows',
			icon: Users,
			enabled: false,
		},
		{
			id: 'promotions',
			name: 'Promotions & Offers',
			description: 'Special offers, discounts, and promotional content',
			icon: Gift,
			enabled: false,
		},
		{
			id: 'security',
			name: 'Security Alerts',
			description: 'Important security-related notifications',
			icon: AlertTriangle,
			enabled: true,
		},
	];

	// State for notification channels
	const [channels, setChannels] = useState<NotificationChannel[]>(
		defaultChannels
	);

	// State for notification settings
	const [masterToggle, setMasterToggle] = useState(true);
	const [showDetails, setShowDetails] = useState(false);

	// Handle toggle for individual notification channel
	const handleChannelToggle = async (index: number) => {
		const channel = channels[index];
		const newEnabled = !channel.enabled;

		if (onChannelToggle) {
			try {
				const success = await onChannelToggle(channel.id, newEnabled);

				if (success) {
					const updatedChannels = [...channels];
					updatedChannels[index] = {
						...channel,
						enabled: newEnabled,
					};
					setChannels(updatedChannels);

					// Update master toggle if needed
					if (newEnabled === false && masterToggle) {
						const anyEnabled = updatedChannels.some((c) => c.enabled);
						if (!anyEnabled) {
							setMasterToggle(false);
						}
					} else if (newEnabled === true && !masterToggle) {
						setMasterToggle(true);
					}
				}
			} catch (error) {
				console.error('Error toggling notification channel:', error);
			}
		} else {
			// Mock behavior for demo
			const updatedChannels = [...channels];
			updatedChannels[index] = {
				...channel,
				enabled: newEnabled,
			};
			setChannels(updatedChannels);

			// Update master toggle if needed
			if (newEnabled === false) {
				const anyEnabled = updatedChannels.some((c) => c.enabled);
				if (!anyEnabled) {
					setMasterToggle(false);
				}
			} else if (newEnabled === true && !masterToggle) {
				setMasterToggle(true);
			}
		}
	};

	// Handle master toggle for all notifications
	const handleMasterToggle = async (value: boolean) => {
		if (value === masterToggle) return;

		setMasterToggle(value);

		const updatedChannels = channels.map((channel) => ({
			...channel,
			enabled: value,
		}));

		setChannels(updatedChannels);

		if (onChannelToggle) {
			// Call onChannelToggle for each channel
			try {
				await Promise.all(channels.map((channel) => onChannelToggle(channel.id, value)));
			} catch (error) {
				console.error('Error toggling all notification channels:', error);
			}
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView className="flex-1">
				<Text className="text-2xl font-rbold text-gray-800 dark:text-gray-200 px-4 mb-4 mt-6 pt-4">
					Notification Settings
				</Text>

				{/* Master Toggle */}
				<Animated.View
					entering={FadeInDown.duration(400)}
					className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center flex-1">
							<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
								<Bell size={20} className="text-purple-600 dark:text-purple-400" />
							</View>
							<View className="ml-3 flex-1">
								<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">
									All Notifications
								</Text>
								<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
									{masterToggle ? 'Enabled' : 'Disabled'}
								</Text>
							</View>
						</View>
						<Switch
							value={masterToggle}
							onValueChange={handleMasterToggle}
							trackColor={{ false: '#E2E8F0', true: '#A78BFA' }}
							thumbColor={masterToggle ? '#8B5CF6' : '#FFFFFF'}
							ios_backgroundColor="#E2E8F0"
						/>
					</View>
				</Animated.View>

				{/* Notification Channels */}
				<TouchableOpacity
					onPress={() => setShowDetails(!showDetails)}
					activeOpacity={0.7}
					className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
							<Info size={20} className="text-purple-600 dark:text-purple-400" />
						</View>
						<Text className="text-base font-amedium text-gray-900 dark:text-gray-100 ml-3">
							Notification Channels
						</Text>
					</View>
					<ChevronRight
						size={20}
						className={`text-gray-400 dark:text-gray-500 transform ${showDetails ? 'rotate-90' : 'rotate-0'}`}
					/>
				</TouchableOpacity>

				{showDetails &&
					channels.map((channel, index) => (
						<Animated.View
							key={channel.id}
							entering={FadeInDown.duration(300).delay(index * 50)}
							className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
						>
							<View className="flex-row items-center justify-between">
								<View className="flex-row items-center flex-1">
									<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
										<channel.icon size={20} className="text-purple-600 dark:text-purple-400" />
									</View>
									<View className="ml-3 flex-1">
										<Text className="text-sm text-gray-800 dark:text-gray-200 font-amedium">
											{channel.name}
										</Text>
										<Text className="text-xs font-aregular text-gray-500 dark:text-gray-400 mt-1">
											{channel.description}
										</Text>
									</View>
								</View>
								<Switch
									value={channel.enabled && masterToggle}
									onValueChange={() => handleChannelToggle(index)}
									trackColor={{ false: '#E2E8F0', true: '#A78BFA' }}
									thumbColor={channel.enabled && masterToggle ? '#8B5CF6' : '#FFFFFF'}
									ios_backgroundColor="#E2E8F0"
									disabled={!masterToggle}
								/>
							</View>
						</Animated.View>
					))}

				{/* App Update Notification */}
				<Animated.View
					entering={FadeInDown.duration(400).delay(300)}
					className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 mx-4 mb-3"
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
							<Bell size={20} className="text-white" />
						</View>
						<View className="ml-3 flex-1">
							<Text className="text-base text-white font-amedium">Stay Updated</Text>
							<Text className="text-sm text-white/80 font-aregular mt-1">
								We recommend keeping app update notifications on
							</Text>
						</View>
					</View>
				</Animated.View>

				{/* Do Not Disturb Section */}
				<Animated.View
					entering={FadeInDown.duration(400).delay(400)}
					className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
				>
					<TouchableOpacity activeOpacity={0.7} className="flex-row items-center justify-between">
						<View className="flex-row items-center flex-1">
							<View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-300 items-center justify-center">
								<Bell size={20} className="text-red-600 dark:text-red-400" />
							</View>
							<View className="ml-3 flex-1">
								<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">
									Do Not Disturb
								</Text>
								<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
									Configure quiet hours
								</Text>
							</View>
						</View>
						<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
					</TouchableOpacity>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

NotificationsSettings.displayName = 'NotificationsSettings';
export default NotificationsSettings;
