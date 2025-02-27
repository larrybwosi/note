import { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { AlertCircle, RefreshCw, Home } from 'lucide-react-native';
import { router } from 'expo-router';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallbackComponent?: ReactNode;
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

// Separated fallback UI component to use hooks
const ErrorFallbackUI = ({
	error,
	errorInfo,
	resetErrorBoundary,
}: {
	error: Error | null;
	errorInfo: ErrorInfo | null;
	resetErrorBoundary: () => void;
	homeScreenName?: string;
}) => {

	const navigateToHome = () => {
		router.replace('/');
		resetErrorBoundary();
	};

	return (
		<View className="flex-1 bg-white dark:bg-gray-900 p-6 justify-center items-center">
			<View className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-700">
				{/* Error icon and illustration */}
				<View className="items-center mb-6">
					<View className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-3">
						<AlertCircle size={32} color="#EF4444" />
					</View>
					<Text className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Oops!</Text>
					<Text className="text-gray-500 dark:text-gray-400 text-center">
						We hit an unexpected error
					</Text>
				</View>

				{/* Error message */}
				<View className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl mb-6">
					<Text className="text-gray-700 dark:text-gray-300 text-center">
						Something went wrong while loading this screen. We've been notified and are working on a
						fix.
					</Text>
				</View>

				{/* Dev mode error details */}
				{__DEV__ && error && (
					<ScrollView className="mb-6 max-h-32 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
						<Text className="font-mono text-xs text-gray-800 dark:text-gray-200">
							{error.toString()}
							{errorInfo && `\n\n${errorInfo.componentStack}`}
						</Text>
					</ScrollView>
				)}

				{/* Action buttons */}
				<View className="flex-row space-x-3">
					<TouchableOpacity
						onPress={navigateToHome}
						className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center"
					>
						<Home size={18} color="#4B5563" className="mr-2" />
						<Text className="font-medium text-gray-700 dark:text-gray-300">Home</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={resetErrorBoundary}
						className="flex-1 bg-red-500 dark:bg-red-600 p-4 rounded-xl flex-row justify-center items-center"
					>
						<RefreshCw size={18} color="white" className="mr-2" />
						<Text className="text-white font-medium">Try Again</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

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

		// Here you could send the error to your error reporting service
		// e.g., Sentry, Bugsnag, etc.
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
				/>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
