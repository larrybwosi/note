import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Lock, Key, Shield, Eye, EyeOff, AlertCircle, Check } from 'lucide-react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PasswordFormData {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

const SecuritySettings = () => {
	const onPasswordChange = async (oldPassword: string, newPassword: string) => {
    // Mock API call for password change
    return true;
  };
	const onTwoFactorToggle = async (enabled: boolean, password: string) => {
    // Mock API call for two-factor toggle
    return true;
  }
  const initialTwoFactorState = false

	const [changingPassword, setChangingPassword] = useState(false);
	const [passwordData, setPasswordData] = useState<PasswordFormData>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
	const [passwordSuccess, setPasswordSuccess] = useState(false);

	// State for two-factor authentication
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorState);
	const [showTwoFactorConfirm, setShowTwoFactorConfirm] = useState(false);
	const [twoFactorPassword, setTwoFactorPassword] = useState('');
	const [twoFactorError, setTwoFactorError] = useState('');
	const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);

	// Password visibility toggles
	const [passwordVisibility, setPasswordVisibility] = useState({
		currentPassword: false,
		newPassword: false,
		confirmPassword: false,
		twoFactorPassword: false,
	});

	// Handle password change form
	const handlePasswordInputChange = (field: keyof PasswordFormData, value: string) => {
		setPasswordData((prev) => ({ ...prev, [field]: value }));
		validatePasswordField(field, value);
	};

	const validatePasswordField = (field: keyof PasswordFormData, value: string) => {
		let error = '';

		switch (field) {
			case 'currentPassword':
				if (!value) error = 'Current password is required';
				break;
			case 'newPassword':
				if (!value) {
					error = 'New password is required';
				} else if (value.length < 8) {
					error = 'Password must be at least 8 characters';
				} else if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
					error = 'Password must contain uppercase, lowercase, and numbers';
				}

				// If confirm password is already filled, validate it again
				if (passwordData.confirmPassword && passwordData.confirmPassword !== value) {
					setPasswordErrors((prev) => ({
						...prev,
						confirmPassword: 'Passwords do not match',
					}));
				} else if (passwordData.confirmPassword) {
					setPasswordErrors((prev) => ({
						...prev,
						confirmPassword: '',
					}));
				}
				break;
			case 'confirmPassword':
				if (!value) {
					error = 'Please confirm your password';
				} else if (value !== passwordData.newPassword) {
					error = 'Passwords do not match';
				}
				break;
		}

		setPasswordErrors((prev) => ({ ...prev, [field]: error }));
		return error;
	};

	const handleSavePassword = async () => {
		// Validate all fields
		const currentPasswordError = validatePasswordField(
			'currentPassword',
			passwordData.currentPassword
		);
		const newPasswordError = validatePasswordField('newPassword', passwordData.newPassword);
		const confirmPasswordError = validatePasswordField(
			'confirmPassword',
			passwordData.confirmPassword
		);

		if (currentPasswordError || newPasswordError || confirmPasswordError) {
			return;
		}

		if (onPasswordChange) {
			try {
				const success = await onPasswordChange(
					passwordData.currentPassword,
					passwordData.newPassword
				);

				if (success) {
					setPasswordSuccess(true);
					// Reset form after 3 seconds
					setTimeout(() => {
						setPasswordSuccess(false);
						setChangingPassword(false);
						setPasswordData({
							currentPassword: '',
							newPassword: '',
							confirmPassword: '',
						});
					}, 3000);
				} else {
					setPasswordErrors((prev) => ({
						...prev,
						currentPassword: 'Current password is incorrect',
					}));
				}
			} catch (error) {
				setPasswordErrors((prev) => ({
					...prev,
					general: 'An error occurred. Please try again.',
				}));
			}
		} else {
			// Mock successful change for demo
			setPasswordSuccess(true);
			setTimeout(() => {
				setPasswordSuccess(false);
				setChangingPassword(false);
				setPasswordData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
			}, 3000);
		}
	};

	// Handle two-factor authentication toggle
	const handleTwoFactorToggle = (value: boolean) => {
		if (value === twoFactorEnabled) return;

		setTwoFactorSuccess(false);
		setTwoFactorError('');
		setTwoFactorPassword('');
		setShowTwoFactorConfirm(true);
	};

	const confirmTwoFactorToggle = async () => {
		if (!twoFactorPassword) {
			setTwoFactorError('Password is required');
			return;
		}

		if (onTwoFactorToggle) {
			try {
				const success = await onTwoFactorToggle(!twoFactorEnabled, twoFactorPassword);

				if (success) {
					setTwoFactorEnabled(!twoFactorEnabled);
					setTwoFactorSuccess(true);
					// Reset form after 3 seconds
					setTimeout(() => {
						setTwoFactorSuccess(false);
						setShowTwoFactorConfirm(false);
						setTwoFactorPassword('');
					}, 3000);
				} else {
					setTwoFactorError('Incorrect password');
				}
			} catch (error) {
				setTwoFactorError('An error occurred. Please try again.');
			}
		} else {
			// Mock successful toggle for demo
			setTwoFactorEnabled(!twoFactorEnabled);
			setTwoFactorSuccess(true);
			setTimeout(() => {
				setTwoFactorSuccess(false);
				setShowTwoFactorConfirm(false);
				setTwoFactorPassword('');
			}, 3000);
		}
	};

	const togglePasswordVisibility = (field: string) => {
		setPasswordVisibility((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
			<ScrollView className="flex-1">
				<Text className="text-2xl font-rbold text-gray-800 dark:text-gray-100 px-4 mb-4 mt-6 pt-4">
					Security Settings
				</Text>

				{/* Two-Factor Authentication Toggle */}
				<Animated.View
					entering={FadeInDown.duration(400).delay(100)}
					className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
				>
					<View className="flex-row items-center justify-between">
						<View className="flex-row items-center flex-1">
							<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
								<Shield size={20} className="text-purple-600 dark:text-purple-400" />
							</View>
							<View className="ml-3 flex-1">
								<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">
									Two-Factor Authentication
								</Text>
								<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
									{twoFactorEnabled ? 'Enabled' : 'Disabled'}
								</Text>
							</View>
						</View>
						<Switch
							value={twoFactorEnabled}
							onValueChange={handleTwoFactorToggle}
							trackColor={{ false: '#E2E8F0', true: '#A78BFA' }}
							thumbColor={twoFactorEnabled ? '#8B5CF6' : '#FFFFFF'}
							ios_backgroundColor="#E2E8F0"
						/>
					</View>
				</Animated.View>

				{/* Two-Factor Authentication Confirmation */}
				{showTwoFactorConfirm && (
					<Animated.View
						entering={SlideInRight.duration(300)}
						className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
					>
						<Text className="text-base font-amedium text-gray-900 dark:text-gray-100 mb-3">
							{twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication
						</Text>

						<Text className="text-sm text-gray-500 dark:text-gray-400 mb-4">
							Please enter your password to {twoFactorEnabled ? 'disable' : 'enable'} two-factor
							authentication.
						</Text>

						<View className="mb-4">
							<View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
								<Lock size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
								<TextInput
									className="flex-1 text-gray-900 dark:text-gray-100 font-aregular"
									placeholder="Enter your password"
									placeholderTextColor="#9CA3AF"
									secureTextEntry={!passwordVisibility.twoFactorPassword}
									value={twoFactorPassword}
									onChangeText={(text) => {
										setTwoFactorPassword(text);
										if (twoFactorError) setTwoFactorError('');
									}}
								/>
								<TouchableOpacity onPress={() => togglePasswordVisibility('twoFactorPassword')}>
									{passwordVisibility.twoFactorPassword ? (
										<EyeOff size={18} className="text-gray-400 dark:text-gray-500" />
									) : (
										<Eye size={18} className="text-gray-400 dark:text-gray-500" />
									)}
								</TouchableOpacity>
							</View>

							{twoFactorError && (
								<View className="flex-row items-center mt-1">
									<AlertCircle size={14} className="text-red-500" />
									<Text className="ml-1 text-xs text-red-500">{twoFactorError}</Text>
								</View>
							)}

							{twoFactorSuccess && (
								<View className="flex-row items-center mt-1">
									<Check size={14} className="text-green-500" />
									<Text className="ml-1 text-xs text-green-500">
										Two-factor authentication {twoFactorEnabled ? 'disabled' : 'enabled'}{' '}
										successfully
									</Text>
								</View>
							)}
						</View>

						<View className="flex-row justify-end space-x-3">
							<TouchableOpacity
								onPress={() => setShowTwoFactorConfirm(false)}
								className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
							>
								<Text className="text-gray-800 dark:text-gray-200 font-rmedium">Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={confirmTwoFactorToggle}
								className="px-4 py-2 rounded-lg bg-purple-600"
							>
								<Text className="text-white font-rmedium">Confirm</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				)}

				{/* Change Password Section */}
				<Animated.View
					entering={FadeInDown.duration(400).delay(200)}
					className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-3"
				>
					<TouchableOpacity
						onPress={() => setChangingPassword(!changingPassword)}
						activeOpacity={0.7}
						className="flex-row items-center justify-between"
					>
						<View className="flex-row items-center flex-1">
							<View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-300 items-center justify-center">
								<Key size={20} className="text-purple-600 dark:text-purple-400" />
							</View>
							<View className="ml-3 flex-1">
								<Text className="text-sm text-gray-500 dark:text-gray-400 font-amedium">
									Password
								</Text>
								<Text className="text-sm font-aregular text-gray-900 dark:text-gray-100 mt-1">
									Change your password
								</Text>
							</View>
						</View>
						{changingPassword ? (
							<View className="w-6 h-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-300">
								<Text className="text-purple-600 dark:text-purple-400 font-rbold">-</Text>
							</View>
						) : (
							<View className="w-6 h-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-300">
								<Text className="text-purple-600 dark:text-purple-400 font-rbold">+</Text>
							</View>
						)}
					</TouchableOpacity>

					{changingPassword && (
						<Animated.View entering={SlideInRight.duration(300)} className="mt-4">
							{/* Current Password */}
							<View className="mb-4">
								<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-amedium">
									Current Password
								</Text>
								<View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
									<Lock size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
									<TextInput
										className="flex-1 text-gray-900 dark:text-gray-100 font-aregular"
										placeholder="Enter current password"
										placeholderTextColor="#9CA3AF"
										secureTextEntry={!passwordVisibility.currentPassword}
										value={passwordData.currentPassword}
										onChangeText={(text) => handlePasswordInputChange('currentPassword', text)}
									/>
									<TouchableOpacity onPress={() => togglePasswordVisibility('currentPassword')}>
										{passwordVisibility.currentPassword ? (
											<EyeOff size={18} className="text-gray-400 dark:text-gray-500" />
										) : (
											<Eye size={18} className="text-gray-400 dark:text-gray-500" />
										)}
									</TouchableOpacity>
								</View>
								{passwordErrors.currentPassword && (
									<View className="flex-row items-center mt-1">
										<AlertCircle size={14} className="text-red-500" />
										<Text className="ml-1 text-xs text-red-500">
											{passwordErrors.currentPassword}
										</Text>
									</View>
								)}
							</View>

							{/* New Password */}
							<View className="mb-4">
								<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-amedium">
									New Password
								</Text>
								<View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
									<Key size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
									<TextInput
										className="flex-1 text-gray-900 dark:text-gray-100 font-aregular"
										placeholder="Enter new password"
										placeholderTextColor="#9CA3AF"
										secureTextEntry={!passwordVisibility.newPassword}
										value={passwordData.newPassword}
										onChangeText={(text) => handlePasswordInputChange('newPassword', text)}
									/>
									<TouchableOpacity onPress={() => togglePasswordVisibility('newPassword')}>
										{passwordVisibility.newPassword ? (
											<EyeOff size={18} className="text-gray-400 dark:text-gray-500" />
										) : (
											<Eye size={18} className="text-gray-400 dark:text-gray-500" />
										)}
									</TouchableOpacity>
								</View>
								{passwordErrors.newPassword && (
									<View className="flex-row items-center mt-1">
										<AlertCircle size={14} className="text-red-500" />
										<Text className="ml-1 text-xs text-red-500">{passwordErrors.newPassword}</Text>
									</View>
								)}
							</View>

							{/* Confirm New Password */}
							<View className="mb-4">
								<Text className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-amedium">
									Confirm New Password
								</Text>
								<View className="flex-row items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
									<Key size={18} className="text-gray-400 dark:text-gray-500 mr-2" />
									<TextInput
										className="flex-1 text-gray-900 dark:text-gray-100 font-aregular"
										placeholder="Confirm new password"
										placeholderTextColor="#9CA3AF"
										secureTextEntry={!passwordVisibility.confirmPassword}
										value={passwordData.confirmPassword}
										onChangeText={(text) => handlePasswordInputChange('confirmPassword', text)}
									/>
									<TouchableOpacity onPress={() => togglePasswordVisibility('confirmPassword')}>
										{passwordVisibility.confirmPassword ? (
											<EyeOff size={18} className="text-gray-400 dark:text-gray-500" />
										) : (
											<Eye size={18} className="text-gray-400 dark:text-gray-500" />
										)}
									</TouchableOpacity>
								</View>
								{passwordErrors.confirmPassword && (
									<View className="flex-row items-center mt-1">
										<AlertCircle size={14} className="text-red-500" />
										<Text className="ml-1 text-xs text-red-500">
											{passwordErrors.confirmPassword}
										</Text>
									</View>
								)}
							</View>

							{passwordErrors.general && (
								<View className="flex-row items-center mb-4">
									<AlertCircle size={14} className="text-red-500" />
									<Text className="ml-1 text-xs text-red-500">{passwordErrors.general}</Text>
								</View>
							)}

							{passwordSuccess && (
								<View className="flex-row items-center mb-4">
									<Check size={14} className="text-green-500" />
									<Text className="ml-1 text-xs text-green-500">Password changed successfully</Text>
								</View>
							)}

							<View className="flex-row justify-end space-x-3">
								<TouchableOpacity
									onPress={() => {
										setChangingPassword(false);
										setPasswordData({
											currentPassword: '',
											newPassword: '',
											confirmPassword: '',
										});
										setPasswordErrors({});
									}}
									className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
								>
									<Text className="text-gray-800 dark:text-gray-200 font-rmedium">Cancel</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={handleSavePassword}
									className="px-4 py-2 rounded-lg bg-purple-600"
								>
									<Text className="text-white font-rmedium">Change Password</Text>
								</TouchableOpacity>
							</View>
						</Animated.View>
					)}
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
};

SecuritySettings.displayName = 'SecuritySettings';
export default SecuritySettings;
