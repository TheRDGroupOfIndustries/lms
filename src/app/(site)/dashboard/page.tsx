'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import InstructorDashboard from '@/components/InstructorDashboard'
import UserDashboard from '@/components/UserDashboard'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user-role')
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // If the user is not authenticated, redirect to login
          router.push('/signin')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // This should not happen as unauthenticated users are redirected
  }

  return (
    <div className="container mx-auto p-4">     
      {user.role === 'USER' && <UserDashboard />}
      {user.role === 'INSTRUCTOR' && <InstructorDashboard />}
    </div>
  )
}