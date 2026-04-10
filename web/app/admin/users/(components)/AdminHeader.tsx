import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface AdminHeaderProps {
  title: string
  subtitle: string
  onAddUser: () => void
}

export default function AdminHeader({ title, subtitle, onAddUser }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link href="/admin" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onAddUser}
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>
    </header>
  )
}