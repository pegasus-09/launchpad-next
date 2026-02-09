
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Edit2, Trash2, Save, X, Plus } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

interface Teacher {
  id: string
  full_name: string
  email: string
}

interface Class {
  id: string
  class_name: string
  year_level: string
  subject_id: string
}

interface Subject {
  id: string
  name: string
  category: string
}

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  class_name?: string
  class_names?: string[]
  class_ids?: string[]
}

interface TeacherData {
  teacher: Teacher
  classes: Class[]
  subjects: Subject[]
  students: Student[]
}

export default function TeacherDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teacherId = params.id as string

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TeacherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showClassModal, setShowClassModal] = useState(false)
  const [activeClassId, setActiveClassId] = useState<string>('all')

  // Load teacher data
  const loadTeacherData = useCallback(async () => {
    try {
      setLoading(true)
      const response = (await adminApi.getTeacherProfile(teacherId)) as TeacherData
      setData(response)
      setEditForm({
        full_name: response.teacher.full_name,
        email: response.teacher.email
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load teacher')
      }
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    loadTeacherData()
  }, [loadTeacherData])

  useEffect(() => {
    if (data?.classes?.length && activeClassId === 'all') {
      return
    }
    if (!data?.classes?.length) {
      setActiveClassId('all')
    }
  }, [data, activeClassId])

  const studentsByClass = useMemo(() => {
    if (!data) return []
    if (activeClassId === 'all') return data.students
    return data.students.filter((student) => student.class_ids?.includes(activeClassId))
  }, [data, activeClassId])

  async function handleUpdate() {
    try {
      await adminApi.updateTeacher(teacherId, editForm)
      await loadTeacherData()
      setIsEditing(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to update teacher: ' + message)
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteTeacher(teacherId)
      router.push('/admin/teachers')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete teacher: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading teacher data...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-rose-700">Error: {error || 'Teacher not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/teacher')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-emerald-800">
                {data.teacher.full_name}
              </h1>
              <p className="text-gray-600">{data.teacher.email}</p>
            </div>
            
            <div className="flex gap-2 items-center">
              <LogoutButton />
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center p-2 bg-white text-black border border-black rounded-lg hover:bg-black hover:text-white transition-colors"
                    aria-label="Edit teacher"
                    title="Edit teacher"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center justify-center p-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition-colors"
                    aria-label="Delete teacher"
                    title="Delete teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({
                        full_name: data.teacher.full_name,
                        email: data.teacher.email
                      })
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-violet-100">
              <h2 className="text-lg font-semibold mb-4">Profile</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Full Name</div>
                    <div className="font-medium">{data.teacher.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{data.teacher.email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Classes</span>
                  <span className="font-semibold">{data.classes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subjects</span>
                  <span className="font-semibold">{data.subjects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold">{data.students.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Classes and Subjects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subjects Taught */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-teal-100">
              <h2 className="text-lg font-semibold mb-4">Subjects Taught</h2>
              {data.subjects.length === 0 ? (
                <p className="text-gray-500">No subjects assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Classes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-violet-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Classes</h2>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Class
                </button>
              </div>
              
              {data.classes.length === 0 ? (
                <p className="text-gray-500">No classes assigned</p>
              ) : (
                <div className="space-y-3">
                  {data.classes.map((cls) => {
                    const subject = data.subjects.find(s => s.id === cls.subject_id)
                    return (
                      <div
                        key={cls.id}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{cls.class_name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {subject?.name} • Year {cls.year_level}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {subject?.category || 'General'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Students */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col gap-3 mb-4">
                <h2 className="text-lg font-semibold">Students</h2>
                {data.classes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveClassId('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                        activeClassId === 'all'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      All
                    </button>
                    {data.classes
                      .filter((cls) => data.students.some((s) => s.class_ids?.includes(cls.id)))
                      .map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setActiveClassId(cls.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          activeClassId === cls.id
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        {cls.class_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {studentsByClass.length === 0 ? (
                <p className="text-gray-500">No students in classes</p>
              ) : (
                <div className="space-y-2">
                  {studentsByClass.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-violet-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/student/${student.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-emerald-800">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {Array.isArray(student.class_names) && student.class_names.length > 0 ? (
                            student.class_names.map((name, idx) => (
                              <span
                                key={`${student.id}-class-${idx}`}
                                className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded"
                              >
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
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
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">Delete Teacher</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {data.teacher.full_name}? This will also remove them from all assigned classes.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Class</h3>
            <p className="text-gray-600 mb-4">
              To add a class, go to the Classes page and create a new class with this teacher assigned.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => router.push('/admin/classes')}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Go to Classes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
