"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, studentApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { normaliseRankingScore } from "@/lib/normalise"

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-teal-600 inline-block mr-2">
    <path fill="currentColor" d="M216 72h-84.69l-27.66-27.66a16 16 0 0 0-11.31-4.69H40a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h176.89A15.13 15.13 0 0 0 232 192.89V88a16 16 0 0 0-16-16m0 120H40V56h52.69l27.66 27.66a16 16 0 0 0 11.31 4.69H216Z"/>
  </svg>
)

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-violet-600 inline-block mr-2">
    <path fill="currentColor" d="M224 48h-64a40 40 0 0 0-32 16a40 40 0 0 0-32-16H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h64a24 24 0 0 1 24 24a8 8 0 0 0 16 0a24 24 0 0 1 24-24h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16M96 192H32V64h64a24 24 0 0 1 24 24v112a40 40 0 0 0-24-8m128 0h-64a40 40 0 0 0-24 8V88a24 24 0 0 1 24-24h64Z"/>
  </svg>
)

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-violet-600 inline-block mr-2">
    <path fill="currentColor" d="M216 64h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16M96 56a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm120 152H40V80h176Z"/>
  </svg>
)

interface ProfileData {
  profile: {
    full_name: string
    email: string
    year_level?: string
    school_name?: string
  }
  assessment?: {
    ranking: Array<[string, string, number]>
    updated_at?: string
    raw_answers?: Record<string, number>
  }
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await requireRole('student')
        const data = await studentApi.getProfile()
        const schoolData = await authApi.getSchool(userProfile)

        if (schoolData) {
          data.profile.school_name = schoolData.name
        }

        setProfileData(data)
      } catch (err: unknown) {
        console.error('Dashboard error:', err)
        if (err instanceof Error) {
          setError(err.message || 'Failed to load dashboard')
        } else {
          setError('Failed to load dashboard')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">No Data</h2>
          <p className="text-yellow-800">Unable to load profile data.</p>
        </div>
      </div>
    )
  }

  const hasAssessment = !!profileData.assessment
  const ranking = profileData.assessment?.ranking || []

  return (
    <div className="bg-linear-to-br from-violet-50 via-white to-teal-50">
    <div className="max-w-6xl mx-auto p-6 pb-12 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
        <span className="text-md text-gray-500 mt-4">Welcome,</span>
          <h1 className="text-emerald-800 text-3xl mt-0.5 mb-1">{profileData.profile.full_name}</h1>
        <p className="text-gray-600">
          {profileData.profile.year_level ? `Year ${profileData.profile.year_level}` : 'Student'}
          {profileData.profile.school_name && (
            <span className="ml-1">• {profileData.profile.school_name}</span>
          )}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/student/subjects')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><BookOpenIcon /> My Subjects</h3>
          <p className="text-sm text-gray-600">
            View your enrolled subjects and performance
          </p>
        </button>

        <button
          onClick={() => router.push('/student/portfolio')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><FolderIcon /> Portfolio</h3>
          <p className="text-sm text-gray-600">
            Build your career portfolio with projects and achievements
          </p>
        </button>

        <button
          onClick={() => router.push('/student/careers')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><BriefcaseIcon /> Career Goals</h3>
          <p className="text-sm text-gray-600">
            Search and select careers you&apos;re interested in pursuing
          </p>
        </button>
      </div>

      {/* Assessment Section */}
      {!hasAssessment ? (
        <div className="bg-linear-to-r from-violet-50 to-teal-50 border border-violet-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-violet-900 mb-2">
            Take Your Career Assessment
          </h2>
          <p className="text-gray-700 mb-4">
            Complete the assessment to discover careers that match your interests, skills, and values.
          </p>
          <button
            onClick={() => router.push('/student/assessment')}
            className="px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium cursor-pointer"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Your Career Matches
              </h2>
              {profileData.assessment?.updated_at && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(profileData.assessment.updated_at).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/student/assessment')}
              className="text-md border px-2.5 py-2 rounded-md cursor-pointer text-violet-600 hover:bg-violet-100 transition-colors font-medium"
            >
              Retake Assessment
            </button>
          </div>

          {ranking.length === 0 ? (
            <p className="text-gray-600">No career matches found.</p>
          ) : (
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
          )}
        </div>
      )}
    </div>
    </div>
  )
}
