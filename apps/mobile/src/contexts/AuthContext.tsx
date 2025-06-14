import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { authApi, type User } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading to check stored auth
  error: null,
};
// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider Component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  // Check for existing auth on app start
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      console.log('🔍 Checking stored auth...');

      const isAuth = await authApi.isAuthenticated();
      if (isAuth) {
        const user = await authApi.getStoredUser();
        if (user) {
          console.log('✅ Found stored auth for:', user.email);
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
          return;
        }
      }
      console.log('❌ No stored auth found');
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Failed to check authentication' });
    }
  };
  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('🔐 Attempting login for:', email);

      const response = await authApi.login(email, password);
      console.log('✅ Login successful:', response.user.email);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error; // Re-throw so component can handle UI feedback
    }
  };
  const logout = async (): Promise<void> => {
    try {
      console.log('🔐 Logging out...');

      await authApi.logout();
      dispatch({ type: 'AUTH_LOGOUT' });

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Even if logout fails, clear local state
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// Optional: Auth status hook for conditional rendering
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading, // App is ready when not loading
  };
};
