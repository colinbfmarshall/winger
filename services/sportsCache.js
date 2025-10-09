import AsyncStorage from '@react-native-async-storage/async-storage';

const SPORTS_CACHE_KEY = 'sports_cache';
const CACHE_EXPIRY_KEY = 'sports_cache_expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export const sportsCache = {
  // Store sports data with expiry
  async storeSports(sportsData) {
    try {
      const expiryTime = Date.now() + CACHE_DURATION;
      await AsyncStorage.setItem(SPORTS_CACHE_KEY, JSON.stringify(sportsData));
      await AsyncStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
      console.log('Sports cached successfully');
      return true;
    } catch (error) {
      console.error('Error caching sports:', error);
      return false;
    }
  },

  // Get cached sports data if not expired
  async getCachedSports() {
    try {
      const expiryTimeStr = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);
      const sportsDataStr = await AsyncStorage.getItem(SPORTS_CACHE_KEY);

      if (!expiryTimeStr || !sportsDataStr) {
        console.log('No cached sports data found');
        return null;
      }

      const expiryTime = parseInt(expiryTimeStr);
      const currentTime = Date.now();

      if (currentTime > expiryTime) {
        console.log('Cached sports data expired');
        await this.clearCache();
        return null;
      }

      console.log('Using cached sports data');
      return JSON.parse(sportsDataStr);
    } catch (error) {
      console.error('Error getting cached sports:', error);
      return null;
    }
  },

  // Clear sports cache
  async clearCache() {
    try {
      await AsyncStorage.removeItem(SPORTS_CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_EXPIRY_KEY);
      console.log('Sports cache cleared');
    } catch (error) {
      console.error('Error clearing sports cache:', error);
    }
  },

  // Check if cache is valid
  async isCacheValid() {
    try {
      const expiryTimeStr = await AsyncStorage.getItem(CACHE_EXPIRY_KEY);
      const sportsDataStr = await AsyncStorage.getItem(SPORTS_CACHE_KEY);

      if (!expiryTimeStr || !sportsDataStr) {
        return false;
      }

      const expiryTime = parseInt(expiryTimeStr);
      const currentTime = Date.now();

      return currentTime <= expiryTime;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }
};