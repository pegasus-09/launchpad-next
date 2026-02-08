'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { requireRole } from '@/lib/auth/roleCheck'
import { ArrowLeft, Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface ClassItem {
  id: string
  class_name: string
  year_level?: string
  subject_name?: string
  subject_category?: string
  teacher_name?: string
  teacher_id?: string
  subject_id?: string
  student_count?: number
}

export default function ClassesPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    try {
      setLoading(true)
      await requireRole('admin')
      const response = await adminApi.getAllClasses()
      setClasses(response.classes || [])
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load classes')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return classes
    return classes.filter((cls) =>
      cls.class_name.toLowerCase().includes(query) ||
      (cls.subject_name || '').toLowerCase().includes(query) ||
      (cls.teacher_name || '').toLowerCase().includes(query)
    )
  }, [classes, searchQuery])

  async function handleDelete(classId: string) {
    if (!confirm('Delete this class? This will remove all student assignments.')) {
      return
    }

    try {
      await adminApi.deleteClass(classId)
      setClasses((prev) => prev.filter((cls) => cls.id !== classId))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete class: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading classes...</div>
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
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-emerald-800">
                Classes
              </h1>
              <p className="text-gray-600 mt-1">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} in your school
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/classes/new')}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Class
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by class, subject, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-violet-100 p-12 text-center">
            <p className="text-gray-600 mb-4">No classes found.</p>
            <button
              onClick={() => router.push('/admin/classes/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first class
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teacher</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Students</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-violet-50/30">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cls.class_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cls.subject_name || '—'}
                      {cls.subject_category ? ` · ${cls.subject_category}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cls.year_level ? `Year ${cls.year_level}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-emerald-800">
                      {cls.teacher_name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{cls.student_count ?? 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/admin/classes/${cls.id}/edit`)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-black bg-white hover:bg-gray-100 transition-colors"
                          aria-label="Edit class"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-rose-700 bg-white hover:bg-rose-700/10 transition-colors"
                          aria-label="Delete class"
                        >
                          <Trash2 className="w-4 h-4" />
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
  )
}
