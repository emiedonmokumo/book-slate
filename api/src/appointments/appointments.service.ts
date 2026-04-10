import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  BadRequestException,
  ConflictException,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointments.entity';
import { User } from '../users/user.entity';
import { CreateAppointmentDto, AppointmentResponseDto } from './appointments.dto';
import { CalendarService } from '../calendar/calendar.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private calendarService: CalendarService
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    // Validate appointment date is in the future
    const preferredDateTime = new Date(createAppointmentDto.preferredDateTime);
    if (preferredDateTime <= new Date()) {
      throw new BadRequestException('Appointment date must be in the future');
    }

    // Check for conflicting appointments with same email and time
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        email: createAppointmentDto.email,
        preferredDateTime,
        status: AppointmentStatus.CONFIRMED
      }
    });

    if (existingAppointment) {
      throw new ConflictException('You already have an appointment at this time');
    }

    let appointment = this.appointmentRepository.create({
      name: createAppointmentDto.name,
      email: createAppointmentDto.email,
      preferredDateTime,
      notes: createAppointmentDto.notes,
      status: AppointmentStatus.PENDING
    });

    // Save appointment
    const savedAppointment = await this.appointmentRepository.save(appointment);
    
    this.logger.log(`Created appointment ${savedAppointment.id}`);

    return this.mapToResponseDto(savedAppointment);
  }

  async findAll(): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentRepository.find({
      order: { createdAt: 'DESC' }
    });
    return appointments.map(appointment => this.mapToResponseDto(appointment));
  }

  async getDashboardStats() {
    const [totalAppointments, pendingCount, confirmedCount, cancelledCount, completedCount, totalUsers] = await Promise.all([
      this.appointmentRepository.count(),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.PENDING } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.CONFIRMED } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.CANCELLED } }),
      this.appointmentRepository.count({ where: { status: AppointmentStatus.COMPLETED } }),
      this.userRepository.count()
    ]);

    return {
      totalAppointments,
      pendingCount,
      confirmedCount,
      cancelledCount,
      completedCount,
      totalUsers
    };
  }

  async findById(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.mapToResponseDto(appointment);
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const previousStatus = appointment.status;
    appointment.status = status;

    // Handle calendar events based on status changes
    try {
      if (status === AppointmentStatus.CONFIRMED && previousStatus !== AppointmentStatus.CONFIRMED) {
        // Create calendar event when confirming
        if (!appointment.googleEventId) {
          const endTime = new Date(appointment.preferredDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
          
          const eventResult = await this.calendarService.createEvent({
            summary: `Appointment with ${appointment.name}`,
            description: `Appointment details:\nClient: ${appointment.name}\nEmail: ${appointment.email}\nNotes: ${appointment.notes || 'No additional notes'}`,
            startTime: appointment.preferredDateTime.toISOString(),
            endTime: endTime.toISOString(),
            attendees: [appointment.email]
          });

          appointment.googleEventId = eventResult.eventId;
          this.logger.log(`Created calendar event ${eventResult.eventId} for appointment ${appointment.id}`);
        }
      } else if (status === AppointmentStatus.CANCELLED && appointment.googleEventId) {
        // Delete calendar event when cancelling
        await this.calendarService.deleteEvent(appointment.googleEventId);
        appointment.googleEventId = null;
        this.logger.log(`Deleted calendar event for cancelled appointment ${appointment.id}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to manage calendar event for appointment ${appointment.id}: ${error.message}`);
      // Continue with appointment status update even if calendar operation fails
    }

    const updatedAppointment = await this.appointmentRepository.save(appointment);
    return this.mapToResponseDto(updatedAppointment);
  }

  async update(
    id: string, 
    updateData: Partial<CreateAppointmentDto>
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Prevent updating completed appointments
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed appointments');
    }

    let needsCalendarUpdate = false;

    // Validate new date if provided
    if (updateData.preferredDateTime) {
      const newDateTime = new Date(updateData.preferredDateTime);
      if (newDateTime <= new Date()) {
        throw new BadRequestException('Appointment date must be in the future');
      }
      appointment.preferredDateTime = newDateTime;
      needsCalendarUpdate = true;
    }

    if (updateData.name !== undefined) {
      appointment.name = updateData.name;
      needsCalendarUpdate = true;
    }
    if (updateData.email !== undefined) {
      appointment.email = updateData.email;
      needsCalendarUpdate = true;
    }
    if (updateData.notes !== undefined) {
      appointment.notes = updateData.notes;
      needsCalendarUpdate = true;
    }

    // Update calendar event if appointment is confirmed and has changes
    if (needsCalendarUpdate && appointment.status === AppointmentStatus.CONFIRMED && appointment.googleEventId) {
      try {
        const endTime = new Date(appointment.preferredDateTime.getTime() + 60 * 60 * 1000);
        
        await this.calendarService.updateEvent(appointment.googleEventId, {
          summary: `Appointment with ${appointment.name}`,
          description: `Appointment details:\nClient: ${appointment.name}\nEmail: ${appointment.email}\nNotes: ${appointment.notes || 'No additional notes'}`,
          startTime: appointment.preferredDateTime.toISOString(),
          endTime: endTime.toISOString(),
          attendees: [appointment.email]
        });

        this.logger.log(`Updated calendar event for appointment ${appointment.id}`);
      } catch (error) {
        this.logger.warn(`Failed to update calendar event for appointment ${appointment.id}: ${error.message}`);
      }
    }

    const updatedAppointment = await this.appointmentRepository.save(appointment);

    this.logger.log(`Updated appointment ${appointment.id}`);

    return this.mapToResponseDto(updatedAppointment);
  }

  async delete(id: string): Promise<void> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    await this.appointmentRepository.remove(appointment);
  }

  async cancel(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed appointments');
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    // Delete calendar event if it exists
    if (appointment.googleEventId) {
      try {
        await this.calendarService.deleteEvent(appointment.googleEventId);
        appointment.googleEventId = null;
        this.logger.log(`Deleted calendar event for cancelled appointment ${appointment.id}`);
      } catch (error) {
        this.logger.warn(`Failed to delete calendar event for appointment ${appointment.id}: ${error.message}`);
      }
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const updatedAppointment = await this.appointmentRepository.save(appointment);

    this.logger.log(`Cancelled appointment ${appointment.id}`);

    return this.mapToResponseDto(updatedAppointment);
  }

  private mapToResponseDto(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      name: appointment.name,
      email: appointment.email,
      preferredDateTime: appointment.preferredDateTime,
      notes: appointment.notes,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };
  }
}
