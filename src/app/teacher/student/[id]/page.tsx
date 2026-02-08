"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { teacherApi } from "@/lib/api"
import { requireRole, UserProfile } from "@/lib/auth/roleCheck"
import LogoutButton from "@/components/auth/LogoutButton"
import { ArrowLeft, ChevronRight } from "lucide-react"

interface StudentDetail {
  id: string
  full_name: string
  email: string
  year_level: string
  classes: {
    id: string
    class_name: string
    subject_name: string
  }[]
}

interface ClassWithComment {
  id: string
  class_name: string
  subject_name: string
  hasComment?: boolean
}

export default function TeacherStudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null)
  const [classesWithComments, setClassesWithComments] = useState<ClassWithComment[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStudentData() {
      if (!studentId) return
      try {
        const userProfile = await requireRole('teacher')
        setTeacherProfile(userProfile)
        const data = await teacherApi.getStudent(studentId)
        setStudent(data)

        // Check which classes have comments
        if (data.classes && data.classes.length > 0) {
          const classesChecked = await Promise.all(
            data.classes.map(async (cls: { id: string; class_name: string; subject_name: string }) => {
              try {
                const comment = await teacherApi.getComment(studentId, cls.id)
                return { ...cls, hasComment: !!comment }
              } catch {
                return { ...cls, hasComment: false }
              }
            })
          )
          setClassesWithComments(classesChecked)
        }
      } catch (err: unknown) {
        console.error('Teacher student detail page error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load student details')
      } finally {
        setLoading(false)
      }
    }
    loadStudentData()
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error && !student) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">Error</h2>
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Student Not Found</h2>
          <p className="text-amber-700">The student you are looking for does not exist or is not assigned to you.</p>
          <button onClick={() => router.push('/teacher')} className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
        {/* Header */}
        <button
          onClick={() => router.push('/teacher')}
          className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <h1 className="text-3xl font-bold text-emerald-800">
            {student.full_name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Year {student.year_level} • {student.email}</p>
        </div>

        {/* Student Classes */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Assigned Classes
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Click on a class to add or edit your comment for this student.
          </p>
          {classesWithComments.length > 0 ? (
            <div className="space-y-3">
              {classesWithComments.map((cls) => (
                <div
                  key={cls.id}
                  onClick={() => router.push(`/teacher/student/${studentId}/${cls.id}`)}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div>
                    <h3 className="font-semibold text-violet-800">{cls.class_name}</h3>
                    <p className="text-sm text-gray-600">Subject: {cls.subject_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {cls.hasComment && (
                      <span className="inline-flex items-center justify-center text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        Comment Added
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">This student is not assigned to any of your classes.</p>
          )}
        </div>
      </div>
    </div>
  )
}
