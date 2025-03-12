import { Component, ErrorInfo, ReactNode, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, {
	FadeInDown,
	FadeInUp,
	Layout,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';
// import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import * as Haptics from 'expo-haptics';

// Types
interface ErrorBoundaryProps {
	children: ReactNode;
	fallbackComponent?: ReactNode;
	onReset?: () => void;
	onReport?: (error: Error, componentStack?: string) => void;
	homeRoute?: string;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

interface FallbackUIProps {
	error: Error | null;
	errorInfo: ErrorInfo | null;
	resetErrorBoundary: () => void;
	reportError?: (error: Error, componentStack?: string) => void;
	homeRoute?: string;
}

// Error details component with animation
const ErrorDetails = ({ error, errorInfo }: { error: Error; errorInfo: ErrorInfo | null }) => {
	const scale = useSharedValue(0.95);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: withSpring(scale.value) }],
		};
	});

	const expandDetails = useCallback(() => {
		scale.value = scale.value === 0.95 ? 1 : 0.95;
		// Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}, [scale]);

	return (
		<TouchableOpacity onPress={expandDetails} activeOpacity={0.8} className="mb-6">
			<View className="flex-row items-center justify-between mb-2">
				<Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
					Technical Details
				</Text>
				<Text className="text-xs text-gray-500 dark:text-gray-400">Tap to expand</Text>
			</View>
			<Animated.View style={animatedStyle}>
				<ScrollView
					className="max-h-32 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
					showsVerticalScrollIndicator={Platform.OS === 'android'}
				>
					<Text className="font-mono text-xs text-gray-800 dark:text-gray-200">
						{error.toString()}
						{errorInfo && `\n\n${errorInfo.componentStack}`}
					</Text>
				</ScrollView>
			</Animated.View>
		</TouchableOpacity>
	);
};

// Main fallback UI component
const ErrorFallbackUI = ({
	error,
	errorInfo,
	resetErrorBoundary,
	reportError,
	homeRoute = '/',
}: FallbackUIProps) => {
	const insets = useSafeAreaInsets();

	const navigateBack = useCallback(() => {
		// Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		if (router.canGoBack()) {
			router.back();
		}
		resetErrorBoundary();
	}, [resetErrorBoundary]);

	const navigateToHome = useCallback(() => {
		// Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.replace(homeRoute);
		resetErrorBoundary();
	}, [homeRoute, resetErrorBoundary]);

	const tryAgain = useCallback(() => {
		// Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		resetErrorBoundary();
	}, [resetErrorBoundary]);

	const handleReport = useCallback(() => {
		if (reportError && error) {
			// Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
			reportError(error, errorInfo?.componentStack);
		}
	}, [error, errorInfo, reportError]);

	return (
		<View
			className="flex-1 bg-gray-50 dark:bg-gray-900"
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<View className="absolute inset-0 dark:hidden bg-gray-900 opacity-20" />
			<View className="absolute inset-0 hidden dark:flex bg-gray-900 opacity-50" />
			{/* <BlurView intensity={80} tint="light" className="absolute inset-0 dark:hidden" />
			<BlurView intensity={90} tint="dark" className="absolute inset-0 hidden dark:flex" /> */}

			<Animated.View entering={FadeInDown.delay(100).springify()} className="p-6">
				<TouchableOpacity
					onPress={navigateBack}
					className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm"
				>
					<ArrowLeft size={20} color="#4B5563" />
				</TouchableOpacity>
			</Animated.View>

			<Animated.View
				className="flex-1 p-6 justify-center"
				entering={FadeInUp.delay(200).springify()}
				layout={Layout.springify()}
			>
				<View className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md mx-auto shadow-xl border border-gray-100 dark:border-gray-700">
					{/* Error icon and title */}
					<Animated.View className="items-center mb-6" entering={FadeInDown.delay(300).springify()}>
						<View className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-3">
							<AlertTriangle size={32} color="#EF4444" />
						</View>
						<Text className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
							Something went wrong
						</Text>
						<Text className="text-gray-500 dark:text-gray-400 text-center">
							We encountered an unexpected error
						</Text>
					</Animated.View>

					{/* Error message */}
					<Animated.View
						className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl mb-6"
						entering={FadeInDown.delay(400).springify()}
					>
						<Text className="text-gray-700 dark:text-gray-300 text-center">
							The app ran into a problem and couldn't continue. We've been notified about this issue
							and are working on a solution.
						</Text>
					</Animated.View>

					{/* Dev mode error details */}
					{__DEV__ && error && (
						<Animated.View entering={FadeInDown.delay(500).springify()}>
							<ErrorDetails error={error} errorInfo={errorInfo} />
						</Animated.View>
					)}

					{/* Action buttons */}
					<Animated.View className="space-y-3" entering={FadeInDown.delay(600).springify()}>
						<TouchableOpacity
							onPress={tryAgain}
							className="bg-red-500 dark:bg-red-600 p-4 rounded-xl flex-row justify-center items-center"
							activeOpacity={0.8}
						>
							<RefreshCcw size={18} color="white" className="mr-2" />
							<Text className="text-white font-medium">Try Again</Text>
						</TouchableOpacity>

						<View className="flex-row space-x-3">
							<TouchableOpacity
								onPress={navigateToHome}
								className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center"
								activeOpacity={0.8}
							>
								<Home size={18} color="#4B5563" className="mr-2" />
								<Text className="font-medium text-gray-700 dark:text-gray-300">Home</Text>
							</TouchableOpacity>

							{reportError && (
								<TouchableOpacity
									onPress={handleReport}
									className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center"
									activeOpacity={0.8}
								>
									<Text className="font-medium text-gray-700 dark:text-gray-300">Report</Text>
								</TouchableOpacity>
							)}
						</View>
					</Animated.View>
				</View>
			</Animated.View>
		</View>
	);
};

// Main ErrorBoundary class component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('Error caught by ErrorBoundary:', error, errorInfo);
		this.setState({
			error,
			errorInfo,
		});

		// Optional reporting to error tracking service
		if (this.props.onReport) {
			this.props.onReport(error, errorInfo.componentStack);
		}
	}

	resetErrorBoundary = (): void => {
		if (this.props.onReset) {
			this.props.onReset();
		}
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallbackComponent) {
				return this.props.fallbackComponent;
			}

			return (
				<ErrorFallbackUI
					error={this.state.error}
					errorInfo={this.state.errorInfo}
					resetErrorBoundary={this.resetErrorBoundary}
					reportError={this.props.onReport}
					homeRoute={this.props.homeRoute}
				/>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
