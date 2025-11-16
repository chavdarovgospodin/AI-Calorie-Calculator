import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';

import {
  AuthAction,
  AuthContextType,
  AuthProviderProps,
  AuthState,
} from './interfaces';
import {
  getStoredUser,
  isAuthenticated,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  isTokenExpired,
  refreshTokens,
} from '@/services/auth';
import { AppState, AppStateStatus } from 'react-native';
import { RegisterData } from '@/types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const appState = useRef(AppState.currentState);
  // const navigation = useNavigation();

  useEffect(() => {
    checkStoredAuth();

    // Set up app state listener for foreground refresh
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      state.isAuthenticated
    ) {
      // App has come to foreground - check if token needs refresh
      const expired = await isTokenExpired();
      if (expired) {
        const success = await refreshTokens();
        if (!success) {
          dispatch({ type: 'AUTH_LOGOUT' });
          // navigation.navigate('Login' as never);
        }
      }
    }
    appState.current = nextAppState;
  };

  const checkStoredAuth = async () => {
    try {
      const isAuth = await isAuthenticated();
      if (isAuth) {
        // Check if token is expired
        const expired = await isTokenExpired();
        if (expired) {
          const success = await refreshTokens();
          if (!success) {
            dispatch({ type: 'AUTH_LOGOUT' });
            return;
          }
        }

        const user = await getStoredUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
          return;
        }
      }
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: `Failed to check authentication ${error}`,
      });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authLogin(email, password);

      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authRegister(registerData);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      console.error('❌ Register failed:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authLogout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('❌ Logout failed:', error);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
};
