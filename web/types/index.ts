// User types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

export interface UpdateUserDto {
  email?: string
  firstName?: string
  lastName?: string
  isAdmin?: boolean
}

// Appointment types
export interface Appointment {
  id: string
  name: string
  email: string
  preferredDateTime: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  googleEventId?: string
  user: User
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  name: string
  email: string
  preferredDateTime: string
  notes?: string
}

export interface UpdateAppointmentDto {
  name?: string
  email?: string
  preferredDateTime?: string
  notes?: string
}

// Calendar types
export interface CalendarEvent {
  eventId: string
  htmlLink: string
  status: string
}

export interface CalendarConnectionStatus {
  message: string
  connected: boolean
  adminEmail: string
}

export interface AvailableSlot {
  startTime: string
  endTime: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}