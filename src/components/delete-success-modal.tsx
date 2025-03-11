import { useEffect, useRef } from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Animated,
	Easing,
	StyleSheet,
} from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'confirmation';

interface FeedbackModalProps {
	visible: boolean;
	type: FeedbackType;
	title: string;
	message: string;
	primaryButtonText?: string;
	secondaryButtonText?: string;
	onPrimaryAction: () => void;
	onSecondaryAction?: () => void;
	onClose: () => void;
	hideCloseButton?: boolean;
	autoClose?: boolean;
	autoCloseTime?: number;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
	visible,
	type,
	title,
	message,
	primaryButtonText = 'OK',
	secondaryButtonText,
	onPrimaryAction,
	onSecondaryAction,
	onClose,
	hideCloseButton = false,
	autoClose = false,
	autoCloseTime = 3000,
}) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const scaleAnim = useRef(new Animated.Value(0.9)).current;
	const iconAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (visible) {
			// Fade in and scale up the modal
			Animated.parallel([
				Animated.timing(fadeAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
					easing: Easing.out(Easing.cubic),
				}),
				Animated.timing(scaleAnim, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
					easing: Easing.out(Easing.back(1.5)),
				}),
				Animated.timing(iconAnim, {
					toValue: 1,
					duration: 400,
					delay: 100,
					useNativeDriver: true,
					easing: Easing.elastic(1.2),
				}),
			]).start();

			// Auto close if enabled
			if (autoClose && type !== 'confirmation') {
				const timer = setTimeout(() => {
					onClose();
				}, autoCloseTime);

				return () => clearTimeout(timer);
			}
		} else {
			// Reset animations when modal closes
			fadeAnim.setValue(0);
			scaleAnim.setValue(0.9);
			iconAnim.setValue(0);
		}
	}, [visible, autoClose, autoCloseTime, onClose, type]);

	const getIconAndColors = () => {
		switch (type) {
			case 'success':
				return {
					icon: <CheckCircle2 size={48} color="white" />,
					bgColor: 'bg-green-500',
					textColor: 'text-green-600',
					iconBgColor: '#10B981',
					buttonColor: 'bg-green-500',
					buttonTextColor: 'text-white',
				};
			case 'error':
				return {
					icon: <XCircle size={48} color="white" />,
					bgColor: 'bg-red-500',
					textColor: 'text-red-600',
					iconBgColor: '#EF4444',
					buttonColor: 'bg-red-500',
					buttonTextColor: 'text-white',
				};
			case 'warning':
				return {
					icon: <AlertTriangle size={48} color="white" />,
					bgColor: 'bg-yellow-500',
					textColor: 'text-yellow-600',
					iconBgColor: '#F59E0B',
					buttonColor: 'bg-yellow-500',
					buttonTextColor: 'text-white',
				};
			case 'info':
				return {
					icon: <Info size={48} color="white" />,
					bgColor: 'bg-blue-500',
					textColor: 'text-blue-600',
					iconBgColor: '#3B82F6',
					buttonColor: 'bg-blue-500',
					buttonTextColor: 'text-white',
				};
			case 'confirmation':
				return {
					icon: <AlertCircle size={48} color="white" />,
					bgColor: 'bg-indigo-500',
					textColor: 'text-indigo-600',
					iconBgColor: '#6366F1',
					buttonColor: 'bg-indigo-500',
					buttonTextColor: 'text-white',
				};
		}
	};

	const { icon, bgColor, textColor, iconBgColor, buttonColor, buttonTextColor } =
		getIconAndColors();

	const handleOutsidePress = () => {
		if (type !== 'confirmation') {
			onClose();
		}
	};

	const isPrimaryAction = type === 'confirmation' && secondaryButtonText;
	const primaryAction = isPrimaryAction ? onSecondaryAction : onPrimaryAction;
	const primaryText = isPrimaryAction ? secondaryButtonText : primaryButtonText;

	return (
		<Modal transparent={true} visible={visible} animationType="none" onRequestClose={onClose}>
			<TouchableWithoutFeedback onPress={handleOutsidePress}>
				<View className="flex-1 justify-center items-center bg-black/50">
					<TouchableWithoutFeedback>
						<Animated.View
							className="w-5/6 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl"
							style={{
								opacity: fadeAnim,
								transform: [{ scale: scaleAnim }],
							}}
						>
							{/* Close button */}
							{!hideCloseButton && type !== 'confirmation' && (
								<TouchableOpacity className="absolute top-3 right-3 z-10" onPress={onClose}>
									<X size={24} color="#9CA3AF" />
								</TouchableOpacity>
							)}

							{/* Icon header */}
							<View className={`w-full items-center justify-center py-6 ${bgColor}`}>
								<Animated.View
									style={{
										transform: [
											{ scale: iconAnim },
											{
												rotate: iconAnim.interpolate({
													inputRange: [0, 1],
													outputRange: ['0deg', type === 'success' ? '360deg' : '0deg'],
												}),
											},
										],
									}}
								>
									{icon}
								</Animated.View>
							</View>

							{/* Content */}
							<View className="px-6 pt-6 pb-4">
								<Text className="text-xl font-rbold text-gray-900 dark:text-white text-center mb-2">
									{title}
								</Text>
								<Text className="text-gray-600 dark:text-gray-300 text-center mb-6">{message}</Text>

								{/* Buttons */}
								<View
									className={`flex-row ${secondaryButtonText ? 'justify-between' : 'justify-center'} mb-2`}
								>
									{type === 'confirmation' && secondaryButtonText && (
										<TouchableOpacity
											className="py-3 px-6 rounded-xl bg-gray-200 dark:bg-gray-700 flex-1 mr-2"
											onPress={onPrimaryAction}
										>
											<Text className="text-gray-800 dark:text-white font-rmedium text-center">
												{primaryButtonText}
											</Text>
										</TouchableOpacity>
									)}

									<TouchableOpacity
										className={`py-3 px-6 rounded-xl ${buttonColor} ${secondaryButtonText ? 'flex-1' : 'w-4/5'} ${type === 'confirmation' && secondaryButtonText ? 'ml-2' : ''}`}
										onPress={primaryAction || onPrimaryAction}
									>
										<Text className={`${buttonTextColor} font-rmedium text-center`}>
											{primaryText || primaryButtonText}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</Animated.View>
					</TouchableWithoutFeedback>
				</View>
			</TouchableWithoutFeedback>
		</Modal>
	);
};

export default FeedbackModal;
