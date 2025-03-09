import { createContext, useEffect, useContext, ReactNode } from 'react';
import { router } from 'expo-router';
import { account, config, databases, getCurrentUser } from 'src/lib/appwrite';
import { createUniqueId } from './store';
import useStore from 'src/store/useStore';
import { use$, useObservable } from '@legendapp/state/react';

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

const AuthProvider = ({ children }: { children: ReactNode }) => {
	const state$ = useObservable({
		user: null as User | null,
		isLoading: true,
		error: null as null | string,
	});
const { user, error, isLoading } = use$(state$)

const setUser = state$.user.set
const setIsLoading = state$.isLoading.set
const setError = state$.error.set;
	const { categories } = useStore();
	
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

				// Get user preferences
				if (categories.length === 0 || null) {
					router.navigate('categories');
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

			const id = createUniqueId()
			
			// Create user account
			const response = await account.create(id, email, password, fullName);

			const session = await account.createEmailPasswordSession(email, password);

			if(!session.$id) throw new Error('Failed to create session Created')
				
			await databases.createDocument(
				config.databaseId,
				USERS_COLLECTION_ID,
				response.$id,
				{
					id: response.$id,
					dob,
					phone
				}
			);

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