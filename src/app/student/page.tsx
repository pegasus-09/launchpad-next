"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi, studentApi } from "@/lib/api"
import { requireRole } from "@/lib/auth/roleCheck"
import { normaliseRankingScore } from "@/lib/normalise"

// Phosphor-style SVG icons
const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-violet-600 inline-block mr-2">
    <path fill="currentColor" d="M216 72h-84.69l-27.66-27.66a16 16 0 0 0-11.31-4.69H40a16 16 0 0 0-16 16v136a16 16 0 0 0 16 16h176.89A15.13 15.13 0 0 0 232 192.89V88a16 16 0 0 0-16-16m0 120H40V56h52.69l27.66 27.66a16 16 0 0 0 11.31 4.69H216Z"/>
  </svg>
)

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-teal-600 inline-block mr-2">
    <path fill="currentColor" d="M224 48h-64a40 40 0 0 0-32 16a40 40 0 0 0-32-16H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h64a24 24 0 0 1 24 24a8 8 0 0 0 16 0a24 24 0 0 1 24-24h64a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16M96 192H32V64h64a24 24 0 0 1 24 24v112a40 40 0 0 0-24-8m128 0h-64a40 40 0 0 0-24 8V88a24 24 0 0 1 24-24h64Z"/>
  </svg>
)

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" className="text-violet-600 inline-block mr-2">
    <path fill="currentColor" d="M128 80a48 48 0 1 0 48 48a48.05 48.05 0 0 0-48-48m0 80a32 32 0 1 1 32-32a32 32 0 0 1-32 32m88-29.84q.06-2.16 0-4.32l14.92-18.64a8 8 0 0 0 1.48-7.06a107.21 107.21 0 0 0-10.88-26.25a8 8 0 0 0-6-3.93l-23.72-2.64q-1.48-1.56-3-3l-2.64-23.76a8 8 0 0 0-3.93-6a107.71 107.71 0 0 0-26.25-10.87a8 8 0 0 0-7.06 1.49L130.16 40q-2.16-.06-4.32 0L107.2 25.11a8 8 0 0 0-7.06-1.48a107.6 107.6 0 0 0-26.25 10.88a8 8 0 0 0-3.93 6l-2.64 23.76q-1.56 1.48-3 3L40.56 70a8 8 0 0 0-6 3.93a107.71 107.71 0 0 0-10.87 26.25a8 8 0 0 0 1.49 7.06L40 125.84q-.06 2.16 0 4.32L25.11 148.8a8 8 0 0 0-1.48 7.06a107.21 107.21 0 0 0 10.88 26.25a8 8 0 0 0 6 3.93l23.72 2.64q1.49 1.56 3 3L70 215.44a8 8 0 0 0 3.93 6a107.71 107.71 0 0 0 26.25 10.87a8 8 0 0 0 7.06-1.49L125.84 216q2.16.06 4.32 0l18.64 14.92a8 8 0 0 0 7.06 1.48a107.21 107.21 0 0 0 26.25-10.88a8 8 0 0 0 3.93-6l2.64-23.72q1.56-1.48 3-3l23.76-2.64a8 8 0 0 0 6-3.93a107.71 107.71 0 0 0 10.87-26.25a8 8 0 0 0-1.49-7.06Zm-16.1-6.5a73.93 73.93 0 0 1 0 8.68a8 8 0 0 0 1.74 5.48l14.19 17.73a91.57 91.57 0 0 1-6.23 15l-22.57 2.52a8 8 0 0 0-5.1 2.64a74.11 74.11 0 0 1-6.14 6.14a8 8 0 0 0-2.64 5.1l-2.51 22.58a91.32 91.32 0 0 1-15 6.23l-17.74-14.19a8 8 0 0 0-5-1.75h-.48a73.93 73.93 0 0 1-8.68 0a8 8 0 0 0-5.48 1.74l-17.78 14.2a91.57 91.57 0 0 1-15-6.23L82.89 187a8 8 0 0 0-2.64-5.1a74.11 74.11 0 0 1-6.14-6.14a8 8 0 0 0-5.1-2.64l-22.58-2.52a91.32 91.32 0 0 1-6.23-15l14.19-17.74a8 8 0 0 0 1.74-5.48a73.93 73.93 0 0 1 0-8.68a8 8 0 0 0-1.74-5.48L40.2 100.45a91.57 91.57 0 0 1 6.23-15L69 82.89a8 8 0 0 0 5.1-2.64a74.11 74.11 0 0 1 6.14-6.14A8 8 0 0 0 82.89 69l2.51-22.57a91.32 91.32 0 0 1 15-6.23l17.74 14.19a8 8 0 0 0 5.48 1.74a73.93 73.93 0 0 1 8.68 0a8 8 0 0 0 5.48-1.74l17.77-14.19a91.57 91.57 0 0 1 15 6.23L173.11 69a8 8 0 0 0 2.64 5.1a74.11 74.11 0 0 1 6.14 6.14a8 8 0 0 0 5.1 2.64l22.58 2.51a91.32 91.32 0 0 1 6.23 15l-14.19 17.74a8 8 0 0 0-1.74 5.53Z"/>
  </svg>
)

