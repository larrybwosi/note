import { createContext, useEffect, useContext, ReactNode, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import { account, config, databases, getCurrentUser } from 'src/lib/appwrite';
import { createUniqueId } from './store';
import useStore from 'src/store/useStore';
import { use$, useObservable } from '@legendapp/state/react';
import Animated, {
	FadeIn,
	FadeOut,
	SlideInUp,
	SlideOutDown,
	Layout,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
	Easing,
} from 'react-native-reanimated';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle } from 'lucide-react-native';

// Define user type
interface User {
	$id: string;
	email: string;
	name?: string;
	// Add other user properties as needed
}

interface SignupProps {
	email: string;
	password: string;
	fullName: string;
	dob: string;
	phone: string;
}

// Auth context type definition
interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	signup: (data: SignupProps) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// User preferences collection ID and default values
const USERS_COLLECTION_ID = config.usersCollectionId;

// Loading Animation Component
const LoadingUI = () => {
	const insets = useSafeAreaInsets();
	const rotation = useSharedValue(0);
	const scale = useSharedValue(1);

	useEffect(() => {
		rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);

		scale.value = withRepeat(
			withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
			-1,
			true
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
		};
	});

	return (
		<Animated.View
			className="flex-1 bg-white dark:bg-gray-900 justify-center items-center"
			entering={FadeIn.duration(500)}
			exiting={FadeOut.duration(500)}
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
		>
			<StatusBar style="auto" />

			{/* Logo or Branding */}
			<Animated.View entering={SlideInUp.springify().damping(15)} className="mb-8 items-center">
				<Image
					source={require('../../assets/images/logo.png')} // Update with your actual logo path
					className="h-24 w-24 mb-4"
				/>
				<Text className="text-2xl font-bold text-gray-800 dark:text-white">FinTrack</Text>
			</Animated.View>

			{/* Loading Indicator */}
			<Animated.View style={animatedStyle} className="mb-8">
				<View className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 items-center justify-center">
					<ActivityIndicator size="large" color="#6366f1" />
				</View>
			</Animated.View>

			<Text className="text-gray-500 dark:text-gray-400 text-center px-8">
				Setting up your experience...
			</Text>
		</Animated.View>
	);
};

// Error UI Component
const ErrorUI = ({ message, retry }: { message: string; retry: () => void }) => {
	return (
		<Animated.View
			className="flex-1 bg-white dark:bg-gray-900 justify-center items-center p-6"
			entering={FadeIn.duration(500)}
			exiting={FadeOut.duration(500)}
		>
			<StatusBar style="auto" />

			<View className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 mb-4">
				<AlertCircle color="#ef4444" size={32} />
			</View>

			<Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Oops!</Text>

			<Text className="text-gray-600 dark:text-gray-300 text-center mb-6">
				{message || 'Something went wrong. Please try again.'}
			</Text>

			<Animated.View className="bg-indigo-500 px-6 py-3 rounded-xl" entering={SlideInUp.delay(300)}>
				<Text className="text-white font-medium" onPress={retry}>
					Try Again
				</Text>
			</Animated.View>
		</Animated.View>
	);
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const state$ = useObservable({
		user: null as User | null,
		isLoading: true,
		error: null as null | string,
	});

	const { user, error, isLoading } = use$(state$);
	const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);

	const setUser = state$.user.set;
	const setIsLoading = state$.isLoading.set;
	const setError = state$.error.set;

	const { categories, getActiveBudgetSpending } = useStore();
	const currentBudget = getActiveBudgetSpending();

	// Check auth state and redirect based on conditions
	const checkAuthAndRedirect = async () => {
		try {
			setIsLoading(true);

			// Get current session
			const session = await account.getSession('current');
			if (session?.$id) {
				// Get user account
				const userData = await getCurrentUser();
				setUser(userData as User);

				// Get user preferences and redirect as needed
				const shouldRedirectToCategories = categories.length === 0 || categories === null;
				const shouldRedirectToBudget = currentBudget?.budget.name;

				if (shouldRedirectToCategories) {
					router.navigate('categories');
				} else if (shouldRedirectToBudget) {
					router.navigate('create-edit-budget');
				}
			} else {
				// No active session, navigate to welcome screen
				setUser(null);
				router.navigate('splash');
			}
		} catch (error) {
			// Handle error (likely no active session)
			setUser(null);
			router.navigate('splash');
		} finally {
			setIsLoading(false);
			setInitialAuthCheckComplete(true);
		}
	};

	// Authentication functions
	const login = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			setError(null);

			await account.createEmailPasswordSession(email, password);
			checkAuthAndRedirect();
		} catch (error: any) {
			console.log('Login Error: ', error);
			setError(error.message || 'Login failed. Please try again.');
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			setIsLoading(true);
			await account.deleteSession('current');
			setUser(null);
			router.navigate('/splash');
		} catch (error: any) {
			console.log('Logout error: ', error);
			setError(error.message || 'Logout failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const signup = async ({ email, dob, fullName, password, phone }: SignupProps) => {
		try {
			setIsLoading(true);
			setError(null);

			const id = createUniqueId();

			// Create user account
			const response = await account.create(id, email, password, fullName);

			const session = await account.createEmailPasswordSession(email, password);

			if (!session.$id) throw new Error('Failed to create session');

			await databases.createDocument(config.databaseId, USERS_COLLECTION_ID, response.$id, {
				id: response.$id,
				dob,
				phone,
			});

			checkAuthAndRedirect();
		} catch (error: any) {
			console.log(error.message);
			setError(error.message || 'Signup failed. Please try again.');
			setIsLoading(false);
		}
	};

	// Check auth state on mount
	useEffect(() => {
		checkAuthAndRedirect();
	}, []);

	// Provide auth context
	const contextValue: AuthContextType = {
		user,
		isLoading,
		error,
		login,
		logout,
		signup,
	};

	// Determine what to render based on auth state
	const renderContent = () => {
		// Always show loading state during initial auth check
		if (!initialAuthCheckComplete || isLoading) {
			return <LoadingUI />;
		}

		// Show error UI if there's an error
		if (error) {
			return <ErrorUI message={error} retry={checkAuthAndRedirect} />;
		}

		// Special case for categories and budget screens - they should be visible
		// even if loading (determined by current route)
		
		const nav = useNavigation()
		const currentRoute = nav.getState().routes[nav.getState().index]?.name || '';
		const isSpecialRoute = ['categories', 'create-edit-budget'].includes(currentRoute);

		// If user exists or we're on a special route, show children
		if (user || isSpecialRoute) {
			return (
				<Animated.View
					className="flex-1"
					entering={FadeIn.duration(300)}
					layout={Layout.springify()}
				>
					{children}
				</Animated.View>
			);
		}

		// Default case: still loading or not authenticated
		return <LoadingUI />;
	};

	return <AuthContext.Provider value={contextValue}>{renderContent()}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
};

export default AuthProvider;
