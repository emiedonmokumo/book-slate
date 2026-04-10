# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration for the BookSlate API.

## Prerequisites

1. A Google Cloud Console project
2. Admin user configured in your system (set via ADMIN_EMAIL environment variable)

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the consent screen if prompted
4. Application type: "Web application"
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - Your production callback URL
6. Save and copy the Client ID and Client Secret

### 3. Environment Configuration

1. Copy `.env.example` to `.env`
2. Fill in the Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
ADMIN_EMAIL=your-admin-email@gmail.com
```

### 4. Admin User Setup

Ensure you have an admin user with the email specified in the ADMIN_EMAIL environment variable in your system. This user's calendar connection will be used for all appointment bookings.

## API Endpoints

### Calendar Connection (Admin Only)

#### Get Google OAuth URL
```
GET /auth/google/url
Authorization: Bearer <admin-jwt-token>
```
Returns the Google OAuth URL for calendar connection.

#### Handle OAuth Callback
```
POST /auth/google/callback
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "code": "oauth-authorization-code"
}
```
Processes the OAuth callback and stores calendar tokens.

#### Check Connection Status
```
GET /auth/calendar/status
```
Returns the current calendar connection status.

#### Disconnect Calendar
```
POST /auth/calendar/disconnect
Authorization: Bearer <admin-jwt-token>
```
Removes calendar connection.

### Calendar Operations

#### Create Calendar Event
```
POST /calendar/events
Content-Type: application/json

{
  "summary": "Meeting Title",
  "description": "Meeting description",
  "startTime": "2024-12-01T10:00:00Z",
  "endTime": "2024-12-01T11:00:00Z",
  "attendees": ["attendee@example.com"]
}
```

#### Get Available Time Slots
```
GET /calendar/available-slots?date=2024-12-01&duration=60
```
Returns available appointment slots for the specified date.

## Integration Flow

### Frontend Integration Flow

1. **Check Calendar Status**: Call `GET /auth/calendar/status` to check if calendar is connected
2. **Connect Calendar** (Admin only):
   - Call `GET /auth/google/url` to get OAuth URL
   - Redirect admin to the OAuth URL
   - Handle the callback and extract the authorization code
   - Call `POST /auth/google/callback` with the code
3. **Book Appointments**: Once connected, appointment confirmations will automatically create calendar events

### Appointment Lifecycle

1. **Create Appointment**: User creates appointment (status: PENDING)
2. **Confirm Appointment**: Admin confirms → Calendar event created automatically
3. **Update Appointment**: Changes sync to calendar event
4. **Cancel Appointment**: Calendar event is deleted automatically

## Error Handling

- **Calendar Not Connected**: Returns 400 error with message "Admin calendar not connected"
- **Token Expired**: Automatically attempts to refresh the access token
- **API Errors**: Logs warnings but continues with appointment operations

## Security Notes

- Only admin users can connect/disconnect calendar
- Calendar operations fail gracefully if calendar is not connected
- Tokens are stored securely in the database
- OAuth flow requires HTTPS in production

## Testing

1. Ensure admin user exists with the email specified in ADMIN_EMAIL environment variable
2. Set up Google OAuth credentials
3. Test calendar connection flow
4. Create and confirm an appointment to verify calendar integration

## Production Considerations

- Use HTTPS for OAuth redirect URIs
- Store environment variables securely
- Monitor calendar API quota limits
- Implement proper error logging and monitoring