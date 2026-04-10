'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { calendarApi, appointmentsApi } from '@/lib/api'
import { formatDate, formatTime } from '@/lib/utils'
import { AvailableSlot } from '@/types'

export default function BookAppointmentPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const loadAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true)
    try {
      const slots = await calendarApi.getAvailableSlots(date, 60) // 60 minutes duration
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to load available slots:', error)
      toast.error('Failed to load available time slots')
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot('') // Reset selected slot when date changes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }

    setIsSubmitting(true)
    
    try {
      await appointmentsApi.createAppointment({
        name: formData.name,
        email: formData.email,
        preferredDateTime: selectedSlot,
        notes: formData.notes || undefined
      })
      
      toast.success('Appointment request submitted! You will receive a confirmation email.')
      
      // Reset form
      setFormData({ name: '', email: '', notes: '' })
      setSelectedSlot('')
      // Reload available slots to reflect the new booking
      loadAvailableSlots(selectedDate)
    } catch (error: any) {
      console.error('Failed to book appointment:', error)
      toast.error(error?.response?.data?.message || 'Failed to book appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30) // 30 days from now
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            </div>
            <Link href="/" className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Schedule Your Appointment</h2>
            <p className="text-sm text-gray-600 mt-1">
              Fill out the form below to request an appointment
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Date & Time Selection */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {selectedDate && (
                    <div className="text-sm text-gray-600 mb-3">
                      {formatDate(selectedDate)}
                    </div>
                  )}
                  
                  {isLoadingSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading available slots...</p>
                    </div>
                  ) : availableSlots && availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => setSelectedSlot(slot.startTime)}
                          className={`p-2 text-sm rounded border text-center transition-colors ${
                            selectedSlot === slot.startTime
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
                          }`}
                        >
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTime(slot.startTime)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No available slots for this date</p>
                      <p className="text-xs mt-1">Please select a different date</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Contact Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific requirements or information..."
                  />
                </div>

                {selectedSlot && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Appointment Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
                      <p><strong>Time:</strong> {formatTime(selectedSlot)}</p>
                      <p><strong>Duration:</strong> 1 hour</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={!selectedSlot || !formData.name || !formData.email || isSubmitting}
                className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}