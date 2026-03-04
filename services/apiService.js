import axios from 'axios';
import { authService } from './authService';

const API_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await authService.getToken();
    
    console.log('[API] Request to:', config.url);
    console.log('[API] Token exists:', !!token);
    console.log('[API] Token expired:', token ? authService.isTokenExpired(token) : 'N/A');
    
    if (token && !authService.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Authorization header set');
    } else {
      console.log('[API] No valid token - Authorization header NOT set');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Clear old invalid token
        await authService.logout();
        
        // Get or create device ID and re-authenticate
        let deviceId = await authService.getDeviceId();
        if (!deviceId) {
          deviceId = authService.generateDeviceId();
          await authService.storeDeviceId(deviceId);
        }
        
        // Re-authenticate anonymously
        const authResponse = await axios.post(`${API_URL}/api/v1/anonymous_sign_in`, {
          device_id: deviceId,
        });
        
        if (authResponse.data?.token) {
          await authService.storeToken(authResponse.data.token);
          await authService.storeUserData(authResponse.data.user);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${authResponse.data.token}`;
          return apiClient(originalRequest);
        }
      } catch (authError) {
        console.error('Re-authentication failed:', authError);
        // Fall through to reject the original error
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  async anonymousSignIn(deviceId, nickname = null) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/anonymous_sign_in`, {
        device_id: deviceId,
        nickname: nickname,
      });
      
      // Handle successful response
      if (response.data && response.data.token && response.data.user) {
        return { 
          success: true, 
          data: {
            token: response.data.token,
            user: response.data.user
          }
        };
      } else {
        return {
          success: false,
          error: 'Invalid response from server',
        };
      }
    } catch (error) {
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

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/v1/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  },

  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.patch('/api/v1/users/me', profileData);
      return { success: true, data: response.data };
    } catch (error) {
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
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit scramble',
      };
    }
  },

  async createScrambleMatch(sport = null) {
    try {
      const token = await authService.getToken();
      
      if (token) {
        console.log('Token is expired:', authService.isTokenExpired(token));
      }
      
      const requestBody = sport ? { sport } : {};      
      const response = await apiClient.post('/api/v1/scramble', requestBody);

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create scramble match',
      };
    }
  },

  async getLeaderboards() {
    try {
      const response = await apiClient.get('/api/v1/leaderboards');
      return { success: true, data: response.data };
    } catch (error) {
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
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch tag leaderboard',
      };
    }
  },

  async getUserProfile() {
    try {
      const response = await apiClient.get('/api/v1/user/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  },

  fetchSports: async (requireAuth = false) => {
    try {
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
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sports'
      };
    }
  },
};

export default apiClient;
