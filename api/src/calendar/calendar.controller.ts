import { Controller, Post, Body, Get, Query, Param, Put, Delete } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post('events')
  async createEvent(@Body() eventDetails: {
    summary: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
  }) {
    return this.calendarService.createEvent(eventDetails);
  }

  @Put('events/:eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() eventDetails: {
      summary?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      attendees?: string[];
    }
  ) {
    return this.calendarService.updateEvent(eventId, eventDetails);
  }

  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return this.calendarService.deleteEvent(eventId);
  }

  @Get('available-slots')
  async getAvailableSlots(
    @Query('date') date: string,
    @Query('duration') duration?: string
  ) {
    const durationMinutes = duration ? parseInt(duration) : 60;
    return this.calendarService.getAvailableSlots(date, durationMinutes);
  }
}