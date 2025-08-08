import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  isAnonymous: true, // All users start as anonymous
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOADING: 'LOADING',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isAnonymous: action.payload.isAnonymous ?? true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isAnonymous: true,
        isLoading: false,
        error: action.payload.error,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isAnonymous: true,
        isLoading: false,
        error: null,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...state,
        isAuthenticated: action.payload.token !== null,
        user: action.payload.user,
        token: action.payload.token,
        isAnonymous: action.payload.isAnonymous ?? true,
        isLoading: false,
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user,
        isAnonymous: action.payload.isAnonymous ?? state.isAnonymous,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore authentication state on app start
  useEffect(() => {
    const restoreAuth = async () => {
      console.log('Starting auth restoration...');
      try {
        const token = await authService.getToken();
        const userData = await authService.getUserData();
        
        console.log('Auth restoration - Token exists:', !!token);
        console.log('Auth restoration - User data exists:', !!userData);
        
        if (token && !authService.isTokenExpired(token)) {
          console.log('Valid token found, restoring auth state');
          dispatch({
            type: AUTH_ACTIONS.RESTORE_TOKEN,
            payload: { 
              token, 
              user: userData,
              isAnonymous: !userData?.email // Anonymous if no email
            },
          });
        } else {
          console.log('No valid token found, creating anonymous user');
          // Token expired or doesn't exist - create anonymous user
          await createAnonymousUser();
        }
      } catch (error) {
        console.error('Error restoring auth:', error);
        console.log('Auth restoration failed, creating anonymous user');
        await createAnonymousUser();
      }
    };

    restoreAuth();
  }, []);

  // Create anonymous user
  const createAnonymousUser = async () => {
    dispatch({ type: AUTH_ACTIONS.LOADING });
    
    try {
      let deviceId = await authService.getDeviceId();
      if (!deviceId) {
        deviceId = authService.generateDeviceId();
        await authService.storeDeviceId(deviceId);
        console.log('Generated new device ID:', deviceId);
      } else {
        console.log('Using existing device ID:', deviceId);
      }

      console.log('Attempting anonymous sign in with device ID:', deviceId);
      const { apiService } = await import('../services/apiService');
      const response = await apiService.anonymousSignIn(deviceId);
      
      if (response.success) {
        const { token, user } = response.data;
        console.log('Anonymous sign in successful for user:', user.id);
        
        // Store token and user data
        await authService.storeToken(token);
        await authService.storeUserData(user);
        
        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: { token, user, isAnonymous: true },
        });
        
        return { success: true };
      } else {
        console.error('Anonymous sign in failed:', response.error);
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: { error: response.error || 'Failed to create anonymous user' },
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Create anonymous user error:', error);
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: 'Network error. Please try again.' },
      });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update user profile (e.g., add nickname, upgrade to full account)
  const updateUserProfile = async (profileData) => {
    dispatch({ type: AUTH_ACTIONS.LOADING });
    
    try {
      const { apiService } = await import('../services/apiService');
      const response = await apiService.updateUserProfile(profileData);
      
      if (response.success) {
        const { user } = response.data;
        
        // Update stored user data
        await authService.storeUserData(user);
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { 
            user, 
            isAnonymous: !user.email // No longer anonymous if email is set
          },
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: { error: response.error || 'Profile update failed' },
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: { error: 'Network error. Please try again.' },
      });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      const { apiService } = await import('../services/apiService');
      const response = await apiService.getCurrentUser();
      
      if (response.success) {
        const { user } = response.data;
        await authService.storeUserData(user);
        
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { 
            user, 
            isAnonymous: !user.email
          },
        });
        
        return { success: true };
      }
    } catch (error) {
      console.error('Refresh user data error:', error);
    }
    return { success: false };
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Re-authenticate (create new anonymous user if needed)
  const reAuthenticate = async () => {
    await logout();
    return await createAnonymousUser();
  };

  // Dummy login function for backward compatibility (not used with anonymous auth)
  const login = async (email, password) => {
    console.warn('Traditional login not supported with anonymous authentication');
    return { success: false, error: 'This app uses anonymous authentication' };
  };

  const value = {
    ...state,
    createAnonymousUser,
    updateUserProfile,
    refreshUserData,
    logout,
    clearError,
    reAuthenticate,
    login, // For backward compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
