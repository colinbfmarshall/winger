# JWT Authentication Implementation

This document outlines the JWT authentication system implemented in the Winger React Native app.

## Overview

The app now uses JWT (JSON Web Token) authentication to secure API communications with the Rails backend. This implementation includes:

- Secure token storage using React Native Keychain
- Automatic token refresh
- Protected API routes
- Login/Signup flow
- Authentication context management

## Architecture

### Key Components

1. **AuthService** (`services/authService.js`)
   - Handles secure token storage/retrieval
   - Uses React Native Keychain for JWT tokens
   - Uses AsyncStorage for user data
   - Token expiration checking

2. **AuthContext** (`contexts/AuthContext.js`)
   - React Context for authentication state management
   - Provides login, signup, logout functions
   - Handles token restoration on app start

3. **ApiService** (`services/apiService.js`)
   - Centralized API client with axios
   - Automatic JWT token injection
   - Token refresh interceptor
   - All API endpoints wrapped with authentication

4. **Authentication Flow**
   - Login/Signup screens (`components/auth/`)
   - Auth navigator for unauthenticated users
   - Automatic redirect based on auth state

## Implementation Details

### Token Storage
- **JWT tokens**: Stored securely in React Native Keychain
- **Refresh tokens**: Stored securely in React Native Keychain  
- **User data**: Stored in AsyncStorage (non-sensitive data)

### API Integration
All existing API calls have been updated to use the new `apiService`:
- Matches endpoints
- Match sessions
- Duel submissions
- Rate submissions
- Scramble matches

### Authentication Flow
1. App starts → Check for existing valid token
2. If valid token exists → Navigate to main app
3. If no valid token → Show login/signup screens
4. After successful login → Store tokens and navigate to main app
5. On API calls → Automatically inject JWT token
6. If token expires → Attempt refresh, logout if refresh fails

## Dependencies Added

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "react-native-keychain": "^10.0.0"
}
```

## Backend Requirements

The Rails backend should implement these endpoints:

### Authentication Endpoints
- `POST /api/v1/auth/login`
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
  Response:
  ```json
  {
    "token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```

- `POST /api/v1/auth/signup`
  ```json
  {
    "email": "user@example.com",
    "password": "password",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/v1/auth/refresh`
  ```json
  {
    "refresh_token": "refresh_token_here"
  }
  ```

- `POST /api/v1/auth/logout`
  (Headers: Authorization: Bearer jwt_token)

### Protected Endpoints
All existing API endpoints should now require JWT authentication:
- Authorization header: `Bearer {jwt_token}`
- Return 401 for invalid/expired tokens

## Usage Examples

### Using the Auth Context
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      // Login successful
    }
  };
};
```

### Making API Calls
```javascript
import { apiService } from '../services/apiService';

const fetchMatches = async () => {
  const response = await apiService.getMatches('duel');
  if (response.success) {
    setMatches(response.data);
  }
};
```

## Security Features

1. **Secure Storage**: JWT tokens stored in React Native Keychain (encrypted)
2. **Token Expiration**: Automatic checking and refresh of expired tokens
3. **Automatic Logout**: If refresh fails, user is automatically logged out
4. **Request Interceptors**: All API requests automatically include valid JWT tokens
5. **Error Handling**: Graceful handling of authentication errors

## Testing

To test the authentication system:

1. Start the app without existing tokens → Should show login screen
2. Login with valid credentials → Should navigate to main app
3. Make API calls → Should include JWT token in headers
4. Logout → Should clear tokens and return to login screen
5. Test with expired token → Should attempt refresh automatically

## Troubleshooting

### Common Issues

1. **Keychain Access Issues**: Ensure iOS simulator/device has keychain access
2. **Token Refresh Failures**: Check backend refresh endpoint implementation
3. **Network Errors**: Verify API URL configuration in development vs production

### Debug Logging

The implementation includes console logging for debugging:
- Token storage/retrieval operations
- API call successes/failures
- Authentication state changes

## Future Enhancements

Potential improvements:
1. Biometric authentication (Touch ID/Face ID)
2. Social login (Google, Apple)
3. Password reset functionality
4. Multi-factor authentication
5. Session management improvements
