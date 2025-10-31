// components/protected-route.jsx
'use client'

import { useAuth } from '@/context/auth-context'
import { Spinner } from './ui/spinner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children
}