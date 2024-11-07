import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Types
type ProfileStatus = {
  personal: boolean;
  finance: boolean;
  schedule?: boolean;
};

type User = {
  id: string;
  email: string;
  name?: string;
  profileStatus: ProfileStatus;
  token: string;
};

type AuthState = {
  isLoading: boolean;
  user: User | null;
};

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  profileComplete: boolean;
  financeComplete: boolean;
  scheduleComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
};

// Constants
const AUTH_API = {
  LOGIN: 'YOUR_API_URL/login',
  LOGOUT: 'YOUR_API_URL/logout',
  VERIFY_TOKEN: 'YOUR_API_URL/verify-token',
  USER_STATUS: 'YOUR_API_URL/user/status',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: 'auth',
  PERSONAL_PROFILE: 'create.profile',
  FINANCE_PROFILE: 'finance_setup',
  SCHEDULE_SETUP: 'calendar_setup',
} as const;

// Context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API utilities
const api = {
  async post<T>(url: string, body?: object, token?: string): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Network response was not ok');
    }

    return response.json();
  },

  async get<T>(url: string, token: string): Promise<T> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return response.json();
  },
};

// Provider component
interface AuthProviderProps {
  children: React.ReactNode;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  onAuthStateChange 
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [state, setState] = React.useState<AuthState>({
    isLoading: true,
    user: null,
  });

  // Computed properties
  const isAuthenticated = Boolean(state.user?.token);
  const profileComplete = Boolean(state.user?.profileStatus.personal);
  const financeComplete = Boolean(state.user?.profileStatus.finance);
  const scheduleComplete = Boolean(state.user?.profileStatus.schedule);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Handle auth state changes
  useEffect(() => {
    handleAuthStateChange();
    onAuthStateChange?.(isAuthenticated);
  }, [isAuthenticated, profileComplete, financeComplete, scheduleComplete]);

  const initializeAuth = async () => {
    try {
      const storedUser = await loadStoredUser();
      if (storedUser) {
        const isValid = await verifyToken(storedUser.token);
        if (isValid) {
          setState(prev => ({ ...prev, user: storedUser }));
        } else {
          await handleLogout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      Alert.alert('Error', 'Failed to restore authentication state');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadStoredUser = async (): Promise<User | null> => {
    // Implement your storage logic here
    return null;
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      await api.post(AUTH_API.VERIFY_TOKEN, undefined, token);
      return true;
    } catch {
      return false;
    }
  };

  const handleAuthStateChange = useCallback(() => {
    if (!state.isLoading) {
      if (!isAuthenticated) {
        navigation.navigate(ROUTES.LOGIN);
      } else if (!profileComplete) {
        navigation.navigate(ROUTES.PERSONAL_PROFILE);
      } else if (!financeComplete) {
        navigation.navigate(ROUTES.FINANCE_PROFILE);
      } else if (!scheduleComplete) {
        navigation.navigate(ROUTES.SCHEDULE_SETUP);
      }
    }
  }, [state.isLoading, isAuthenticated, profileComplete, financeComplete, scheduleComplete]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { user, token } = await api.post<{ user: User; token: string }>(
        AUTH_API.LOGIN,
        { email, password }
      );

      const userData: User = { ...user, token };
      setState({ isLoading: false, user: userData });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again';
      Alert.alert('Login Failed', message);
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      if (state.user?.token) {
        await api.post(AUTH_API.LOGOUT, undefined, state.user.token);
      }

      setState({ isLoading: false, user: null });
      router.navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout properly');
    }
  };

  const refreshUserStatus = async (): Promise<void> => {
    if (!state.user?.token) return;

    try {
      const updatedUser = await api.get<User>(
        AUTH_API.USER_STATUS,
        state.user.token
      );

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updatedUser } : null,
      }));
    } catch (error) {
      console.error('Status refresh error:', error);
      Alert.alert('Error', 'Failed to refresh user status');
    }
  };

  const value: AuthContextValue = {
    isLoading: state.isLoading,
    isAuthenticated,
    user: state.user,
    profileComplete,
    financeComplete,
    scheduleComplete,
    login,
    logout: handleLogout,
    refreshUserStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// HOC for protected routes
type RequiredFields = {
  profile?: boolean;
  finance?: boolean;
  schedule?: boolean;
};

export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFields: RequiredFields = {}
) => {
  const AuthHOC: React.FC<P> = (props) => {
    const { isAuthenticated, profileComplete, financeComplete, scheduleComplete } = useAuth();

    useEffect(() => {
      if (!isAuthenticated) {
        router.navigate(ROUTES.LOGIN);
        return;
      }

      if (requiredFields.profile && !profileComplete) {
        router.navigate(ROUTES.PERSONAL_PROFILE);
        return;
      }

      if (requiredFields.finance && !financeComplete) {
        router.navigate(ROUTES.FINANCE_PROFILE);
        return;
      }

      if (requiredFields.schedule && !scheduleComplete) {
        router.navigate(ROUTES.SCHEDULE_SETUP);
        return;
      }
    }, [isAuthenticated, profileComplete, financeComplete, scheduleComplete]);

    return <WrappedComponent {...props} />;
  };

  AuthHOC.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthHOC;
};

export default AuthProvider;