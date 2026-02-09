'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Search, Save, Trash2 } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'
import { HARD_CODED_SUBJECTS } from '@/lib/subjects'

interface Subject {
  id: string
  name: string
  category?: string
}

interface Teacher {
  id: string
  full_name: string
  email: string
}

interface Student {
  id: string
  full_name: string
  email: string
  year_level?: string
  class_names?: string[]
  class_ids?: string[]
}

interface ClassItem {
  id: string
  class_name: string
  year_level?: string
  subject_id?: string
  teacher_id?: string
  subject_name?: string
  teacher_name?: string
}

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [formData, setFormData] = useState({
    subject_id: '',
    teacher_id: '',
    year_level: '9',
    class_name: ''
  })

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [studentSearch, setStudentSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showYearWarning, setShowYearWarning] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setSelectedStudents((prev) => {
      const allowedIds = new Set(
        students
          .filter((student) => student.year_level === formData.year_level)
          .map((student) => student.id)
      )
      return prev.filter((id) => allowedIds.has(id))
    })
  }, [formData.year_level, students])

  async function loadData() {
    try {
      setLoading(true)
      const [classesRes, subjectsRes, teachersRes, studentsRes] = (await Promise.all([
        adminApi.getAllClasses(),
        adminApi.getAllSubjects(),
        adminApi.getAllTeachers(),
        adminApi.getAllStudents(),
      ])) as [
        { classes?: ClassItem[] },
        { subjects?: Subject[] } | Subject[],
        { teachers?: Teacher[] },
        { students?: Student[] }
      ]

      const targetClass = classesRes.classes?.find((cls) => cls.id === classId)
      if (!targetClass) {
        setError('Class not found')
        return
      }

      const subjectList = Array.isArray(subjectsRes) ? subjectsRes : subjectsRes.subjects || []

      setSubjects(subjectList)
      setTeachers(teachersRes.teachers || [])
      setStudents(studentsRes.students || [])

      const subjectValue = subjectList.length > 0
        ? (targetClass.subject_id || '')
        : (targetClass.subject_name || HARD_CODED_SUBJECTS[0]?.name || '')

      setFormData({
        subject_id: subjectValue,
        teacher_id: targetClass.teacher_id || '',
        year_level: targetClass.year_level || '9',
        class_name: targetClass.class_name || ''
      })

      const initialSelected = (studentsRes.students || [])
        .filter((student) => Array.isArray(student.class_ids) && student.class_ids.includes(classId))
        .map((student) => student.id)
      setSelectedStudents(initialSelected)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load class data')
      }
    } finally {
      setLoading(false)
    }
  }

  const orderedSubjects = useMemo(() => {
    const subjectByName = new Map(subjects.map((subject) => [subject.name.trim().toLowerCase(), subject]))
    const ordered = HARD_CODED_SUBJECTS.map((subject) => subjectByName.get(subject.name.trim().toLowerCase()))
      .filter(Boolean) as Subject[]

    return ordered.length > 0 ? ordered : subjects
  }, [subjects])

  const useSubjectName = subjects.length === 0

  const subjectOptions = useMemo(() => {
    if (useSubjectName) {
      return HARD_CODED_SUBJECTS.map((subject) => ({
        value: subject.name,
        label: `${subject.name} (${subject.category})`
      }))
    }

    return orderedSubjects.map((subject) => ({
      value: subject.id,
      label: `${subject.name}${subject.category ? ` (${subject.category})` : ''}`
    }))
  }, [orderedSubjects, useSubjectName])

  const eligibleStudents = useMemo(() => {
    return students.filter((student) => student.year_level === formData.year_level)
  }, [students, formData.year_level])

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase()
    if (!query) return eligibleStudents
    return eligibleStudents.filter((student) =>
      student.full_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    )
  }, [eligibleStudents, studentSearch])

  const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every(
    (student) => selectedStudents.includes(student.id)
  )

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  function toggleSelectAll() {
    if (filteredStudents.length === 0) return
    const filteredIds = filteredStudents.map((student) => student.id)
    setSelectedStudents((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredIds.includes(id))
      }
      const merged = new Set([...prev, ...filteredIds])
      return Array.from(merged)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.subject_id || !formData.teacher_id || !formData.class_name) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSubmitting(true)
      await adminApi.updateClass(classId, {
        ...(useSubjectName ? { subject_name: formData.subject_id } : { subject_id: formData.subject_id }),
        teacher_id: formData.teacher_id,
        year_level: formData.year_level,
        class_name: formData.class_name,
        student_ids: selectedStudents
      })
      router.push('/admin/classes')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to update class: ' + message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this class? This will remove all student assignments.')) {
      return
    }

    try {
      await adminApi.deleteClass(classId)
      router.push('/admin/classes')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete class: ' + message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button
                onClick={() => router.push('/admin/classes')}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="text-2xl font-bold text-emerald-800">
                Edit Class
              </h1>
              <p className="text-gray-600 mt-1">Update class details and roster</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-2 text-sm text-rose-700 border border-rose-700 rounded-lg hover:bg-rose-700/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete Class
              </button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name *
              </label>
              <input
                type="text"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a subject</option>
                {subjectOptions.map((subject) => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
              {useSubjectName && (
                <p className="text-xs text-rose-700 mt-1">
                  Subjects are using the fixed list while the database syncs.
                </p>
              )}
            </div>

            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher *
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level *
              </label>
              <select
                value={formData.year_level}
                onChange={(e) => {
                  if (e.target.value !== formData.year_level) {
                    setSelectedStudents([])
                    setShowYearWarning(true)
                  }
                  setFormData({ ...formData, year_level: e.target.value })
                }}
                className="w-full px-4 py-3 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                required
              >
                <option value="9">Year 9</option>
                <option value="10">Year 10</option>
                <option value="11">Year 11</option>
                <option value="12">Year 12</option>
              </select>
              {showYearWarning && (
                <p className="text-xs text-rose-700 mt-1">
                  Year level changed. Student selections were cleared to match the new year.
                </p>
              )}
            </div>

            {/* Assign Students */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assign Students
                  </label>
                  <p className="text-xs text-gray-500">Showing Year {formData.year_level} students.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                  {allFilteredSelected ? 'Clear filtered' : 'Select filtered'}
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="border border-violet-100 rounded-xl max-h-64 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No students match this year or search.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <li key={student.id} className="p-3 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudent(student.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-emerald-800">{student.full_name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                            <span className="text-xs text-gray-500">Year {student.year_level || '—'}</span>
                          </div>
                          {Array.isArray(student.class_names) && student.class_names.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {student.class_names.map((name, idx) => (
                                <span
                                  key={`${student.id}-class-${idx}`}
                                  className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-violet-100">
              <button
                type="button"
                onClick={() => router.push('/admin/classes')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
