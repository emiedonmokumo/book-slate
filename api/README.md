# BookSlate API - NestJS Backend

A robust NestJS-based REST API for the BookSlate appointment booking system with Google Calendar integration.

## 🛠️ Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Calendar API**: Google Calendar API integration
- **Validation**: class-validator
- **Security**: bcrypt for password hashing

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Google Cloud Console account (for calendar integration)

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment example file:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

### Required Environment Variables

- **ADMIN_EMAIL**: Email address of the admin user for Google Calendar integration
- **GOOGLE_CLIENT_ID**: Google OAuth client ID from Google Cloud Console
- **GOOGLE_CLIENT_SECRET**: Google OAuth client secret
- **GOOGLE_REDIRECT_URI**: OAuth redirect URI (e.g., http://localhost:3000/auth/google/callback)
- **DATABASE_HOST**: PostgreSQL database host
- **DATABASE_PORT**: PostgreSQL database port
- **DATABASE_USER**: PostgreSQL username
- **DATABASE_PASSWORD**: PostgreSQL password
- **DATABASE_NAME**: PostgreSQL database name
- **JWT_SECRET**: Secret key for JWT token generation

### Optional Environment Variables

- **NODE_ENV**: Environment (development/production)
- **PORT**: Application port (default: 3000)
- **JWT_EXPIRES_IN**: JWT token expiration time (default: 1d)

### 2. Installation

```bash
npm install
```

### 3. Database Setup

```bash
# Start PostgreSQL (if using Docker)
docker-compose up postgres -d

# The database will be automatically synced in development
```

### 4. Start Development Server

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

The API will be available at:
- **API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api (if Swagger is configured)

## 📅 Google Calendar Integration

For detailed Google Calendar setup instructions, see [CALENDAR_SETUP.md](CALENDAR_SETUP.md).

### Quick Setup:
1. Create Google Cloud Console project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add credentials to `.env` file
5. Create admin user with email specified in ADMIN_EMAIL

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `firstName`, `lastName`
- `isAdmin` (Boolean)
- `googleAccessToken`, `googleRefreshToken` (Calendar integration)
- `createdAt`, `updatedAt` (Timestamps)

### Appointments Table
- `id` (UUID, Primary Key)
- `clientName`, `clientEmail` (Client details)
- `appointmentDate` (Timestamp)
- `notes` (Optional)
- `status` (PENDING/CONFIRMED/CANCELLED/COMPLETED)
- `googleEventId` (Calendar sync)
- `user` (Relation to Users)
- `createdAt`, `updatedAt` (Timestamps)

## 📖 API Endpoints

### Authentication
```http
POST   /auth/login             # User login
GET    /auth/google/url        # Get Google OAuth URL (admin)
POST   /auth/google/callback   # Handle OAuth callback (admin)
GET    /auth/calendar/status   # Check calendar connection
POST   /auth/calendar/disconnect # Disconnect calendar (admin)
```

### Users
```http
GET    /users                  # Get all users (admin)
POST   /users                  # Create user (admin)
GET    /users/:id              # Get user by ID
PUT    /users/:id              # Update user
DELETE /users/:id              # Delete user (admin)
```

### Appointments
```http
GET    /appointments           # Get appointments
POST   /appointments           # Create appointment
GET    /appointments/:id       # Get appointment by ID
PUT    /appointments/:id       # Update appointment
DELETE /appointments/:id       # Delete appointment
PATCH  /appointments/:id/status # Update status (admin)
```

### Calendar
```http
GET    /calendar/available-slots # Get available time slots
POST   /calendar/events         # Create calendar event
PUT    /calendar/events/:id     # Update calendar event
DELETE /calendar/events/:id     # Delete calendar event
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access, calendar management
- **User**: Limited access to own data

### JWT Implementation
- Secure token-based authentication
- Role-based guards for endpoint protection
- Configurable token expiration

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🚀 Production Deployment

### Environment Configuration
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper database credentials
- Set up SSL/HTTPS
- Configure CORS properly

### Database
- Disable `synchronize` in production
- Run migrations manually
- Set up proper backup strategy

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Calendar Integration Guide](CALENDAR_SETUP.md)
- [Frontend Integration](FRONTEND_INTEGRATION.md)
- [Main Project README](../README.md)

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
docker-compose ps postgres
```

**Environment Variables Not Loading**
```bash
# Ensure .env file exists in api directory
ls -la .env
```

**Google Calendar Integration Issues**
```bash
# Check calendar connection status
curl http://localhost:3001/auth/calendar/status
```

## 📝 License

MIT License - see the [LICENSE](../LICENSE) file for details.