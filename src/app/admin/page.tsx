'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { adminApi, authApi } from '@/lib/api'
import { Users, GraduationCap, BookOpen, ClipboardCheck } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import Logo from '@/components/ui/Logo'
import { requireRole } from '@/lib/auth/roleCheck'

interface Stats {
  total_students: number
  total_teachers: number
  total_classes: number
  completed_assessments: number
}

export default function AdminDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adminName, setAdminName] = useState<string | null>(null)
  const [schoolName, setSchoolName] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      setLoading(true)
      const userProfile = await requireRole('admin')
      const response = await adminApi.getSchoolStats()
      setStats(response)
      setAdminName(userProfile.full_name)
      const schoolData = await authApi.getSchool(userProfile)
      setSchoolName(schoolData?.name ?? null)
    } catch (err: unknown) {
      console.error('Failed to load stats:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load stats')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-rose-700">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex flex-row items-center space-x-2">
              <Link href="/admin">
                <Logo size="lg" variant="dark" />
              </Link>
              {schoolName && (
                <>
                  <span className="text-white text-xl">|</span>
                  <p className="text-gray-300 mt-1.5">{schoolName}</p>
                </>
              )}
            </div>
            <span className="text-md text-gray-500 mt-6">Welcome,</span>
            <h1 className="text-white text-3xl mt-1">{adminName ? adminName : 'Admin'}</h1>
          </div>
          <LogoutButton variant="dark" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-400">Admin Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your school&apos;s career guidance platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Students */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-violet-500 to-violet-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.total_students || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Students</p>
          </div>

          {/* Teachers */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-teal-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-teal-500 to-teal-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.total_teachers || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Teachers</p>
          </div>

          {/* Classes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.total_classes || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Classes</p>
          </div>

          {/* Assessments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-linear-to-br from-orange-500 to-orange-600 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats?.completed_assessments || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Completed Assessments</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students Card */}
          <div
            onClick={() => router.push('/admin/student')}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-violet-100 hover:border-violet-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Students</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View and manage student profiles
            </p>
            <button className="text-violet-600 text-sm font-medium hover:text-violet-700">
              View Students →
            </button>
          </div>

          {/* Teachers Card */}
          <div
            onClick={() => router.push('/admin/teacher')}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-teal-100 hover:border-teal-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <GraduationCap className="w-8 h-8 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Teachers</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Manage teacher profiles and classes
            </p>
            <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
              View Teachers →
            </button>
          </div>

          {/* Classes Card */}
          <div
            onClick={() => router.push('/admin/classes')}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-purple-100 hover:border-purple-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Classes</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View and create classes
            </p>
            <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
              View Classes →
            </button>
          </div>

          {/* Reports Card */}
          <div
            onClick={() => router.push('/admin/reports')}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 hover:shadow-xl transition-all cursor-pointer border border-orange-100 hover:border-orange-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <ClipboardCheck className="w-8 h-8 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View career recommendations
            </p>
            <button className="text-orange-600 text-sm font-medium hover:text-orange-700">
              View Reports →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
