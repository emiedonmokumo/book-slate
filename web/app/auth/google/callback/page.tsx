'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function GoogleCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('Authorization was cancelled or failed')
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received')
        return
      }

      try {
        await authApi.handleGoogleCallback(code)
        setStatus('success')
        setMessage('Calendar connected successfully!')
        
        // Redirect to admin page after 2 seconds
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } catch (error: any) {
        setStatus('error')
        setMessage(error?.response?.data?.message || 'Failed to connect calendar')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Calendar className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Calendar Integration</h1>
        </div>

        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing calendar connection...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-green-900 mb-2">Success!</h2>
            <p className="text-green-700 mb-6">{message}</p>
            <p className="text-sm text-gray-600 mb-4">Redirecting to admin dashboard...</p>
            <Link href="/admin">
              <Button>Go to Admin Dashboard</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Connection Failed</h2>
            <p className="text-red-700 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/admin">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Calendar className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Calendar Integration</h1>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  )
}