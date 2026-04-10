import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiDocs() {
    return {
      name: 'BookSlate API',
      version: '1.0.0',
      description: 'Appointment booking system with Google Calendar integration',
      endpoints: {
        auth: {
          'POST /auth/login': 'User login',
          'POST /auth/register': 'User registration',
          'GET /auth/profile': 'Get user profile (requires JWT)',
          'GET /auth/google/url': 'Get Google OAuth URL',
          'POST /auth/google/callback': 'Handle Google OAuth callback',
          'GET /auth/calendar/status': 'Check calendar connection status',
          'POST /auth/calendar/disconnect': 'Disconnect calendar'
        },
        users: {
          'POST /users/register': 'Register new user',
          'GET /users/profile': 'Get user profile (requires JWT)',
          'POST /users/admin/create': 'Create user as admin (requires admin)',
          'GET /users': 'Get all users (requires admin)'
        },
        appointments: {
          'POST /appointments': 'Create appointment',
          'GET /appointments': 'Get all appointments (requires admin)',
          'GET /appointments/my': 'Get user appointments (requires JWT)',
          'GET /appointments/:id': 'Get appointment by ID',
          'PUT /appointments/:id': 'Update appointment',
          'PUT /appointments/:id/status': 'Update appointment status',
          'DELETE /appointments/:id': 'Delete appointment',
          'GET /appointments/stats': 'Get dashboard stats (requires admin)'
        },
        calendar: {
          'POST /calendar/events': 'Create calendar event',
          'PUT /calendar/events/:id': 'Update calendar event',
          'DELETE /calendar/events/:id': 'Delete calendar event',
          'GET /calendar/available-slots': 'Get available time slots'
        }
      },
      authentication: {
        method: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>'
      },
      admin_access: {
        note: 'Admin routes require both JWT authentication and admin privileges'
      }
    };
  }
}
