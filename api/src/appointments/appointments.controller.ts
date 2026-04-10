import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, AppointmentResponseDto } from './appointments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AppointmentStatus } from './appointments.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllAppointments(): Promise<AppointmentResponseDto[]> {
    return this.appointmentsService.findAll();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getDashboardStats() {
    return this.appointmentsService.getDashboardStats();
  }

  @Get(':id')
  async getAppointmentById(
    @Param('id') id: string
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: AppointmentStatus }
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.updateStatus(id, statusDto.status);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateAppointmentDto>
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAppointment(
    @Param('id') id: string
  ): Promise<void> {
    return this.appointmentsService.delete(id);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async cancelAppointment(
    @Param('id') id: string
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancel(id);
  }
}
