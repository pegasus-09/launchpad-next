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

interface TeacherStatus {
  total_teachers: number
  commented_teachers: number
  all_commented: boolean
  missing: Array<{ id: string; name: string }>
}

interface AnalysisData {
  quality_check?: {
    valid: boolean
    confidence: number
    flags: string[]
    recommendation: string
  }
  career_explanations?: Record<string, {
    title: string
    score: number
    rank: number
    explanation: string
  }>
  career_rankings?: Array<{
    soc_code: string
    title: string
    score: number
  }>
  strengths?: Array<{
    dimension: string
    label: string
    score: number
    teacher_confirmed: boolean
  }>
  gaps?: Array<{
    dimension: string
    label: string
    score: number
    severity: string
  }>
  strength_narrative?: string
  confidence_score?: number
  updated_at?: string
}

interface RetakeStatus {
  has_request: boolean
  request_id?: string
  status: 'pending' | 'approved' | 'denied' | 'used' | null
  requested_at?: string
  responded_at?: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [retakeStatus, setRetakeStatus] = useState<RetakeStatus | null>(null)
  const [retakeStatusLoaded, setRetakeStatusLoaded] = useState(false)
  const [retakeLoading, setRetakeLoading] = useState(false)
  const [retakeError, setRetakeError] = useState<string | null>(null)

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

        // Load teacher status, analysis, and retake status in parallel
        if (data.assessment) {
          const [statusResult, analysisResult, retakeResult] = await Promise.all([
            studentApi.getTeacherStatus().catch(() => null),
            studentApi.getAnalysis().catch(() => null),
            studentApi.getRetakeStatus().catch(() => null),
          ])
          if (statusResult) setTeacherStatus(statusResult)
          if (analysisResult?.analysis) setAnalysis(analysisResult.analysis)
          if (retakeResult) setRetakeStatus(retakeResult)
          setRetakeStatusLoaded(true)
        }
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

