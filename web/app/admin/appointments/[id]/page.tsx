'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { appointmentsApi } from '@/lib/api'
import type { Appointment, UpdateAppointmentDto } from '@/types'
import { useAuth } from '@/lib/auth-context'
import { Calendar, Clock, User, Mail, MessageSquare, Edit, Save, X, ArrowLeft, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  const { isAuthenticated, isLoading } = useAuth()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<UpdateAppointmentDto>({})

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && appointmentId) {
      loadAppointment()
    }
  }, [isAuthenticated, appointmentId])

  const loadAppointment = async () => {
    try {
      setLoading(true)
      const data = await appointmentsApi.getAppointmentById(appointmentId)
      setAppointment(data)
      setEditForm({
        name: data.name,
        email: data.email,
        preferredDateTime: data.preferredDateTime.split('.')[0], // Remove milliseconds for input
        notes: data.notes || ''
      })
    } catch (error: any) {
      console.error('Failed to load appointment:', error)
      toast.error('Failed to load appointment')
      router.push('/admin/appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await appointmentsApi.updateAppointment(appointmentId, editForm)
      toast.success('Appointment updated successfully')
      setEditing(false)
      loadAppointment()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update appointment')
    }
  }

  const handleStatusUpdate = async (newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await appointmentsApi.updateAppointmentStatus(appointmentId, newStatus)
      toast.success(`Appointment ${newStatus} successfully`)
      loadAppointment()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${newStatus} appointment`)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      await appointmentsApi.deleteAppointment(appointmentId)
      toast.success('Appointment deleted successfully')
      router.push('/admin/appointments')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete appointment')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated || !appointment) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/appointments" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
                <p className="mt-1 text-sm text-gray-600">View and manage appointment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditForm({
                        name: appointment.name,
                        email: appointment.email,
                        preferredDateTime: appointment.preferredDateTime.split('.')[0],
                        notes: appointment.notes || ''
                      })
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Appointment Info */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Appointment Information</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {appointment.name}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {appointment.email}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date & Time
                  </label>
                  {editing ? (
                    <input
                      type="datetime-local"
                      value={editForm.preferredDateTime || ''}
                      onChange={(e) => setEditForm({...editForm, preferredDateTime: e.target.value})}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {format(parseISO(appointment.preferredDateTime), 'PPP p')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              {editing ? (
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this appointment..."
                />
              ) : (
                <div className="text-gray-900">
                  {appointment.notes ? (
                    <div className="flex items-start">
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                      {appointment.notes}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No notes provided</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!editing && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </button>
                )}
                
                {appointment.status === 'cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('pending')}
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Reactivate
                  </button>
                )}
                
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}