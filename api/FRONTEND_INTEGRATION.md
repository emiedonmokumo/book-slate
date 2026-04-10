# Calendar Integration API Endpoints

This document outlines the available API endpoints for Google Calendar integration in the BookSlate API.

## Authentication

Most calendar-related endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## Endpoints Overview

### 1. Calendar Connection Management

#### Get Google OAuth URL (Admin Only)
**Endpoint:** `GET /auth/google/url`  
**Auth Required:** Yes (Admin only)  
**Description:** Returns the Google OAuth URL for calendar connection.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

#### Handle OAuth Callback (Admin Only)
**Endpoint:** `POST /auth/google/callback`  
**Auth Required:** Yes (Admin only)  
**Description:** Processes the OAuth callback and stores calendar tokens.

**Request Body:**
```json
{
  "code": "4/0AdQt8qh7..."
}
```

**Response:**
```json
{
  "message": "Calendar connected successfully",
  "connected": true,
  "adminEmail": "admin@example.com"
}
```

#### Check Calendar Connection Status
**Endpoint:** `GET /auth/calendar/status`  
**Auth Required:** No  
**Description:** Returns the current calendar connection status.

**Response:**
```json
{
  "message": "Calendar is connected",
  "connected": true,
  "adminEmail": "admin@example.com"
}
```

#### Disconnect Calendar (Admin Only)
**Endpoint:** `POST /auth/calendar/disconnect`  
**Auth Required:** Yes (Admin only)  
**Description:** Removes calendar connection.

**Response:**
```json
{
  "message": "Calendar disconnected successfully",
  "connected": false,
  "adminEmail": "admin@example.com"
}
```

### 2. Calendar Operations

#### Create Calendar Event
**Endpoint:** `POST /calendar/events`  
**Auth Required:** No  
**Description:** Creates a new calendar event.

**Request Body:**
```json
{
  "summary": "Client Meeting",
  "description": "Meeting with John Doe",
  "startTime": "2024-12-01T10:00:00Z",
  "endTime": "2024-12-01T11:00:00Z",
  "attendees": ["client@example.com"]
}
```

**Response:**
```json
{
  "eventId": "abc123...",
  "htmlLink": "https://calendar.google.com/event?eid=...",
  "status": "confirmed"
}
```

#### Update Calendar Event
**Endpoint:** `PUT /calendar/events/:eventId`  
**Auth Required:** No  
**Description:** Updates an existing calendar event.

**Request Body:**
```json
{
  "summary": "Updated Meeting Title",
  "startTime": "2024-12-01T11:00:00Z",
  "endTime": "2024-12-01T12:00:00Z"
}
```

#### Delete Calendar Event
**Endpoint:** `DELETE /calendar/events/:eventId`  
**Auth Required:** No  
**Description:** Deletes a calendar event.

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### Get Available Time Slots
**Endpoint:** `GET /calendar/available-slots`  
**Auth Required:** No  
**Description:** Returns available appointment slots for a specific date.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format
- `duration` (optional): Appointment duration in minutes (default: 60)

**Example:** `/calendar/available-slots?date=2024-12-01&duration=60`

**Response:**
```json
[
  {
    "startTime": "2024-12-01T09:00:00.000Z",
    "endTime": "2024-12-01T10:00:00.000Z"
  },
  {
    "startTime": "2024-12-01T11:00:00.000Z",
    "endTime": "2024-12-01T12:00:00.000Z"
  }
]
```

## Integration Flow for Frontend

### Step 1: Check Calendar Connection Status

```javascript
const response = await fetch('/auth/calendar/status');
const status = await response.json();

if (!status.connected) {
  // Show "Connect Calendar" button for admin
  // Or show "Calendar not connected" message for users
}
```

### Step 2: Connect Calendar (Admin Only)

```javascript
// Get OAuth URL
const authResponse = await fetch('/auth/google/url', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { authUrl } = await authResponse.json();

// Redirect to Google OAuth
window.location.href = authUrl;

// After user returns from Google OAuth (handle in callback page)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  const callbackResponse = await fetch('/auth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ code })
  });
  
  const result = await callbackResponse.json();
  // Calendar is now connected!
}
```

### Step 3: Get Available Slots for Booking

```javascript
const date = '2024-12-01';
const duration = 60; // minutes

const response = await fetch(`/calendar/available-slots?date=${date}&duration=${duration}`);
const availableSlots = await response.json();

// Display available slots to user for selection
```

### Step 4: Appointment Lifecycle

When appointments are created, confirmed, updated, or cancelled through the appointments API (`/appointments/*`), calendar events are automatically managed:

- **Create Appointment:** Creates appointment in PENDING status (no calendar event yet)
- **Confirm Appointment:** Changes status to CONFIRMED → Calendar event is created automatically
- **Update Appointment:** If confirmed, calendar event is updated automatically  
- **Cancel Appointment:** Calendar event is deleted automatically

## Error Handling

### Common Error Responses

#### Calendar Not Connected
```json
{
  "statusCode": 400,
  "message": "Admin calendar not connected"
}
```

#### Authentication Required
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

#### Admin Access Required
```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```

### Graceful Degradation

The system is designed to work even if calendar integration fails:

- Appointments can still be created and managed
- Calendar operations that fail are logged but don't break the main functionality
- Users will see appropriate error messages if calendar features are unavailable

## Frontend Implementation Notes

1. **Admin Interface:** Include calendar connection management in admin panel
2. **User Interface:** Show available time slots when booking appointments
3. **Error Handling:** Implement proper error handling for calendar operations
4. **Loading States:** Show loading indicators during calendar operations
5. **Fallback:** Provide manual scheduling options if calendar integration is unavailable

## Security Considerations

- Calendar connection can only be managed by admin users
- OAuth flow should use HTTPS in production
- Store JWT tokens securely (httpOnly cookies recommended)
- Validate all date/time inputs on frontend before sending to API