import axios from 'axios'
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CalendarEvent,
  CalendarConnectionStatus,
  AvailableSlot,
  LoginCredentials
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create a separate API instance for public requests (no auth required)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store token reference for API calls
let authToken: string | null = null

export const setApiToken = (token: string | null) => {
  authToken = token
}

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authToken = null
      console.warn('Authentication failed:', error.response?.data?.message)
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (userData: CreateUserDto) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google/url')
    return response.data
  },

  handleGoogleCallback: async (code: string) => {
    const response = await api.post('/auth/google/callback', { code })
    return response.data
  },

  getCalendarStatus: async (): Promise<CalendarConnectionStatus> => {
    const response = await api.get('/auth/calendar/status')
    return response.data
  },

  disconnectCalendar: async () => {
    const response = await api.post('/auth/calendar/disconnect')
    return response.data
  },

  verifyToken: async () => {
    if (!authToken) {
      return { error: 'No token provided' }
    }
    const response = await api.get('/auth/verify')
    return response.data
  },
}

// Users API
export const usersApi = {
  createUser: async (userData: CreateUserDto) => {
    const response = await api.post('/users/register', userData)
    return response.data
  },

  createUserAsAdmin: async (userData: CreateUserDto) => {
    // Send the data directly as the backend now expects isAdmin
    const backendData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: userData.isAdmin
    }
    const response = await api.post('/users/admin/create', backendData)
    return response.data
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users')
    return response.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, userData: UpdateUserDto) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`)
  },
}

// Appointments API
export const appointmentsApi = {
  createAppointment: async (appointmentData: CreateAppointmentDto) => {
    // Use publicApi for public booking (no auth required)
    const response = await publicApi.post('/appointments', appointmentData)
    return response.data
  },

  getAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments')
    return response.data
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/my')
    return response.data
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`)
    return response.data
  },

  updateAppointment: async (id: string, updates: UpdateAppointmentDto) => {
    const response = await api.put(`/appointments/${id}`, updates)
    return response.data
  },

  updateAppointmentStatus: async (id: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    const response = await api.put(`/appointments/${id}/status`, { status })
    return response.data
  },

  deleteAppointment: async (id: string) => {
    await api.delete(`/appointments/${id}`)
  },

  getDashboardStats: async () => {
    const response = await api.get('/appointments/stats')
    return response.data
  },
}

// Calendar API
export const calendarApi = {
  createEvent: async (eventData: {
    summary: string
    description?: string
    startTime: string
    endTime: string
    attendees?: string[]
  }): Promise<CalendarEvent> => {
    const response = await api.post('/calendar/events', eventData)
    return response.data
  },

  updateEvent: async (eventId: string, eventData: {
    summary?: string
    description?: string
    startTime?: string
    endTime?: string
    attendees?: string[]
  }): Promise<CalendarEvent> => {
    const response = await api.put(`/calendar/events/${eventId}`, eventData)
    return response.data
  },

  deleteEvent: async (eventId: string) => {
    const response = await api.delete(`/calendar/events/${eventId}`)
    return response.data
  },

  getAvailableSlots: async (date: string, duration?: number): Promise<AvailableSlot[]> => {
    const params = new URLSearchParams({ date })
    if (duration) params.append('duration', duration.toString())
    
    // Use publicApi for getting available slots (no auth required)
    const response = await publicApi.get(`/calendar/available-slots?${params}`)
    return response.data
  },
}

export { api }
export default api