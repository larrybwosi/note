import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { router } from 'expo-router';
import { account, config, databases, getCurrentUser } from 'src/lib/appwrite';
import { createUniqueId } from './store';

// Define user type
interface User {
	$id: string;
	email: string;
	name?: string;
	// Add other user properties as needed
}

// Define user preferences type (including finance setup status)
interface UserPreferences {
	financeSetupComplete: boolean;
	profileComplete: boolean;
	// Add other preference properties as needed
}

interface SignupProps {
	email: string;
	password: string;
	name: string;
}
// Auth context type definition
interface AuthContextType {
	user: User | null;
	preferences: UserPreferences | null;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	signup: (data: SignupProps) => Promise<void>;
	refreshUserData: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// User preferences collection ID and default values
const PREFERENCES_COLLECTION_ID = config.userPrefrencesCollectionId;
const DEFAULT_PREFERENCES: UserPreferences = {
	financeSetupComplete: false,
	profileComplete: false,
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [preferences, setPreferences] = useState<UserPreferences | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Function to fetch user preferences
	const fetchUserPreferences = async (userId: string): Promise<UserPreferences> => {
		try {
			const response = await databases.getDocument(
				config.databaseId, // Replace with your database ID
				PREFERENCES_COLLECTION_ID,
				userId
			);

			return response as unknown as UserPreferences;
		} catch (error) {
			// If preferences don't exist, create them with default values
			const newPreferences = {
				...DEFAULT_PREFERENCES,
				userId,
			};

			await databases.createDocument(
				config.databaseId, // Replace with your database ID
				PREFERENCES_COLLECTION_ID,
				userId,
				newPreferences
			);

			return newPreferences;
		}
	};

	// Check auth state and redirect based on conditions
	const checkAuthAndRedirect = async () => {
		try {
			setIsLoading(true);

			// Get current session
			const session = await account.getSession('current');

			if (session) {
				// Get user account
				const userData = await getCurrentUser();
				setUser(userData as User);

				// Get user preferences
				const userPreferences = await fetchUserPreferences(userData?.$id || '');
				setPreferences(userPreferences);

				// Handle navigation based on user state
				if (!userPreferences.financeSetupComplete) {
					router.navigate('setup');
				} else if (!userPreferences.profileComplete) {
					router.navigate('profile');
				}
			} else {
				// No active session, navigate to welcome screen
				setUser(null);
				setPreferences(null);
				router.navigate('splash');
			}
		} catch (error) {
			// Handle error (likely no active session)
			setUser(null);
			setPreferences(null);
			router.navigate('splash');
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch user data and preferences
	const refreshUserData = async () => {
		if (user?.$id) {
			const userPreferences = await fetchUserPreferences(user.$id);
			setPreferences(userPreferences);
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
			setPreferences(null);
			router.navigate('/splash');
		} catch (error: any) {
			console.log('Logout error: ', error);
			setError(error.message || 'Logout failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	const signup = async ({ email, name, password }: SignupProps) => {
		try {
			setIsLoading(true);
			setError(null);

			// Create user account
			const response = await account.create(createUniqueId(), email, password, name);
			console.log(response);

			// Automatically log in after signup
			await account.createEmailPasswordSession(email, password);

			// Initialize user preferences
			await databases.createDocument(
				config.databaseId, // Replace with your database ID
				PREFERENCES_COLLECTION_ID,
				response.$id,
				{
					...DEFAULT_PREFERENCES,
					userId: response.$id,
				}
			);

			checkAuthAndRedirect();
		} catch (error: any) {
			console.log(error);
			setError(error.message || 'Signup failed. Please try again.');
			setIsLoading(false);
		}
	};

	// Check auth state on mount
	useEffect(() => {
		checkAuthAndRedirect();

		// Setup a listener for Appwrite auth changes (optional)
		// You may need to implement a custom solution for this in React Native

		return () => {
			// Cleanup if necessary
		};
	}, []);

	// Provide auth context
	const contextValue: AuthContextType = {
		user,
		preferences,
		isLoading,
		error,
		login,
		logout,
		signup,
		refreshUserData,
	};

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
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