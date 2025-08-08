import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';
const DEVICE_ID_KEY = 'device_id';

export const authService = {
  // Store JWT token securely (with fallback to AsyncStorage)
  async storeToken(token) {
    try {
      // Try keychain first for better security
      await Keychain.setInternetCredentials(
        TOKEN_KEY,
        'jwt',
        token
      );
      
      console.log('Token stored successfully in Keychain');
      return true;
    } catch (error) {
      console.warn('Keychain not available, falling back to AsyncStorage:', error.message);
      
      try {
        // Fallback to AsyncStorage if Keychain is not available
        await AsyncStorage.setItem(`${TOKEN_KEY}_fallback`, token);
        console.log('Token stored successfully in AsyncStorage (fallback)');
        return true;
      } catch (asyncError) {
        console.error('Error storing token in AsyncStorage:', asyncError);
        return false;
      }
    }
  },

  // Get JWT token (with fallback from AsyncStorage)
  async getToken() {
    try {
      const credentials = await Keychain.getInternetCredentials(TOKEN_KEY);
      if (credentials) {
        console.log('Token retrieved successfully from Keychain');
        return credentials.password;
      }
      console.log('No token found in keychain, checking AsyncStorage fallback');
    } catch (error) {
      console.warn('Keychain not available, checking AsyncStorage fallback:', error.message);
    }
    
    try {
      // Try AsyncStorage fallback
      const token = await AsyncStorage.getItem(`${TOKEN_KEY}_fallback`);
      if (token) {
        console.log('Token retrieved successfully from AsyncStorage (fallback)');
        return token;
      }
      console.log('No token found in AsyncStorage fallback either');
      return null;
    } catch (asyncError) {
      console.error('Error getting token from AsyncStorage:', asyncError);
      return null;
    }
  },

  // Store user data
  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  },

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Store device ID for anonymous authentication
  async storeDeviceId(deviceId) {
    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      return true;
    } catch (error) {
      console.error('Error storing device ID:', error);
      return false;
    }
  },

  // Get device ID
  async getDeviceId() {
    try {
      return await AsyncStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      console.error('Error getting device ID:', error);
      return null;
    }
  },

  // Generate a unique device ID
  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // Remove all authentication data
  async logout() {
    try {
      // Try to clear from Keychain
      try {
        await Keychain.resetInternetCredentials(TOKEN_KEY);
        console.log('Token cleared from Keychain');
      } catch (keychainError) {
        console.warn('Could not clear Keychain (not available):', keychainError.message);
      }
      
      // Clear AsyncStorage fallback
      await AsyncStorage.removeItem(`${TOKEN_KEY}_fallback`);
      await AsyncStorage.removeItem(USER_KEY);
      console.log('Token and user data cleared from AsyncStorage');
      
      // Keep device ID for potential re-authentication
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },

  // Check if token is expired (basic check)
  isTokenExpired(token) {
    if (!token) {
      console.log('Token validation: No token provided');
      return true;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      console.log('Token validation:', {
        expired: isExpired,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        currentTime: new Date(currentTime * 1000).toISOString()
      });
      
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
};
