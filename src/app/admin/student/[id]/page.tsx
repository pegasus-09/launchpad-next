"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { requireRole } from "@/lib/auth/roleCheck"
import { createClient } from "@/lib/supabase/client"
import { normaliseRankingScore } from "@/lib/normalise"
import { adminApi } from "@/lib/api"
import { Pencil, Trash2, ClipboardCheck, MessageSquare, BookOpen, FileText } from "lucide-react"

interface StudentProfile {
  id: string
  full_name: string
  email: string
  year_level: string
  class_name?: string
  class_id?: string
  class_names?: string[]
  class_ids?: string[]
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
  classes?: Array<{
    id: string
    class_name: string
    year_level?: string
    subject_name?: string
  }>
  subjects?: Array<{
    id: string
    name: string
    category?: string
  }>
  comments?: Array<{
    id: string
    comment_text: string
    created_at?: string
    teacher_name?: string
    class_name?: string
    performance_rating?: number | null
    engagement_rating?: number | null
  }>
  report?: {
    title?: string
    summary?: string
    updated_at?: string
  } | null
}

export default function StudentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>("overview")

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

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
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load student details')
        }

        const data = (await response.json()) as StudentData
        if (isActive) {
          setStudentData(data)
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return
        }
        console.error('Student details error:', err)
        if (isActive) {
          if (err instanceof Error) {
            setError(err.message || 'Failed to load student details')
          } else {
            setError('Failed to load student details')
          }
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [studentId])

  // Sidebar formatting
  const sidebarItemClass = "block bg-white/15 rounded-xl shadow-sm p-3.5 border border-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-950/30 hover:border-white/20"

  useEffect(() => {
    const sectionIds = [
      "overview",
      "career-matches",
      "assessment-status",
      "teacher-comments",
      "subjects-taken",
      "report",
      "career-aspiration",
    ]

    function updateActiveSection() {
      const offsets = sectionIds
        .map((id) => {
          const element = document.getElementById(id)
          if (!element) {
            return null
          }
          const rect = element.getBoundingClientRect()
          return { id, top: rect.top }
        })
        .filter((item): item is { id: string; top: number } => !!item)

      if (offsets.length === 0) {
        return
      }

      const threshold = 140
      const visible = offsets.find((item) => item.top >= threshold && item.top < window.innerHeight)
      if (visible) {
        setActiveSection(visible.id)
        return
      }

      const closest = offsets.reduce((best, item) =>
        Math.abs(item.top - threshold) < Math.abs(best.top - threshold) ? item : best
      )
      setActiveSection(closest.id)
    }

    updateActiveSection()
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection)

    return () => {
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
    }
  }, [])

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
          <div className="bg-rose-700/10 border border-rose-700/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-rose-700 mb-2">Error</h2>
            <p className="text-rose-700">{error}</p>
            <button
              onClick={() => router.push('/admin/')}
              className="cursor-pointer mt-4 px-4 py-2 bg-rose-700 text-white rounded-lg hover:bg-rose-800"
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

  async function handleDeleteStudent() {
    if (!confirm('Are you sure you want to delete this student?')) {
      return
    }

    try {
      await adminApi.deleteStudent(studentId)
      router.push('/admin/student')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert('Failed to delete student: ' + message)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <div>
          <button
            onClick={() => router.push('/admin/student')}
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="space-y-3.5 rounded-2xl border border-slate-700/40 bg-slate-900/90 p-3 shadow-lg ring-1 ring-slate-800/40">
              <div className="px-2 pt-1 text-[11px] tracking-[0.3em] text-slate-500 font-mono">
                ON THIS PAGE
              </div>
              {/* Career Matches */}
              <a
                href="#career-matches"
                aria-current={activeSection === "career-matches" ? "page" : undefined}
                className={`${sidebarItemClass} scroll-mt-24 ${
                  activeSection === "career-matches" ? "bg-white/20 ring-1 ring-white/25" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <ClipboardCheck className="w-4.5 h-4.5 text-teal-200" />
                  <h2 className="text-base font-semibold text-slate-50">Career Matches</h2>
                </div>
                <p className="text-sm text-slate-300">
                  {hasAssessment && ranking.length > 0 ? `View matches.` : "No matches yet."}
                </p>
              </a>

              {/* Teacher Comments */}
              <a
                href="#teacher-comments"
                aria-current={activeSection === "teacher-comments" ? "page" : undefined}
                className={`${sidebarItemClass} scroll-mt-24 ${
                  activeSection === "teacher-comments" ? "bg-white/20 ring-1 ring-white/25" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <MessageSquare className="w-4.5 h-4.5 text-violet-200" />
                  <h2 className="text-base font-semibold text-slate-50">Teacher Comments</h2>
                </div>
                <p className="text-sm text-slate-300">
                  {studentData.comments && studentData.comments.length > 0
                    ? `${studentData.comments.length} comment${studentData.comments.length > 1 ? "s" : ""}`
                    : "No comments yet."}
                </p>
              </a>

              {/* Subjects Taken */}
              <a
                href="#subjects-taken"
                aria-current={activeSection === "subjects-taken" ? "page" : undefined}
                className={`${sidebarItemClass} scroll-mt-24 ${
                  activeSection === "subjects-taken" ? "bg-white/20 ring-1 ring-white/25" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="w-4.5 h-4.5 text-teal-200" />
                  <h2 className="text-base font-semibold text-slate-50">Subjects Taken</h2>
                </div>
                <p className="text-sm text-slate-300">
                  {studentData.subjects && studentData.subjects.length > 0
                    ? `${studentData.subjects.length} subject${studentData.subjects.length > 1 ? "s" : ""}`
                    : "No subjects listed."}
                </p>
              </a>

              {/* Report */}
              <a
                href="#report"
                aria-current={activeSection === "report" ? "page" : undefined}
                className={`${sidebarItemClass} scroll-mt-24 ${
                  activeSection === "report" ? "bg-white/20 ring-1 ring-white/25" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <FileText className="w-4.5 h-4.5 text-teal-200" />
                  <h2 className="text-base font-semibold text-slate-50">Report</h2>
                </div>
                <p className="text-sm text-slate-300">
                  {studentData.report?.title || "No report available yet."}
                </p>
              </a>
              <a
                href="#career-aspiration"
                aria-current={activeSection === "career-aspiration" ? "page" : undefined}
                className={`${sidebarItemClass} scroll-mt-24 ${
                  activeSection === "career-aspiration" ? "bg-white/20 ring-1 ring-white/25" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <FileText className="w-4.5 h-4.5 text-violet-200" />
                  <h2 className="text-base font-semibold text-slate-50">Career Aspiration</h2>
                </div>
                <p className="text-sm text-slate-300">No career selected.</p>
              </a>
            </div>
          </aside>

          <div className="space-y-6">
            {/* Student Header */}
            <div id="overview" className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100 scroll-mt-24">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-emerald-800 mb-2">
                    {studentData.profile.full_name}
                  </h1>
                  <div className="space-y-1">
                    <p className="text-gray-600">{studentData.profile.email}</p>
                    <div className="flex flex-wrap gap-2 text-gray-600">
                      <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                        Year {studentData.profile.year_level || '—'}
                      </span>
                      {Array.isArray(studentData.profile.class_names) && studentData.profile.class_names.length > 0 ? (
                        studentData.profile.class_names.map((name, idx) => (
                          <span
                            key={`class-${idx}`}
                            className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/student/${studentId}/edit`)}
                    className="cursor-pointer p-2 border border-gray-200 text-black rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Edit student"
                    title="Edit student"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDeleteStudent}
                    className="cursor-pointer p-2 border border-rose-700 text-rose-700 rounded-lg hover:bg-rose-700/10 transition-colors"
                    aria-label="Delete student"
                    title="Delete student"
                  >
                    <Trash2 className="w-5 h-5" />
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
              <div id="career-matches" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Career Matches</h2>
                <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Why These Matches?</h3>
                  <p className="text-sm text-gray-600">
                    // TODO: Replace this explanation with real assessment-to-career reasoning data.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    These matches are based on the student's assessment responses and highlight roles aligned with
                    their interests, strengths, and work preferences.
                  </p>
                </div>
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

            <div id="teacher-comments" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-violet-600" />
                <h2 className="text-xl font-semibold text-gray-900">Teacher Comments</h2>
              </div>
              {studentData.comments && studentData.comments.length > 0 ? (
                <div className="space-y-3">
                  {studentData.comments.slice(0, 6).map((comment) => (
                    <div key={comment.id} className="border border-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{comment.comment_text}</p>
                      <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                        {comment.teacher_name && <span>{comment.teacher_name}</span>}
                        {comment.class_name && <span>• {comment.class_name}</span>}
                        {comment.created_at && (
                          <span>• {new Date(comment.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No comments yet.</p>
              )}
            </div>

            <div id="subjects-taken" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-900">Subjects Taken</h2>
              </div>
              {studentData.subjects && studentData.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentData.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No subjects listed.</p>
              )}
            </div>

            <div id="report" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-teal-600" />
                <h2 className="text-xl font-semibold text-gray-900">Report</h2>
              </div>
              {studentData.report ? (
                <div className="space-y-2">
                  {studentData.report.title && (
                    <p className="text-sm font-medium text-gray-900">{studentData.report.title}</p>
                  )}
                  {studentData.report.summary && (
                    <p className="text-sm text-gray-600">{studentData.report.summary}</p>
                  )}
                  {studentData.report.updated_at && (
                    <p className="text-xs text-gray-500">
                      Updated {new Date(studentData.report.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No report available yet.</p>
              )}
            </div>

            <div id="career-aspiration" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Career Aspiration</h2>
              <p className="text-sm text-gray-600">No career selected.</p>
              <p className="text-xs text-gray-500 mt-2">// TODO: Update with student-selected career aspiration data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
