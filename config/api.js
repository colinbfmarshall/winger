// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000'
    : 'https://gentle-beyond-34147-45b7e7bcdf51.herokuapp.com',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      ANONYMOUS_SIGN_IN: '/api/v1/anonymous_sign_in',
      ME: '/api/v1/me',
    },
    MATCHES: {
      LIST: '/api/v1/matches',
      DETAIL: (id) => `/api/v1/matches/${id}`,
      CREATE_SCRAMBLE: '/api/v1/matches/create_scramble_match',
    },
    MATCH_SESSIONS: {
      CREATE: (matchId) => `/api/v1/matches/${matchId}/match_sessions`,
      SUBMIT_DUEL: (matchId, sessionId) => `/api/v1/matches/${matchId}/match_sessions/${sessionId}/submit_duel`,
      SUBMIT_RATE: (matchId, sessionId) => `/api/v1/matches/${matchId}/match_sessions/${sessionId}/submit_rate`,
      SUBMIT_SCRAMBLE: (matchId, sessionId) => `/api/v1/matches/${matchId}/match_sessions/${sessionId}/submit_scramble`,
    },
    USER: {
      PROFILE: '/api/v1/users/me',
    },
  },
};

export default API_CONFIG;
