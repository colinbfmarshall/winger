# Anonymous Authentication Implementation

This document outlines the anonymous user authentication system implemented in the Winger React Native app.

## Overview

The app now uses anonymous user accounts with JWT authentication to provide frictionless onboarding while maintaining user identity for gameplay data. Users are automatically authenticated without requiring email/password registration.

## Key Features

- **Frictionless Onboarding**: Users can start playing immediately without any registration
- **Persistent Identity**: All gameplay data is tied to a persistent anonymous user account
- **JWT Security**: Secure JWT token-based authentication for API protection
- **Upgrade Path**: Anonymous users can upgrade to full accounts in the future
- **Device-Based**: Each device gets a unique anonymous user account

## Architecture

### 1. Anonymous User Creation
- App automatically creates anonymous users on first launch
- Each user gets a unique UUID as their primary key
- Device ID used to prevent duplicate account creation
- Optional nickname can be set by users

### 2. JWT Token Management
- JWT tokens issued for all anonymous users
- Tokens stored securely in React Native Keychain
- No refresh tokens needed (simpler flow)
- Re-authentication creates new anonymous user if token expires

### 3. User Data Storage
- User profile data stored in AsyncStorage
- Device ID stored for re-authentication prevention
- All gameplay progress tied to user UUID

## Implementation Details

### AuthService Changes
- Removed refresh token management
- Added device ID generation and storage
- Simplified token storage (single JWT only)
- Added anonymous user creation logic

### API Service Updates
- Replaced login/signup with `anonymousSignIn`
- Added `getCurrentUser` for profile fetching
- Updated `updateUserProfile` for nickname/upgrade functionality
- Simplified error handling (no token refresh)

### Auth Context Updates
- Auto-creation of anonymous users on app start
- Profile update functionality for nicknames
- Account reset instead of logout
- User upgrade path preparation

### UI Changes
- Updated ProfileScreen for anonymous users
- Editable nickname functionality
- Account reset option
- Upgrade hints for future features

## Backend Requirements

The Rails backend should implement these endpoints:

### 1. Anonymous Sign In
```
POST /api/v1/anonymous_sign_in
Body: {
  "device_id": "device_12345",
  "nickname": "optional_nickname"
}
Response: {
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "nickname": "nickname",
    "device_id": "device_12345",
    "created_at": "timestamp"
  }
}
```

### 2. Get Current User
```
GET /api/v1/me
Headers: Authorization: Bearer jwt_token
Response: {
  "user": {
    "id": "uuid",
    "nickname": "nickname",
    "device_id": "device_12345",
    "email": null,
    "created_at": "timestamp"
  }
}
```

### 3. Update User Profile
```
PATCH /api/v1/users/me
Headers: Authorization: Bearer jwt_token
Body: {
  "nickname": "new_nickname",
  "email": "optional_email_for_upgrade"
}
Response: {
  "user": {
    "id": "uuid",
    "nickname": "new_nickname",
    "email": "email_if_upgraded",
    "device_id": "device_12345"
  }
}
```

### 4. Protected Gameplay Endpoints
All existing gameplay endpoints remain the same but now require JWT authentication:
```
Headers: Authorization: Bearer jwt_token
```

## Rails Backend Implementation Guide

### 1. User Model Updates
```ruby
class User < ApplicationRecord
  # Use UUID as primary key
  self.primary_key = 'id'
  
  # Include only JWT authentication
  devise :jwt_authenticatable,
         jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null
  
  # Remove email/password requirements
  validates :nickname, length: { maximum: 50 }, allow_blank: true
  validates :device_id, presence: true, uniqueness: true
  
  # UUID generation
  before_create :generate_uuid
  
  private
  
  def generate_uuid
    self.id = SecureRandom.uuid if id.blank?
  end
end
```

### 2. Anonymous Auth Controller
```ruby
class Api::V1::AnonymousAuthController < ApplicationController
  def sign_in
    device_id = params[:device_id]
    
    # Check if user already exists for this device
    user = User.find_by(device_id: device_id)
    
    if user.nil?
      # Create new anonymous user
      user = User.create!(
        device_id: device_id,
        nickname: params[:nickname]
      )
    end
    
    # Generate JWT token
    token = JWT.encode(
      { user_id: user.id, exp: 30.days.from_now.to_i },
      Rails.application.credentials.devise_jwt_secret_key
    )
    
    render json: {
      token: token,
      user: user.as_json(only: [:id, :nickname, :device_id, :created_at])
    }
  end
  
  def me
    render json: {
      user: current_user.as_json(only: [:id, :nickname, :device_id, :email, :created_at])
    }
  end
end
```

### 3. Users Controller for Updates
```ruby
class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!
  
  def update
    if current_user.update(user_params)
      render json: {
        user: current_user.as_json(only: [:id, :nickname, :device_id, :email, :created_at])
      }
    else
      render json: { error: current_user.errors.full_messages }, status: 422
    end
  end
  
  private
  
  def user_params
    params.permit(:nickname, :email)
  end
end
```

### 4. Devise Configuration
```ruby
# config/initializers/devise.rb
Devise.setup do |config|
  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key
    jwt.dispatch_requests = []
    jwt.revocation_requests = []
    jwt.expiration_time = 30.days.to_i
  end
end
```

### 5. Routes
```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'anonymous_sign_in', to: 'anonymous_auth#sign_in'
      get 'me', to: 'anonymous_auth#me'
      patch 'users/me', to: 'users#update'
      
      # Existing protected routes
      resources :matches do
        resources :match_sessions
      end
    end
  end
end
```

## Benefits

### For Users
- **Instant Access**: No barriers to start playing
- **Persistent Progress**: Gameplay data saved automatically
- **Privacy Friendly**: No personal information required
- **Upgrade Option**: Can add email/social login later

### For Developers
- **Simplified Auth Flow**: No complex registration/verification
- **Better Analytics**: All users are authenticated users
- **Data Consistency**: Every action tied to a user account
- **Conversion Funnel**: Easy upgrade path to full accounts

### For Business
- **Higher Conversion**: No signup friction
- **Better Retention**: Progress is saved from day one
- **Growth Potential**: Easier to re-engage anonymous users
- **Data Quality**: Complete user journey tracking

## User Experience Flow

1. **First Launch**: App creates anonymous user automatically
2. **Immediate Play**: User can start playing right away
3. **Progress Saved**: All gameplay tied to their anonymous account
4. **Personalization**: User can set nickname if desired
5. **Future Upgrade**: Option to add email/social login later

## Migration from Email/Password

If migrating from email/password authentication:
1. Anonymous users can upgrade by adding email
2. Existing email users remain unchanged
3. Gradual migration as users return to app
4. Maintain backward compatibility during transition

## Security Considerations

- JWT tokens expire after 30 days
- Device ID prevents multiple accounts per device
- All API endpoints protected with JWT
- No sensitive data stored for anonymous users
- Account reset available if device lost/sold

## Testing

```javascript
// Test anonymous user creation
const { user, token } = await createAnonymousUser();
expect(user.id).toBeTruthy();
expect(token).toBeTruthy();

// Test nickname update
const updated = await updateUserProfile({ nickname: 'TestPlayer' });
expect(updated.user.nickname).toBe('TestPlayer');

// Test API protection
const response = await apiCall('/api/v1/matches');
expect(response.headers.authorization).toContain('Bearer');
```

This anonymous authentication approach provides the best balance of user experience, security, and business value while maintaining a clear upgrade path for the future.
