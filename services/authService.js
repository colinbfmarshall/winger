import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';
const DEVICE_ID_KEY = 'device_id';
const INSTALL_CHECK_KEY = 'app_installed';

export const authService = {
  // Check if this is a fresh install and clear stale Keychain data
  async checkFreshInstall() {
    try {
      const installed = await AsyncStorage.getItem(INSTALL_CHECK_KEY);
      if (!installed) {
        // Fresh install - AsyncStorage is empty but Keychain may have old data
        console.log('[Auth] Fresh install detected, clearing stale Keychain data');
        await Keychain.resetInternetCredentials(TOKEN_KEY);
        await AsyncStorage.setItem(INSTALL_CHECK_KEY, 'true');
      }
    } catch (error) {
      console.error('[Auth] Error checking fresh install:', error);
    }
  },

  async storeToken(token) {
    try {
      await Keychain.setInternetCredentials(
        TOKEN_KEY,
        'jwt',
        token
      );
      
      return true;
    } catch (error) {
      
      try {
        await AsyncStorage.setItem(`${TOKEN_KEY}_fallback`, token);
        return true;
      } catch (asyncError) {
        return false;
      }
    }
  },

  
  async getToken() {
    try {
      const credentials = await Keychain.getInternetCredentials(TOKEN_KEY);
      if (credentials) {
        return credentials.password;
      }
    } catch (error) {
    }
    
    try {
      const token = await AsyncStorage.getItem(`${TOKEN_KEY}_fallback`);
      if (token) {
        return token;
      }
      return null;
    } catch (asyncError) {
      return null;
    }
  },

  async storeUserData(userData) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      return false;
    }
  },

  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  async storeDeviceId(deviceId) {
    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getDeviceId() {
    try {
      return await AsyncStorage.getItem(DEVICE_ID_KEY);
    } catch (error) {
      return null;
    }
  },

  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  async logout() {
    try {
      try {
        await Keychain.resetInternetCredentials(TOKEN_KEY);
      } catch (keychainError) {
      }
      
      await AsyncStorage.removeItem(`${TOKEN_KEY}_fallback`);
      await AsyncStorage.removeItem(USER_KEY);

      return true;
    } catch (error) {
      return false;
    }
  },

  isTokenExpired(token) {
    if (!token) {
      return true;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      return isExpired;
    } catch (error) {
      return true;
    }
  }
};
