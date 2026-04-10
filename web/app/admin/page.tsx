'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, appointmentsApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Calendar, Settings, Users, Clock, AlertCircle, CheckCircle, LinkIcon, Unlink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, logout, isLoading } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [calendarStatus, setCalendarStatus] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (isAuthenticated) {
        try {
          console.log('Loading dashboard data...')
          const [stats, calendar] = await Promise.all([
            appointmentsApi.getDashboardStats().catch(err => {
              console.error('Stats API failed:', err)
              return null
            }),
            authApi.getCalendarStatus().catch(err => {
              console.error('Calendar status API failed:', err)
              return { connected: false, message: 'Failed to check status', adminEmail: 'unknown' }
            })
          ])
          console.log('Dashboard stats:', stats)
          console.log('Calendar status:', calendar)
          setDashboardStats(stats)
          setCalendarStatus(calendar)
        } catch (error) {
          console.error('Failed to load dashboard data:', error)
        } finally {
          setStatsLoading(false)
          setCalendarLoading(false)
        }
      }
    }

    loadDashboardData()
  }, [isAuthenticated])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const refetchCalendarStatus = async () => {
    try {
      setCalendarLoading(true)
      const status = await authApi.getCalendarStatus()
      setCalendarStatus(status)
    } catch (error) {
      console.error('Failed to fetch calendar status:', error)
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleConnectCalendar = async () => {
    console.log('Attempting to connect calendar...')
    setIsConnecting(true)
    try {
      const response = await authApi.getGoogleAuthUrl()
      console.log('Google auth URL response:', response)
      if (response.authUrl) {
        window.location.href = response.authUrl
      } else {
        toast.error('No auth URL received from server')
      }
    } catch (error: any) {
      console.error('Connect calendar error:', error)
      toast.error(error?.response?.data?.message || 'Failed to get Google auth URL')
      setIsConnecting(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    setIsDisconnecting(true)
    try {
      await authApi.disconnectCalendar()
      toast.success('Calendar disconnected successfully')
      await refetchCalendarStatus()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to disconnect calendar')
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage appointments, users, and calendar integration
              </p>
            </div>
            <button
              onClick={() => {
                logout()
                router.push('/login')
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : dashboardStats?.totalAppointments || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : dashboardStats?.pendingCount || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Confirmed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : dashboardStats?.confirmedCount || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {statsLoading ? '...' : dashboardStats?.totalUsers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Integration Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Calendar Integration</h2>
            <p className="text-sm text-gray-600 mt-1">
              Connect your Google Calendar to automatically sync appointments
            </p>
          </div>
          <div className="p-6">
            {calendarLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Checking calendar status...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {calendarStatus?.connected ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-green-900">
                          Calendar Connected
                        </h3>
                        <p className="text-sm text-green-700">
                          Connected to: {calendarStatus.adminEmail}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Appointments will automatically sync to Google Calendar
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-8 w-8 text-yellow-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-yellow-900">
                          Calendar Not Connected
                        </h3>
                        <p className="text-sm text-yellow-700">
                          Connect your Google Calendar to enable automatic appointment sync
                        </p>
                        {calendarStatus?.adminEmail && (
                          <p className="text-xs text-yellow-600 mt-1">
                            Admin email: {calendarStatus.adminEmail}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex space-x-3">
                  {calendarStatus?.connected ? (
                    <button
                      onClick={handleDisconnectCalendar}
                      disabled={isDisconnecting}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectCalendar}
                      disabled={isConnecting}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/appointments" className="block">
                <div className="w-full justify-start h-auto p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="text-left">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">Manage Appointments</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      View, confirm, and manage all appointments
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/users" className="block">
                <div className="w-full justify-start h-auto p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="text-left">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium">Manage Users</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      View and manage user accounts
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/calendar" className="block">
                <div className="w-full justify-start h-auto p-4 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="text-left">
                    <div className="flex items-center mb-2">
                      <Settings className="h-5 w-5 text-gray-600 mr-2" />
                      <span className="font-medium">Calendar Settings</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Configure calendar integration and availability
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
