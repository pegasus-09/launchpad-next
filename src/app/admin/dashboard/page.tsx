"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { adminApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"

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
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication and role
        await requireRole('admin')
        
        // Load students and stats
        const [studentsData, statsData] = await Promise.all([
          adminApi.getAllStudents(),
          adminApi.getSchoolStats()
        ])
        
        setStudents(studentsData.students || [])
        setStats(statsData)
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          School-wide overview and student management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats?.total_students || students.length}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {students.filter(s => s.has_assessment).length}
          </div>
          <div className="text-sm text-gray-600">Completed Assessments</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats?.total_teachers || 0}
          </div>
          <div className="text-sm text-gray-600">Active Teachers</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {stats?.total_subjects || 0}
          </div>
          <div className="text-sm text-gray-600">Total Subjects</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            All Students
          </h2>
          <button
            onClick={() => router.push('/admin/add-student')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Complete
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => router.push(`/admin/student/${student.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
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
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📚 Manage Subjects</h3>
          <p className="text-sm text-gray-600">
            Create and manage subject offerings
          </p>
        </button>

        <button
          onClick={() => router.push('/admin/teachers')}
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2">👨‍🏫 Manage Teachers</h3>
          <p className="text-sm text-gray-600">
            View and assign teachers to subjects
          </p>
        </button>

        <button
          onClick={() => router.push('/admin/reports')}
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📊 Reports</h3>
          <p className="text-sm text-gray-600">
            Generate school-wide career guidance reports
          </p>
        </button>
      </div>
    </div>
  )
}
