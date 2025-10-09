import axios from 'axios';
import { authService } from './authService';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    console.log('Request interceptor - Token exists:', !!token);
    
    if (token && !authService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Added Authorization header for:', config.url);
    } else {
      console.warn('Request interceptor - No valid token available for:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.error('Authentication failed - token may be expired or invalid');
      // For anonymous auth, we'll handle re-authentication at the context level
      await authService.logout();
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Anonymous authentication
  async anonymousSignIn(deviceId, nickname = null) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/anonymous_sign_in`, {
        device_id: deviceId,
        nickname: nickname,
      });
      
      // Handle successful response
      if (response.data && response.data.token && response.data.user) {
        console.log('we are here');
        console.log(response.data.message || 'Anonymous sign in successful');
        return { 
          success: true, 
          data: {
            token: response.data.token,
            user: response.data.user
          }
        };
      } else {
        console.error('Invalid response format:', response.data);
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
    } catch (error) {
      console.error('Anonymous sign in API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 422) {
        console.error('Validation error:', error.response.data);
        return {
          success: false,
          error: error.response.data?.errors?.join(', ') || error.response.data?.message || 'Validation failed',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Anonymous sign in failed',
      };
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/v1/me');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get current user API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  },

  // Update user profile (for upgrading anonymous accounts)
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.patch('/api/v1/users/me', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update user profile API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user profile',
      };
    }
  },

  // Matches endpoints
  async getMatches(matchType) {
    try {
      const response = await apiClient.get('/api/v1/matches', {
        params: { match_type: matchType },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get matches API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch matches',
      };
    }
  },

  async getMatch(matchId) {
    try {
      const response = await apiClient.get(`/api/v1/matches/${matchId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get match API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch match',
      };
    }
  },

  // Match sessions endpoints
  async createMatchSession(matchId) {
    try {
      const response = await apiClient.post(`/api/v1/matches/${matchId}/match_sessions`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create match session API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create match session',
      };
    }
  },

  async submitDuel(matchId, sessionId, winnerId) {
    try {
      const response = await apiClient.post(
        `/api/v1/matches/${matchId}/match_sessions/${sessionId}/submit_duel`,
        { winner_id: winnerId }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Submit duel API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit duel',
      };
    }
  },

  async submitRate(matchId, sessionId, momentId, skill, swagger) {
    try {
      const response = await apiClient.post(
        `/api/v1/matches/${matchId}/match_sessions/${sessionId}/submit_rate`,
        {
          moment_id: momentId,
          skill,
          swagger,
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Submit rate API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit rating',
      };
    }
  },

  async submitScramble(sessionId, winnerId, roundIndex) {
    try {
      const response = await apiClient.post(
        `api/v1/scramble/${sessionId}/submit_duel`,
        { 
          session_id: sessionId, 
          winner_id: winnerId, 
          round_index: roundIndex 
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Submit scramble API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit scramble',
      };
    }
  },

  async createScrambleMatch(sport = null) {
    try {
      console.log('Creating scramble match - checking token...');
      const token = await authService.getToken();
      console.log('Token available for scramble match:', !!token);
      
      if (token) {
        console.log('Token is expired:', authService.isTokenExpired(token));
      }
      
      // Prepare request body with sport parameter if provided
      const requestBody = sport ? { sport } : {};
      console.log('Creating scramble match with body:', requestBody);
      
      const response = await apiClient.post('/api/v1/scramble', requestBody);
      console.log('Scramble match created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create scramble match API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create scramble match',
      };
    }
  },

  // Leaderboard endpoints
  async getLeaderboards() {
    try {
      const response = await apiClient.get('/api/v1/leaderboards');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get leaderboards API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch leaderboards',
      };
    }
  },

  async getLeaderboard(sport, page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/api/v1/leaderboards/${sport}`, {
        params: { page, limit }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get leaderboard API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch leaderboard',
      };
    }
  },

  async getMomentRanking(sport, momentId) {
    try {
      const response = await apiClient.get(`/api/v1/leaderboards/${sport}/moment/${momentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get moment ranking API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch moment ranking',
      };
    }
  },

  async getTagLeaderboard(sport, tagId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get(`/api/v1/leaderboards/${sport}/tags/${tagId}`, {
        params: { page, limit }
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get tag leaderboard API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tag leaderboard',
      };
    }
  },

  // User profile endpoints
  async getUserProfile() {
    try {
      const response = await apiClient.get('/api/v1/user/profile');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get user profile API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  },

  // New method to fetch sports with optional authentication
  fetchSports: async (requireAuth = false) => {
    try {
      // For non-authenticated calls, use direct axios instead of apiClient
      const client = requireAuth ? apiClient : axios.create({
        baseURL: API_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await client.get('/api/v1/scramble/sports');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching sports:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sports'
      };
    }
  },
};

export default apiClient;
