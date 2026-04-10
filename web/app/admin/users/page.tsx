'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usersApi } from '@/lib/api'
import type { User, CreateUserDto, UpdateUserDto } from '@/types'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { AdminHeader, CreateUserForm, EditUserModal, UserList } from './(components)'

export default function UsersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers()
    }
  }, [isAuthenticated])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await usersApi.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (createForm: CreateUserDto) => {
    if (!createForm.email || !createForm.password) {
      toast.error('Email and password are required')
      return
    }

    try {
      await usersApi.createUserAsAdmin(createForm)
      toast.success('User created successfully')
      setShowCreateForm(false)
      loadUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user')
    }
  }

  const handleUpdateUser = async (userId: string, updates: UpdateUserDto) => {
    try {
      await usersApi.updateUser(userId, updates)
      toast.success('User updated successfully')
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userEmail}?`)) return

    try {
      await usersApi.deleteUser(userId)
      toast.success('User deleted successfully')
      loadUsers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete user')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Users"
        subtitle="Manage user accounts"
        onAddUser={() => setShowCreateForm(true)}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <CreateUserForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateUser}
        />

        <UserList
          users={users}
          loading={loading}
          onEditUser={setEditingUser}
          onDeleteUser={handleDeleteUser}
        />
      </main>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
      />
    </div>
  )
}