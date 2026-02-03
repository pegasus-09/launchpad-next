"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { teacherApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import LogoutButton from "@/components/auth/LogoutButton"

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  subjects: string[]
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication and role
        await requireRole('teacher')
        
        // Load students
        const data = await teacherApi.getStudents()
        setStudents(data.students || [])
      } catch (err: any) {
        console.error('Teacher dashboard error:', err)
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

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and monitor your students' career development
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {students.length}
          </div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100 hover:border-teal-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-teal-600 mb-2">
            {students.filter(s => s.subjects && s.subjects.length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Active in Subjects</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 hover:border-violet-300 transition-all hover:shadow-md">
          <div className="text-3xl font-bold text-violet-500 mb-2">
            {new Set(students.map(s => s.year_level)).size}
          </div>
          <div className="text-sm text-gray-600">Year Levels</div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          My Students
        </h2>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No students assigned yet.
            </p>
            <p className="text-sm text-gray-500">
              Contact your administrator to assign students to your subjects.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => router.push(`/teacher/student/${student.id}`)}
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
                  <p className="text-sm text-gray-600">Year {student.year_level} • {student.email}</p>
                  {student.subjects && student.subjects.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {student.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-violet-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
