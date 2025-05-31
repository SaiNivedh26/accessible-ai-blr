'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

// List of routes that require authentication
const protectedPaths = ['/profile', '/dashboard', '/settings', '/convert', '/history', '/saved', '/development']

// List of routes that should redirect to dashboard if already authenticated
const publicOnlyPaths = ['/login', '/signup']

// Where to redirect after login if no specific path was requested
const defaultAuthenticatedPath = '/dashboard'

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while still loading auth state
    if (isLoading) return
    
    // Check if current path requires authentication
    const requiresAuth = protectedPaths.includes(pathname)
    
    // If path requires auth and user is not authenticated, redirect to login
    if (requiresAuth && !user) {
      router.push('/login')
    }
    
    // If user is authenticated and trying to access login/signup, redirect to dashboard
    if (user && publicOnlyPaths.includes(pathname)) {
      router.push(defaultAuthenticatedPath)
    }
  }, [user, isLoading, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // For protected routes, don't render anything until auth check is complete
  if (protectedPaths.includes(pathname) && !user) {
    return null
  }
  
  // For public-only routes, don't render if user is logged in
  if (publicOnlyPaths.includes(pathname) && user) {
    return null
  }

  return <>{children}</>
}
