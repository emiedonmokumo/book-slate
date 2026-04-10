# BookSlate - Professional Appointment Booking System

A modern, full-stack appointment booking application with seamless Google Calendar integration. Built for professionals who need an efficient, reliable way to manage appointments and client bookings.

## 🚀 Features

### Core Functionality
- **Appointment Booking**: User-friendly booking interface for clients
- **Real-time Availability**: Check available time slots instantly
- **Google Calendar Integration**: Automatic synchronization with Google Calendar
- **Admin Dashboard**: Comprehensive management panel for appointments
- **User Management**: Role-based access with admin and client roles
- **Email Notifications**: Automated confirmation and reminder emails

### Technical Features
- **RESTful API**: Clean, documented API endpoints
- **JWT Authentication**: Secure authentication system
- **PostgreSQL Database**: Robust data persistence
- **Responsive Design**: Mobile-first, modern UI
- **Docker Support**: Containerized deployment
- **TypeScript**: Type-safe development

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Calendar API**: Google Calendar API integration

📖 **[See detailed API documentation →](api/README.md)**

### Frontend (Next.js)
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **State Management**: TanStack Query
- **Icons**: Lucide React

### Infrastructure
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Deployment**: Multi-platform (AWS, GCP, DigitalOcean, Heroku, Railway, VPS)

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Google Cloud Console account (for calendar integration)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/emiedonmokumo/next-nest.git
cd next-nest
```

### 2. Environment Setup

**API Configuration** - See [api/README.md](api/README.md) for detailed setup

**Frontend Configuration** - Create `.env.local` in `web` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Start with Docker
```bash
# Start PostgreSQL database
docker-compose up postgres -d

# Install dependencies and start development servers
cd api && npm install && npm run start:dev &
cd ../web && npm install && npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 🗄️ Database Schema

For detailed database schema and API endpoints, see [API Documentation](api/README.md).

## 📅 Google Calendar Integration

### Setup Process
1. Create Google Cloud Console project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Configure redirect URIs
5. Add credentials to environment variables

### Integration Flow
1. Admin connects Google Calendar via OAuth
2. Confirmed appointments automatically create calendar events
3. Updates and cancellations sync with Google Calendar
4. Real-time availability checking prevents double bookings

For detailed setup instructions, see [CALENDAR_SETUP.md](api/CALENDAR_SETUP.md).

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all appointments, user management, calendar integration
- **User**: Can view and manage their own appointments

### Protected Routes
- Admin dashboard: `/admin` (Admin only)
- Appointment management: Role-based access
- Calendar integration: Admin only

### JWT Implementation
- Secure token-based authentication
- Role-based guards for endpoint protection
- Automatic token refresh handling

## 🚀 Deployment

### Docker Production (Recommended)
```bash
# Build and start all services
docker-compose up --build -d

# Check logs
docker-compose logs -f
```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## 📖 API Documentation

Complete API documentation with all endpoints, authentication, and examples:

📖 **[View API Documentation →](api/README.md)**

## 🧪 Testing

### Backend Tests
```bash
cd api
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report
```

### Frontend Tests
```bash
cd web
npm run test           # Component tests
npm run test:watch     # Watch mode
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues & Roadmap

### Current Limitations
- Single timezone support
- Basic notification system
- Manual calendar token refresh

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL status
docker-compose ps postgres
# Restart if needed
docker-compose restart postgres
```

**Google Calendar Not Syncing**
```bash
# Check calendar connection status
curl http://YOUR_SERVER_URL:3001/auth/calendar/status
# Reconnect if needed through admin panel
```

**Port Already in Use**
```bash
# Linux/Mac: Kill processes on ports 3000/3001
sudo lsof -ti:3000,3001 | xargs kill -9

# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Environment Variables Not Loading**
```bash
# Ensure .env files are in correct locations:
# ./api/.env (backend config)
# ./web/.env.local (frontend config)
```

## 📧 Support

For support and questions:
- Email: support@bookslate.com
- GitHub Issues: [Create an issue](https://github.com/emiedonmokumo/next-nest/issues)
- Documentation: [Wiki](https://github.com/emiedonmokumo/next-nest/wiki)

---

Built with ❤️ by the BookSlate Team