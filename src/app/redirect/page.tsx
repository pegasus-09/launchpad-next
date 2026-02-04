"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth/roleCheck"

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: string }).name === 'AbortError'
  )
}

export default function DashboardRouter() {
  const router = useRouter()
  useEffect(() => {
    let isActive = true

    async function redirectToRoleDashboard() {
      try {
        const profile = await getCurrentUserProfile()
        
        if (!profile) {
          if (isActive) {
            router.push('/login')
          }
          return
        }
        
        // Redirect based on role
        switch (profile.role) {
          case 'admin':
            if (isActive) {
              router.push('/admin/')
            }
            break
          case 'teacher':
            if (isActive) {
              router.push('/teacher/')
            }
            break
          case 'student':
            if (isActive) {
              router.push('/student/')
            }
            break
          default:
            if (isActive) {
              router.push('/login')
            }
        }
      } catch (error) {
        if (isAbortError(error)) {
          return
        }
        console.error('Dashboard redirect error:', error)
        if (isActive) {
          router.push('/login')
        }
      }
    }

    redirectToRoleDashboard()

    return () => {
      isActive = false
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
