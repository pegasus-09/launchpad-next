"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { requireRole } from "@/lib/auth/roleCheck"
import { adminApi } from "@/lib/api"
import { ArrowLeft } from "lucide-react"
import LogoutButton from "@/components/auth/LogoutButton"

interface Subject {
  id: string
  name: string
  code: string
  description?: string
  year_levels: string[]
  teacher_count: number
  student_count: number
}

export default function ManageSubjectsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        await requireRole('admin')
        const data = (await adminApi.getAllSubjects()) as { subjects?: Subject[] }
        setSubjects(data.subjects || [])
      } catch (err: unknown) {
        console.log('Subjects API not available yet')
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Failed to load subjects')
        }
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-rose-700/10 border border-rose-700/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-rose-700 mb-2">Error</h2>
            <p className="text-rose-700">{error}</p>
            <button
              onClick={() => router.push('/admin/')}
              className="cursor-pointer mt-4 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/admin/')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-white">
                Manage Subjects
              </h1>
              <p className="text-gray-400 mt-1">Create and manage subject offerings for your school</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                + Add Subject
              </button>
              <LogoutButton variant="dark" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100">
            <div className="text-3xl font-bold text-violet-600 mb-2">{subjects.length}</div>
            <div className="text-sm text-gray-600">Total Subjects</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-teal-100">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              {subjects.reduce((acc, s) => acc + (s.teacher_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Teachers Assigned</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100">
            <div className="text-3xl font-bold text-violet-500 mb-2">
              {subjects.reduce((acc, s) => acc + (s.student_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Student Enrollments</div>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">All Subjects</h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
          </div>

          {filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                {searchTerm ? 'No subjects found matching your search.' : 'No subjects in the system yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year Levels</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teachers</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{subject.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{subject.code}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {subject.year_levels && subject.year_levels.length > 0
                            ? subject.year_levels.map((yl, idx) => (
                                <span key={idx} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                                  Year {yl}
                                </span>
                              ))
                            : <span className="text-gray-400">-</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{subject.teacher_count || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{subject.student_count || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button className="text-violet-600 hover:text-violet-700 font-medium hover:underline cursor-pointer">
                            Edit
                          </button>
                          <button className="text-rose-700 hover:text-rose-800 font-medium hover:underline cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