const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="text-violet-600">
    <path fill="currentColor" d="M216 64h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16M96 56a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm120 152H40V80h176Z"/>
  </svg>
)

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="text-teal-600">
    <path fill="currentColor" d="M232 224h-24V32h8a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16h8v192H24a8 8 0 0 0 0 16h208a8 8 0 0 0 0-16M64 32h128v192h-48v-48a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v48H64Zm80 192h-32v-40h32ZM88 64a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m48 0a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16h-16a8 8 0 0 1-8-8m-48 40a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m48 0a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16h-16a8 8 0 0 1-8-8m-48 40a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16H96a8 8 0 0 1-8-8m48 0a8 8 0 0 1 8-8h16a8 8 0 0 1 0 16h-16a8 8 0 0 1-8-8"/>
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
  work_experiences?: WorkExperience[]
  projects?: Project[]
}

interface Project {
  id: string
  title: string
  description?: string
}

interface WorkExperience {
  id: string
  title: string
  organisation: string
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
        const userProfile = await requireRole('student')
        
        // Load student profile
        const data = await studentApi.getProfile()
        
        // Get school name
        const schoolData = await authApi.getSchool(userProfile)

        // Add school name to profile data
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
  const workExperiences = profileData.work_experiences || []
  const projects = profileData.projects || []

  return (
    <div className="bg-linear-to-br from-violet-50 via-white to-teal-50">
    <div className="max-w-6xl mx-auto p-6 pb-12 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {profileData.profile.full_name}
        </h1>
        <p className="text-gray-600">
          {profileData.profile.year_level ? `Year ${profileData.profile.year_level}` : 'Student'} Dashboard
          {profileData.profile.school_name && (
            <span className="ml-2">• {profileData.profile.school_name}</span>
          )}
        </p>
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
            onClick={() => router.push('/assessment')}
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
              onClick={() => router.push('/assessment')}
              className="text-md border px-2.5 py-2 rounded-md cursor-pointer text-violet-600 hover:bg-violet-100 font-medium"
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/portfolio')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><FolderIcon /> Portfolio</h3>
          <p className="text-sm text-gray-600">
            Build your career portfolio with projects and achievements
          </p>
        </button>

        <button
          onClick={() => router.push('/subjects')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><BookOpenIcon /> My Subjects</h3>
          <p className="text-sm text-gray-600">
            View your enrolled subjects and performance
          </p>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="p-6 bg-white rounded-2xl shadow-sm border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all text-left cursor-pointer"
        >
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center"><GearIcon /> Settings</h3>
          <p className="text-sm text-gray-600">
            Update your profile and preferences
          </p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>

        {workExperiences.length === 0 && projects.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No recent activity. Start by adding a project or work experience to your portfolio.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                <BriefcaseIcon />
                <div>
                  <h4 className="font-medium text-gray-900">{project.title}</h4>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              </div>
            ))}

            {workExperiences.slice(0, 3).map((exp) => (
              <div key={exp.id} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl">
                <BuildingIcon />
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
    </div>
  )
}
