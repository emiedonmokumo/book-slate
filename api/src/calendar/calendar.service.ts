import { Injectable, BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';
import { UsersService } from '../users/users.service';

@Injectable()
export class CalendarService {
  private oauth2Client;

  constructor(private usersService: UsersService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
  }

  async createEvent(eventDetails: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
  }) {
    try {
      const tokens = await this.usersService.getAdminCalendarTokens();
      
      if (!tokens) {
        throw new BadRequestException('Admin calendar not connected');
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description || '',
        start: {
          dateTime: eventDetails.startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventDetails.endTime,
          timeZone: 'UTC',
        },
        attendees: eventDetails.attendees?.map(email => ({ email })) || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours
            { method: 'popup', minutes: 30 }, // 30 minutes
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        status: response.data.status,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        try {
          const { credentials } = await this.oauth2Client.refreshAccessToken();
          const tokens = await this.usersService.getAdminCalendarTokens();
          
          if (tokens) {
            const adminEmail = process.env.ADMIN_EMAIL;
            if (!adminEmail) {
              throw new BadRequestException('ADMIN_EMAIL environment variable is not configured');
            }
            
            await this.usersService.updateCalendarTokens(
              adminEmail,
              credentials.access_token,
              credentials.refresh_token || tokens.refreshToken
            );
            
            // Retry the request
            return this.createEvent(eventDetails);
          }
        } catch (refreshError) {
          throw new BadRequestException('Failed to refresh calendar access token');
        }
      }
      
      throw new BadRequestException(`Failed to create calendar event: ${error.message}`);
    }
  }

  async updateEvent(eventId: string, eventDetails: {
    summary?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    attendees?: string[];
  }) {
    try {
      const tokens = await this.usersService.getAdminCalendarTokens();
      
      if (!tokens) {
        throw new BadRequestException('Admin calendar not connected');
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      // Get the existing event first
      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: eventId,
      });

      const event = {
        ...existingEvent.data,
        summary: eventDetails.summary || existingEvent.data.summary,
        description: eventDetails.description !== undefined ? eventDetails.description : existingEvent.data.description,
        ...(eventDetails.startTime && {
          start: {
            dateTime: eventDetails.startTime,
            timeZone: 'UTC',
          },
        }),
        ...(eventDetails.endTime && {
          end: {
            dateTime: eventDetails.endTime,
            timeZone: 'UTC',
          },
        }),
        ...(eventDetails.attendees && {
          attendees: eventDetails.attendees.map(email => ({ email })),
        }),
      };

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
        sendUpdates: 'all',
      });

      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        status: response.data.status,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to update calendar event: ${error.message}`);
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const tokens = await this.usersService.getAdminCalendarTokens();
      
      if (!tokens) {
        throw new BadRequestException('Admin calendar not connected');
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      throw new BadRequestException(`Failed to delete calendar event: ${error.message}`);
    }
  }

  async getAvailableSlots(date: string, durationMinutes: number = 60) {
    try {
      const tokens = await this.usersService.getAdminCalendarTokens();
      
      if (!tokens) {
        throw new BadRequestException('Admin calendar not connected');
      }

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // 9 AM

      const endOfDay = new Date(date);
      endOfDay.setHours(17, 0, 0, 0); // 5 PM

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const existingEvents = response.data.items || [];
      const availableSlots: Array<{ startTime: string; endTime: string }> = [];
      
      let currentTime = new Date(startOfDay);
      const slotDuration = durationMinutes * 60 * 1000; // Convert to milliseconds

      while (currentTime.getTime() + slotDuration <= endOfDay.getTime()) {
        const slotEnd = new Date(currentTime.getTime() + slotDuration);
        
        // Check if this slot conflicts with any existing event
        const hasConflict = existingEvents.some(event => {
          if (!event.start || !event.end) return false;
          
          const startTime = event.start.dateTime || event.start.date;
          const endTime = event.end.dateTime || event.end.date;
          
          if (!startTime || !endTime) return false;
          
          const eventStart = new Date(startTime);
          const eventEnd = new Date(endTime);
          
          return (
            (currentTime >= eventStart && currentTime < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (currentTime <= eventStart && slotEnd >= eventEnd)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: currentTime.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }

        // Move to next 30-minute slot
        currentTime = new Date(currentTime.getTime() + (30 * 60 * 1000));
      }

      return availableSlots;
    } catch (error) {
      throw new BadRequestException(`Failed to get available slots: ${error.message}`);
    }
  }
}