"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile } from "@/lib/auth/roleCheck"

export default function DashboardRouter() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function redirectToRoleDashboard() {
      try {
        const profile = await getCurrentUserProfile()
        
        if (!profile) {
          router.push('/login')
          return
        }
        
        // Redirect based on role
        switch (profile.role) {
          case 'admin':
            router.push('/admin/')
            break
          case 'teacher':
            router.push('/teacher/')
            break
          case 'student':
            router.push('/student/')
            break
          default:
            router.push('/login')
        }
      } catch (error) {
        console.error('Dashboard redirect error:', error)
        router.push('/login')
      }
    }

    redirectToRoleDashboard()
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