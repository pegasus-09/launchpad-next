"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { studentApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { normaliseRankingScore } from "@/lib/normalise"

interface ProfileData {
  profile: {
    full_name: string
    email: string
    year_level?: string
  }
  assessment?: {
    ranking: Array<[string, string, number]>
    updated_at?: string
    raw_answers?: Record<string, number>
  }
  work_experiences?: Array<any>
  projects?: Array<any>
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication and role
        await requireRole('student')
        
        // Load student profile
        const data = await studentApi.getProfile()
        setProfileData(data)
      } catch (err: any) {
        console.error('Dashboard error:', err)
        setError(err.message || 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
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

  // ✅ FIXED: Look for 'assessment' not 'assessment_results'
  const hasAssessment = !!profileData.assessment
  const ranking = profileData.assessment?.ranking || []
  const workExperiences = profileData.work_experiences || []
  const projects = profileData.projects || []

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {profileData.profile.full_name}
        </h1>
        <p className="text-gray-600">
          {profileData.profile.year_level ? `Year ${profileData.profile.year_level}` : 'Student'} Dashboard
        </p>
      </div>

      {/* Assessment Section */}
      {!hasAssessment ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Take Your Career Assessment
          </h2>
          <p className="text-blue-800 mb-4">
            Complete the assessment to discover careers that match your interests, skills, and values.
          </p>
          <button
            onClick={() => router.push('/assessment')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
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
              onClick={() => router.push('/assessment')}
              className="text-sm cursor-pointer text-blue-600 hover:text-blue-700"
            >
              Retake Assessment
            </button>
          </div>

          {ranking.length === 0 ? (
            <p className="text-gray-600">No career matches found.</p>
          ) : (
            <div className="space-y-3">
              {ranking.slice(0, 10).map(([code, title, score], index) => (
                <div
                  key={code}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-500">{code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/portfolio')}
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📁 Portfolio</h3>
          <p className="text-sm text-gray-600">
            Build your career portfolio with projects and achievements
          </p>
        </button>

        <button
          onClick={() => router.push('/subjects')}
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-2">📚 My Subjects</h3>
          <p className="text-sm text-gray-600">
            View your enrolled subjects and performance
          </p>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors text-left"
        >
          <h3 className="font-semibold text-gray-900 mb-2">⚙️ Settings</h3>
          <p className="text-sm text-gray-600">
            Update your profile and preferences
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        
        {workExperiences.length === 0 && projects.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No recent activity. Start by adding a project or work experience to your portfolio.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 3).map((project: any) => (
              <div key={project.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded">
                <span className="text-2xl">💼</span>
                <div>
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              </div>
            ))}
            
            {workExperiences.slice(0, 3).map((exp: any) => (
              <div key={exp.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded">
                <span className="text-2xl">🏢</span>
                <div>
                  <h4 className="font-medium text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.organisation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}