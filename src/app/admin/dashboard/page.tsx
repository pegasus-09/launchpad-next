"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { adminApi, authApi } from "@/lib/api"
import { getCurrentUserProfile, requireRole } from "@/lib/auth/roleCheck"
import LogoutButton from "@/components/auth/LogoutButton"

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  has_assessment: boolean
  subjects_count: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [schoolName, setSchoolName] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        async function loadData() {
            try {
                // Check authentication and role
                const userProfile = await requireRole('admin')
                
                // Get school name
                const schoolData = await authApi.getSchool(userProfile)
                if (schoolData) {
                setSchoolName(schoolData.name)
                }
                
                // Load students AND stats
                const [studentsData, statsData] = await Promise.all([
                adminApi.getAllStudents(),
                adminApi.getSchoolStats()  // ← Add this
                ])
                
                setStudents(studentsData.students || [])
                setStats(statsData)  // ← Add this
            } catch (err: any) {
                console.error('Admin dashboard error:', err)
                setError(err.message || 'Failed to load dashboard')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats from student data
  const totalStudents = students.length
  const completedAssessments = students.filter(s => s.has_assessment).length

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
            </h1>
            <p className="text-gray-600">
              {schoolName ? schoolName : 'No school assigned'}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {stats?.total_students || totalStudents}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100 hover:border-teal-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {stats?.completed_assessments || completedAssessments}
          </div>
          <div className="text-sm text-gray-600">Completed Assessments</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-violet-500 mb-2">
            {stats?.active_teachers || '-'}
          </div>
          <div className="text-sm text-gray-600">Active Teachers</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100 hover:border-teal-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-teal-500 mb-2">
            {stats?.total_subjects || '-'}
          </div>
          <div className="text-sm text-gray-600">Total Subjects</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            All Students
          </h2>
          <button
            onClick={() => router.push('/admin/add-student')}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium cursor-pointer"
          >
            + Add Student
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchTerm ? 'No students found matching your search.' : 'No students in the system yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assessment</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {student.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      Year {student.year_level}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.subjects_count || 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {student.has_assessment ? (
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => router.push(`/admin/student/${student.id}`)}
                        className="text-violet-600 hover:text-violet-700 font-medium hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/admin/subjects')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">📚 Manage Subjects</h3>
          <p className="text-sm text-gray-600">
            Create and manage subject offerings
          </p>
        </button>

        <button
          onClick={() => router.push('/admin/teachers')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">👨‍🏫 Manage Teachers</h3>
          <p className="text-sm text-gray-600">
            View and assign teachers to subjects
          </p>
        </button>

        <button
          onClick={() => router.push('/admin/reports')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left group"
        >
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">📊 Reports</h3>
          <p className="text-sm text-gray-600">
            Generate school-wide career guidance reports
          </p>
        </button>
      </div>
      </div>
    </div>
  )
}