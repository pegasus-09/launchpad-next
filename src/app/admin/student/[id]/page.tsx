"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { requireRole } from "@/lib/auth/roleCheck"
import { createClient } from "@/lib/supabase/client"
import { normaliseRankingScore } from "@/lib/normalise"

interface StudentProfile {
  id: string
  full_name: string
  email: string
  year_level: string
  school_id: string
}

interface Assessment {
  ranking: Array<[string, string, number]>
  raw_answers: Record<string, number>
  updated_at: string
}

interface StudentData {
  profile: StudentProfile
  assessment: Assessment | null
}

export default function StudentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication and role
        await requireRole('admin')

        // Get auth token
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          throw new Error('Not authenticated')
        }

        // Fetch student details
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/student/${studentId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load student details')
        }

        const data = await response.json()
        setStudentData(data)
      } catch (err: any) {
        console.error('Student details error:', err)
        setError(err.message || 'Failed to load student details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [studentId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => router.push('/admin/')}
              className="cursor-pointer mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return null
  }

  const hasAssessment = !!studentData.assessment
  const ranking = studentData.assessment?.ranking || []

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={() => router.push('/admin/')}
            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Student Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {studentData.profile.full_name}
              </h1>
              <div className="space-y-1">
                <p className="text-gray-600">{studentData.profile.email}</p>
                <p className="text-gray-600">Year {studentData.profile.year_level}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/student/${studentId}/edit`)}
                className="cursor-pointer px-4 py-2 border border-violet-300 text-violet-600 rounded-lg hover:bg-violet-50 transition-colors font-medium"
              >
                Edit Student
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this student?')) {
                    // TODO: Implement delete
                    console.log('Delete student:', studentId)
                  }
                }}
                className="cursor-pointer px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Status</h2>
            {hasAssessment && studentData.assessment?.updated_at && (
              <span className="text-sm text-gray-500">
                Completed: {new Date(studentData.assessment.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {!hasAssessment ? (
            <div className="text-center py-8 bg-violet-50 rounded-xl border border-violet-200">
              <p className="text-violet-800 font-medium mb-2">Assessment Not Completed</p>
              <p className="text-sm text-violet-600">
                This student has not yet taken the career assessment.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl border border-teal-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-teal-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div>
                <p className="font-medium text-teal-900">Assessment Completed</p>
                
              </div>
            </div>
          )}
        </div>

        {/* Career Matches */}
        {hasAssessment && ranking.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Career Matches</h2>
            <div className="space-y-3">
              {ranking.slice(0, 5).map(([code, title, score], index) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-violet-100 text-violet-700 font-bold rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-500">{code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-teal-600">
                      {normaliseRankingScore(score)}%
                    </div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Answers Summary (Optional) */}
        {hasAssessment && studentData.assessment?.raw_answers && (
          // TODO: Make this a detailed breakdown page
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-600 mb-1">Aptitudes</p>
                <p className="text-2xl font-bold text-violet-900">
                  {Object.keys(studentData.assessment.raw_answers).filter(k => k.startsWith('A')).length}
                </p>
              </div>
              <div className="p-4 bg-teal-50 rounded-xl">
                <p className="text-sm text-teal-600 mb-1">Interests</p>
                <p className="text-2xl font-bold text-teal-900">
                  {Object.keys(studentData.assessment.raw_answers).filter(k => k.startsWith('I')).length}
                </p>
              </div>
              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-600 mb-1">Traits</p>
                <p className="text-2xl font-bold text-violet-900">
                  {Object.keys(studentData.assessment.raw_answers).filter(k => k.startsWith('T')).length}
                </p>
              </div>
              <div className="p-4 bg-teal-50 rounded-xl">
                <p className="text-sm text-teal-600 mb-1">Values</p>
                <p className="text-2xl font-bold text-teal-900">
                  {Object.keys(studentData.assessment.raw_answers).filter(k => k.startsWith('V')).length}
                </p>
              </div>
              <div className="p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-600 mb-1">Work Styles</p>
                <p className="text-2xl font-bold text-violet-900">
                  {Object.keys(studentData.assessment.raw_answers).filter(k => k.startsWith('W')).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}