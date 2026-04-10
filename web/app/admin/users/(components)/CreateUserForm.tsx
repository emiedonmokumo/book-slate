'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { CreateUserDto } from '@/types'

interface CreateUserFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: CreateUserDto) => Promise<void>
}

export default function CreateUserForm({ isOpen, onClose, onSubmit }: CreateUserFormProps) {
  const [createForm, setCreateForm] = useState<CreateUserDto>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isAdmin: false
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!createForm.email || !createForm.password) {
      return
    }

    await onSubmit(createForm)
    
    // Reset form
    setCreateForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isAdmin: false
    })
    setShowPassword(false)
  }

  const handleClose = () => {
    setCreateForm({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      isAdmin: false
    })
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create New User</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={createForm.password}
                onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={createForm.firstName || ''}
              onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={createForm.lastName || ''}
              onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={createForm.isAdmin ? 'admin' : 'user'}
              onChange={(e) => setCreateForm({...createForm, isAdmin: e.target.value === 'admin'})}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
          >
            Create User
          </button>
        </div>
      </form>
    </div>
  )
}