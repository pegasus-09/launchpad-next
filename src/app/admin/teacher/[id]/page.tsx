
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Edit2, Trash2, Save, X, Plus } from 'lucide-react'

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

  // Load teacher data
  useEffect(() => {
    loadTeacherData()
  }, [teacherId])

  async function loadTeacherData() {
    try {
      setLoading(true)
      const response = await adminApi.getTeacherProfile(teacherId)
      setData(response)
      setEditForm({
        full_name: response.teacher.full_name,
        email: response.teacher.email
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate() {
    try {
      await adminApi.updateTeacher(teacherId, editForm)
      await loadTeacherData()
      setIsEditing(false)
    } catch (err: any) {
      alert('Failed to update teacher: ' + err.message)
    }
  }

  async function handleDelete() {
    try {
      await adminApi.deleteTeacher(teacherId)
      router.push('/admin/teachers')
    } catch (err: any) {
      alert('Failed to delete teacher: ' + err.message)
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
        <div className="text-red-600">Error: {error || 'Teacher not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/teacher')}
                className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-violet-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                  {data.teacher.full_name}
                </h1>
                <p className="text-gray-600">{data.teacher.email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-violet-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-white rounded-lg shadow p-6 mt-6">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Subjects Taught</h2>
              {data.subjects.length === 0 ? (
                <p className="text-gray-500">No subjects assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {subject.name}
                      {subject.category && (
                        <span className="ml-2 text-blue-600">• {subject.category}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Classes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Classes</h2>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Students</h2>
              
              {data.students.length === 0 ? (
                <p className="text-gray-500">No students in classes</p>
              ) : (
                <div className="space-y-2">
                  {data.students.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/student/${student.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          Year {student.year_level}
                        </span>
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                onClick={() => router.push('/admin/classes/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
