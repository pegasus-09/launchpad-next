'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, MoreVertical, Pencil, Trash2, UserPlus } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  class_name?: string
  class_id?: string
  class_names?: string[]
  class_ids?: string[]
  has_assessment: boolean
  has_teacher_comment?: boolean
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

  useEffect(() => {
    if (!activeMenuId) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element | null
      if (!target) return
      if (target.closest('[data-student-menu]')) return
      setActiveMenuId(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenuId])

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

  function getAssessmentStatus(student: Student) {
    if (!student.has_assessment) {
      return {
        label: 'Assessment not submitted',
        icon: XCircle,
        iconClass: 'text-rose-700',
        bgClass: 'bg-rose-100'
      }
    }

    if (student.has_teacher_comment) {
      return {
        label: 'Report available',
        icon: CheckCircle,
        iconClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50'
      }
    }

    return {
      label: 'Pending teacher comment', 
      icon: Clock,
      iconClass: 'text-amber-500',
      bgClass: 'bg-amber-50'
    }
  }

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
        <div className="text-rose-700">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-white">
                Students
              </h1>
              <p className="text-gray-400 mt-1">
                {students.length} student{students.length !== 1 ? 's' : ''} in your school
              </p>
            </div>
            <LogoutButton variant="dark" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Action + Search */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.push('/admin/student/new')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </button>
        </div>
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
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-violet-100 hover:border-violet-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const status = getAssessmentStatus(student)
                        const StatusIcon = status.icon
                        return (
                          <div className="relative group">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${status.bgClass}`}
                              aria-label={status.label}
                            >
                              <StatusIcon className={`w-5 h-5 ${status.iconClass}`} />
                            </div>
                            <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg">
                                {status.label}
                              </span>
                              <span className="absolute left-1/2 -top-2 -translate-x-1/2 border-4 border-transparent border-b-slate-900" />
                            </div>
                          </div>
                        )
                      })()}
                      <div className="relative" data-student-menu>
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
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-black bg-white hover:bg-gray-100 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-700/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-sm rounded-full font-medium">
                      Year {student.year_level || '—'}
                    </span>
                    {Array.isArray(student.class_names) && student.class_names.length > 0 ? (
                      student.class_names.map((name, idx) => (
                        <span
                          key={`${student.id}-class-${idx}`}
                          className="px-3 py-1 bg-violet-100 text-violet-700 text-sm rounded-full font-medium"
                        >
                          {name}
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                        Unassigned
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