  const handleTriggerAnalysis = async () => {
    setAnalysisLoading(true)
    setAnalysisError(null)
    try {
      const result = await studentApi.triggerAnalysis()
      setAnalysis(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAnalysisError(err.message)
      } else {
        setAnalysisError('Failed to generate analysis')
      }
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleRequestRetake = async () => {
    setRetakeLoading(true)
    setRetakeError(null)
    try {
      await studentApi.requestRetake()
      setRetakeStatus({ has_request: true, status: 'pending', requested_at: new Date().toISOString() })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setRetakeError(err.message)
      } else {
        setRetakeError('Failed to request retake')
      }
    } finally {
      setRetakeLoading(false)
    }
  }

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
  const canTriggerAnalysis = teacherStatus?.all_commented === true
  const confidenceColor = analysis?.confidence_score
    ? analysis.confidence_score >= 0.7 ? 'text-green-600 bg-green-50 border-green-200'
    : analysis.confidence_score >= 0.4 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
    : 'text-red-600 bg-red-50 border-red-200'
    : ''

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
            <span className="ml-1">&bull; {profileData.profile.school_name}</span>
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
        <>
          {/* Career Matches */}
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
              {/* Retake flow: approved → retake, pending → waiting, denied/used/none → can request */}
              {!retakeStatusLoaded ? (
                <span className="text-sm text-gray-400 px-3 py-2">Loading...</span>
              ) : retakeStatus?.status === 'approved' ? (
                <button
                  onClick={() => router.push('/student/assessment')}
                  className="text-md border border-emerald-300 px-2.5 py-2 rounded-md cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
                >
                  Retake Assessment
                </button>
              ) : retakeStatus?.status === 'pending' ? (
                <span className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md font-medium">
                  Retake requested
                </span>
              ) : (
                <button
                  onClick={handleRequestRetake}
                  disabled={retakeLoading}
                  className="text-md border px-2.5 py-2 rounded-md cursor-pointer text-violet-600 hover:bg-violet-100 transition-colors font-medium disabled:opacity-50"
                >
                  {retakeLoading ? 'Requesting...' : 'Request Retake'}
                </button>
              )}
              {retakeError && (
                <p className="text-sm text-rose-600 mt-1">{retakeError}</p>
              )}
            </div>

            {ranking.length === 0 ? (
              <p className="text-gray-600">No career matches found.</p>
            ) : (
              <div className="space-y-3">
                {ranking.slice(0, 5).map(([code, title, score], index) => {
                  const explanation = analysis?.career_explanations?.[code]
                  return (
                    <div
                      key={code}
                      className="p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
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
                      {explanation?.explanation && (
                        <p className="mt-3 text-sm text-gray-600 pl-14">
                          {explanation.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Teacher Status & AI Analysis Section */}
          {teacherStatus && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                AI Career Analysis
              </h2>

              {/* Teacher Status Card */}
              <div className={`rounded-xl p-4 mb-4 border ${
                teacherStatus.all_commented
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    teacherStatus.all_commented ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                  <span className={`font-medium text-sm ${
                    teacherStatus.all_commented ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    Teacher Feedback: {teacherStatus.commented_teachers} of {teacherStatus.total_teachers} submitted
                  </span>
                </div>
                {!teacherStatus.all_commented && teacherStatus.missing.length > 0 && (
                  <p className="text-sm text-amber-700 ml-4">
                    Waiting for: {teacherStatus.missing.map(t => t.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Quality Warning */}
              {analysis?.quality_check && !analysis.quality_check.valid && (
                <div className="rounded-xl p-4 mb-4 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    Assessment Quality Notice
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {analysis.quality_check.recommendation}
                  </p>
                </div>
              )}

              {/* Analysis Button or Results */}
              {!analysis ? (
                <div>
                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={!canTriggerAnalysis || analysisLoading}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      canTriggerAnalysis && !analysisLoading
                        ? 'bg-violet-600 text-white hover:bg-violet-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                    title={!canTriggerAnalysis ? 'All teachers must submit comments before analysis can run' : ''}
                  >
                    {analysisLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Generating Analysis...
                      </span>
                    ) : 'Generate AI Analysis'}
                  </button>
                  {!canTriggerAnalysis && (
                    <p className="text-sm text-gray-500 mt-2">
                      All teachers must submit their comments before the AI analysis can be generated.
                    </p>
                  )}
                  {analysisError && (
                    <p className="text-sm text-red-600 mt-2">{analysisError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Confidence Badge */}
                  {analysis.confidence_score !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${confidenceColor}`}>
                        Confidence: {Math.round(analysis.confidence_score * 100)}%
                      </span>
                      {analysis.updated_at && (
                        <span className="text-xs text-gray-400">
                          Generated: {new Date(analysis.updated_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Strengths</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {analysis.strengths.map((s) => (
                          <div key={s.dimension} className="p-3 bg-violet-50 border border-violet-100 rounded-xl">
                            <div className="flex flex-wrap items-center justify-between gap-y-1">
                              <span className="font-medium text-violet-900 text-sm">{s.label}</span>
                              {s.teacher_confirmed && (
                                <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full border border-teal-200 whitespace-nowrap ml-auto">
                                  Teacher confirmed
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 w-full bg-violet-200 rounded-full h-1.5">
                              <div
                                className="bg-violet-600 h-1.5 rounded-full"
                                style={{ width: `${Math.round(s.score * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Growth Opportunities */}
                  {analysis.gaps && analysis.gaps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Growth Opportunities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {analysis.gaps.map((g) => (
                          <div key={g.dimension} className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <div className="flex flex-wrap items-center justify-between gap-y-1">
                              <span className="font-medium text-gray-800 text-sm">{g.label}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ml-auto ${
                                g.severity === 'significant' ? 'bg-red-100 text-red-700'
                                : g.severity === 'moderate' ? 'bg-orange-100 text-orange-700'
                                : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {g.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Narrative */}
                  {analysis.strength_narrative && (
                    <div className="bg-linear-to-r from-violet-50 to-teal-50 rounded-xl p-5 border border-violet-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Profile Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{analysis.strength_narrative}</p>
                    </div>
                  )}

                  {/* Re-generate Button */}
                  <button
                    onClick={handleTriggerAnalysis}
                    disabled={analysisLoading}
                    className="text-sm border px-3 py-1.5 rounded-md cursor-pointer text-violet-600 hover:bg-violet-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analysisLoading ? 'Regenerating...' : 'Regenerate Analysis'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
    </div>
  )
}
