'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Search, UserPlus, MoreVertical, Pencil, Trash2 } from 'lucide-react'

type ClassRef = string | { id?: string; class_name?: string }
type SubjectRef = string | { id?: string; name?: string }

interface Teacher {
  id: string
  full_name: string
  email: string
  classes_taught: ClassRef[]
  subjects_taught: SubjectRef[]
  classes_count: number
  subjects_count: number
}

export default function TeachersPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  
  const [newTeacher, setNewTeacher] = useState({
    full_name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    loadTeachers()
  }, [])

  useEffect(() => {
    if (!activeMenuId) return

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element | null
      if (!target) return
      if (target.closest('[data-teacher-menu]')) return
      setActiveMenuId(null)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenuId])

  async function loadTeachers() {
    try {
      setLoading(true)
      const response = (await adminApi.getAllTeachers()) as { teachers: Teacher[] }
      setTeachers(response.teachers)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load teachers')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTeacher() {
    if (!newTeacher.full_name || !newTeacher.email || !newTeacher.password) {
      alert('Please fill in all fields')
      return
    }

    try {
      await adminApi.addTeacher(newTeacher)
      await loadTeachers()
      setShowAddModal(false)
      setNewTeacher({ full_name: '', email: '', password: '' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to add teacher: ' + message)
    }
  }

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleDeleteTeacher(teacherId: string) {
    if (!confirm('Delete this teacher? This will also remove them from assigned classes.')) {
      return
    }

    try {
      await adminApi.deleteTeacher(teacherId)
      setTeachers(prev => prev.filter(t => t.id !== teacherId))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete teacher: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading teachers...</div>
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
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-violet-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                Teachers
              </h1>
              <p className="text-gray-600 mt-1">
                {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} in your school
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Add Teacher
            </button>
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
              placeholder="Search teachers by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Teachers List */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No teachers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => router.push(`/admin/teacher/${teacher.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer overflow-hidden border border-violet-100 hover:border-violet-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                  <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                    {teacher.full_name}
                  </h3>
                      <p className="text-sm text-gray-600">{teacher.email}</p>
                    </div>
                    <div className="relative" data-teacher-menu>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setActiveMenuId(activeMenuId === teacher.id ? null : teacher.id)
                        }}
                        className="p-1.5 rounded-md hover:bg-violet-50 text-gray-500 hover:text-violet-600 transition-colors"
                        aria-label="Open teacher actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenuId === teacher.id && (
                        <div
                          className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/teacher/${teacher.id}`)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-black bg-white hover:bg-gray-100 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-700 hover:bg-rose-700/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">
                        {teacher.classes_count}
                      </div>
                      <div className="text-xs text-gray-600">Classes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">
                        {teacher.subjects_count}
                      </div>
                      <div className="text-xs text-gray-600">Subjects</div>
                    </div>
                  </div>

                  {/* Classes Taught (Badges) */}
                  {Array.isArray(teacher.classes_taught) && teacher.classes_taught.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-2">Classes:</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes_taught.slice(0, 3).map((cls: ClassRef, idx: number) => {
                          const className = typeof cls === 'string' ? cls : (cls?.class_name || 'Unnamed Class')
                          return (
                            <span
                              key={typeof cls === 'string' ? `class-${idx}` : (cls?.id || `class-${idx}`)}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-800"
                            >
                              {className}
                            </span>
                          )
                        })}
                        {teacher.classes_taught.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            +{teacher.classes_taught.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Subjects Taught (Badges) */}
                  {Array.isArray(teacher.subjects_taught) && teacher.subjects_taught.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Subjects:</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects_taught.slice(0, 3).map((subject: SubjectRef, idx: number) => {
                          const subjectName = typeof subject === 'string' ? subject : (subject?.name || 'Unnamed Subject')
                          return (
                            <span
                              key={typeof subject === 'string' ? `subject-${idx}` : (subject?.id || `subject-${idx}`)}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
                            >
                              {subjectName}
                            </span>
                          )
                        })}
                        {teacher.subjects_taught.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            +{teacher.subjects_taught.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 bg-linear-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
              Add New Teacher
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newTeacher.full_name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="john.smith@school.edu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Teacher can change this after first login
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewTeacher({ full_name: '', email: '', password: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTeacher}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
