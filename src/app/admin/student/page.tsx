'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Search, CheckCircle, XCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  class_name?: string
  class_id?: string
  has_assessment: boolean
  subjects_count?: number
}

export default function StudentsPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      setLoading(true)
      const response = (await adminApi.getAllStudents()) as { students?: Student[] }
      setStudents(response.students || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load students')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleDeleteStudent(studentId: string) {
    if (!confirm('Delete this student? This action cannot be undone.')) {
      return
    }

    try {
      await adminApi.deleteStudent(studentId)
      setStudents(prev => prev.filter(s => s.id !== studentId))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete student: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading students...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-violet-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                Students
              </h1>
              <p className="text-gray-600 mt-1">
                {students.length} student{students.length !== 1 ? 's' : ''} in your school
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                onClick={() => router.push(`/admin/student/${student.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-violet-100 hover:border-violet-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.has_assessment ? (
                        <CheckCircle className="w-5 h-5 text-teal-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setActiveMenuId(activeMenuId === student.id ? null : student.id)
                          }}
                          className="p-1.5 rounded-md hover:bg-violet-50 text-gray-500 hover:text-violet-600 transition-colors"
                          aria-label="Open student actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenuId === student.id && (
                          <div
                            className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/student/${student.id}/edit`)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-violet-50"
                            >
                              <Pencil className="w-4 h-4 text-violet-600" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full font-medium">
                      Class {student.class_name || student.year_level}
                    </span>
                    {student.has_assessment && (
                      <span className="text-xs text-teal-600 font-medium">
                        Report Complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
