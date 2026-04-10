import { IsString, IsEmail, IsDateString, IsOptional, MaxLength, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  preferredDateTime: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AppointmentResponseDto {
  id: string;
  name: string;
  email: string;
  preferredDateTime: Date;
  notes?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}