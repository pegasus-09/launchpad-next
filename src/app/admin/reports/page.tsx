'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Users, BookOpen, TrendingUp } from 'lucide-react'

interface TopCareer {
  soc_code: string
  career_name: string
  score: number
}

interface Student {
  id: string
  full_name: string
  email: string
  year_level: string
  class_name?: string
  top_career: TopCareer | null
  has_assessment: boolean
}

interface Class {
  id: string
  class_name: string
  year_level: string
  subject_name: string
  subject_category: string
  teacher_name: string
  student_count: number
}

interface ReportsData {
  classes: Class[]
  students: Student[]
}

export default function ReportsPage() {
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReportsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      setLoading(true)
      const response = (await adminApi.getReportsSummary()) as ReportsData
      setData(response)
    } catch (err: unknown) {
      console.error('Reports error:', err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load reports')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading reports...</div>
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

  const studentsWithAssessments = data?.students.filter(s => s.has_assessment) || []
  const studentsWithoutAssessments = data?.students.filter(s => !s.has_assessment) || []

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-violet-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">Career recommendations and class summaries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-violet-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Classes</h3>
            </div>
            <p className="text-3xl font-bold text-violet-600">{data?.classes.length || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Users className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Assessments Completed</h3>
            </div>
            <p className="text-3xl font-bold text-teal-600">{studentsWithAssessments.length}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Completion Rate</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {data?.students.length ? Math.round((studentsWithAssessments.length / data.students.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Students with Career Recommendations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-violet-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Student Career Recommendations</h2>
          
          {studentsWithAssessments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No students have completed assessments yet</p>
          ) : (
            <div className="space-y-3">
              {studentsWithAssessments.map((student) => (
                <div
                  key={student.id}
                  className="p-4 border border-violet-100 rounded-lg hover:border-violet-300 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/student/${student.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.email} • Class {student.class_name || student.year_level}
                      </p>
                    </div>
                    {student.top_career && (
                      <div className="text-right">
                        <div className="font-semibold text-teal-700">{student.top_career.career_name}</div>
                        <div className="text-sm text-gray-600">
                          Match: {(student.top_career.score * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Classes Summary */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Classes Overview</h2>
          
          {!data?.classes || data.classes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No classes found</p>
          ) : (
            <div className="space-y-3">
              {data.classes.map((cls) => (
                <div key={cls.id} className="p-4 border border-teal-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{cls.class_name}</h3>
                      <p className="text-sm text-gray-600">
                        {cls.subject_name} • {cls.teacher_name} • Year {cls.year_level}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">{cls.student_count}</div>
                      <div className="text-xs text-gray-600">students</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students Without Assessments */}
        {studentsWithoutAssessments.length > 0 && (
          <div className="bg-orange-50 rounded-xl shadow-lg p-6 mt-8 border border-orange-200">
            <h2 className="text-xl font-semibold mb-4 text-orange-900">
              Students Pending Assessment ({studentsWithoutAssessments.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {studentsWithoutAssessments.map((student) => (
                <div key={student.id} className="p-3 bg-white rounded-lg border border-orange-200">
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-600">Class {student.class_name || student.year_level}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
