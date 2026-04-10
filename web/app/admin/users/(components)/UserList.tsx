import { Mail, Shield, Edit, Trash2, Users } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { User } from '@/types'

interface UserListProps {
  users: User[]
  loading: boolean
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string, userEmail: string) => Promise<void>
}

export default function UserList({ 
  users, 
  loading, 
  onEditUser, 
  onDeleteUser 
}: UserListProps) {
  const getRoleColor = (isAdmin: boolean) => {
    return isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          All Users
          <span className="ml-2 text-sm text-gray-500">({users.length})</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {user.firstName || user.lastName 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : user.email
                      }
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mr-2 ${getRoleColor(user.isAdmin)}`}>
                      {user.isAdmin ? 'admin' : 'user'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {user.email}
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      {user.isAdmin ? 'Administrator' : 'Regular User'}
                    </div>
                    <div>
                      Joined: {format(parseISO(user.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEditUser(user)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => onDeleteUser(user.id, user.email)}
                    className="inline-flex items-center px-3 py-1 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}