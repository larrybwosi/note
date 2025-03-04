import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { observer, use$, useObservable } from '@legendapp/state/react';
import {
	User,
	Mail,
	Phone,
	MapPin,
	Camera,
	ChevronRight,
	Edit2,
	AlertCircle,
	LucideIcon,
	CalendarDays,
} from 'lucide-react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { ProfileData, profileData$, useUpdateProfile } from 'src/store/useProfile';
import { SafeAreaView } from 'react-native-safe-area-context';


interface ProfileSectionProps {
	icon: LucideIcon;
	label: string;
	value: string;
	onPress?: () => void;
	isEditing?: boolean;
	onChangeText?: (text: string) => void;
	error?: string;
}

const ProfileSection = ({
	icon: Icon,
	label,
	value,
	onPress,
	isEditing,
	onChangeText,
	error,
}: ProfileSectionProps) => {
	return (
		<Animated.View
			entering={FadeInDown.duration(400)}
			className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3"
		>
			<TouchableOpacity
				onPress={onPress}
				activeOpacity={0.7}
				className="flex-row items-center justify-between"
			>
				<View className="flex-row items-center flex-1">
					<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
						<Icon size={20} className="text-purple-600 dark:text-purple-400" />
					</View>
					<View className="ml-3 flex-1">
						<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">{label}</Text>
						{isEditing ? (
							<View className="mt-1">
								<TextInput
									className="text-sm font-aregular text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1"
									value={value}
									onChangeText={onChangeText}
									autoFocus
								/>
								{error && (
									<View className="flex-row items-center mt-1">
										<AlertCircle size={14} className="text-red-500" />
										<Text className="ml-1 text-xs text-red-500">{error}</Text>
									</View>
								)}
							</View>
						) : (
							<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
								{value || 'Not set'}
							</Text>
						)}
					</View>
				</View>
				<ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
			</TouchableOpacity>
		</Animated.View>
	);
};

const ProfilePage = () => {
	const profile = use$(profileData$)
	const [profileData, setProfileData] = useState<ProfileData>(profile);


	const [editing, setEditing] = useState<keyof ProfileData | null>(null);
	const [errors, setErrors] = useState<{ [key in keyof ProfileData]?: string }>({});

	const validateField = (field: keyof ProfileData, value: string) => {
		switch (field) {
			case 'email':
				return !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
					? 'Please enter a valid email address'
					: '';
			case 'phone':
				return !value.match(/^\+?[\d\s-]{10,}$/) ? 'Please enter a valid phone number' : '';
			case 'dob':
				const date = new Date(value);
				return isNaN(date.getTime()) ? 'Please enter a valid date' : '';
			default:
				return '';
		}
	};

	const handleEdit = (field: keyof ProfileData) => {
		setEditing(field);
	};

	const handleChange = (field: keyof ProfileData, value: string) => {
		// profileData$[field].set(value);
		setProfileData({...profileData, [field]:value})
		const error = validateField(field, value);
		setErrors((prev) => ({ ...prev, [field]: error }));
	};

	const handleSave = () => {
		try {
			useUpdateProfile(profileData);
		} catch (error:any) {
			Alert.alert(`Error: ${error?.message}`);
		}
		setEditing(null);
	}

	const sections: { icon: LucideIcon; label: string; field: keyof ProfileData }[] = [
		{ icon: User, label: 'Full Name', field: 'name' },
		{ icon: Mail, label: 'Email Address', field: 'email' },
		{ icon: Phone, label: 'Phone Number', field: 'phone' },
		{ icon: CalendarDays, label: 'Date of Birth', field: 'dob' },
		{ icon: MapPin, label: 'Address', field: 'address' },
		{ icon: Edit2, label: 'Bio', field: 'bio' },
	];

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900 mt-6 pt-4">
			<Text className="text-2xl font-rbold text-gray-800 dark:text-gray-200 px-4 mb-4">
				Profile Settings
			</Text>
			{sections.map((section) => (
				<ProfileSection
					key={section.field}
					icon={section.icon}
					label={section.label}
					value={profileData[section.field]!}
					onPress={() => handleEdit(section.field)}
					isEditing={editing === section.field}
					onChangeText={(value) => handleChange(section.field, value)}
					error={errors[section.field]}
				/>
			))}

			{editing && (
				<Animated.View entering={SlideInRight} className="flex-row justify-end mt-4 mx-2 gap-2">
					<TouchableOpacity
						onPress={() => setEditing(null)}
						className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
					>
						<Text className="text-gray-800 dark:text-gray-200 font-rmedium">Cancel</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={handleSave} className="px-4 py-2 rounded-lg bg-purple-600">
						<Text className="text-white font-rmedium">Save</Text>
					</TouchableOpacity>
				</Animated.View>
			)}
		</SafeAreaView>
	);
};

ProfilePage.displayName = 'ProfilePage';
export default observer(ProfilePage);
