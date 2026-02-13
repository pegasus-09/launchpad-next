"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { requireRole } from "@/lib/auth/roleCheck"
import { createClient } from "@/lib/supabase/client"
import { normaliseRankingScore } from "@/lib/normalise"
import { adminApi } from "@/lib/api"
import { Pencil, Trash2, ClipboardCheck, MessageSquare, BookOpen, FileText, Download, StickyNote, X, Eye, Briefcase, ArrowLeft, RotateCcw } from "lucide-react"
import LogoutButton from '@/components/auth/LogoutButton'

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
  retake_request?: {
    id: string
    status: 'pending' | 'approved' | 'denied' | 'used'
    requested_at: string
    responded_at?: string
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
  const [hasPortfolio, setHasPortfolio] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false)
  const [portfolioHtml, setPortfolioHtml] = useState("")
  const [adminNotes, setAdminNotes] = useState<Array<{ id: string; note_text: string; created_at?: string }>>([])
  const [newNote, setNewNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [careerAspirations, setCareerAspirations] = useState<Array<{ id: string; soc_code: string; title: string }>>([])
  const [strengthNarrative, setStrengthNarrative] = useState<string | null>(null)
  const [retakeActionLoading, setRetakeActionLoading] = useState(false)

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

        // Check if student has a portfolio
        try {
          const portfolioData = await adminApi.getStudentPortfolio(studentId)
          if (isActive && portfolioData.portfolio) {
            setHasPortfolio(true)
          }
        } catch { /* no portfolio */ }

        // Load admin notes
        try {
          const notesData = await adminApi.getStudentNotes(studentId)
          if (isActive) {
            setAdminNotes(notesData.notes || [])
          }
        } catch { /* no notes */ }

        // Load career aspirations
        try {
          const aspirationsData = await adminApi.getStudentCareerAspirations(studentId)
          if (isActive) {
            setCareerAspirations(aspirationsData.aspirations || [])
          }
        } catch { /* no aspirations */ }

        // Load AI analysis (for profile summary narrative)
        try {
          const analysisRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/student/${studentId}/analysis`,
            { headers: { 'Authorization': `Bearer ${session.access_token}` } }
          )
          if (analysisRes.ok) {
            const analysisData = await analysisRes.json()
            if (isActive && analysisData.analysis?.strength_narrative) {
              setStrengthNarrative(analysisData.analysis.strength_narrative)
            }
          }
        } catch { /* no analysis yet */ }
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
  const sidebarItemClass = "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 hover:bg-white/15"

  useEffect(() => {
    const sectionIds = [
      "overview",
      "career-matches",
      "retake-request",
      "assessment-status",
      "teacher-comments",
      "subjects-taken",
      "admin-notes",
      "portfolio",
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

  function getPortfolioFilename() {
    const name = studentData?.profile.full_name || "Student"
    return `${name.replace(/\s+/g, "_")}_Resume.pdf`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function buildPortfolioHtml(p: any, name: string) {
    return `<div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 700px; margin: 0 auto; padding: 32px 36px; color: #1a1a1a; line-height: 1.55;">
  <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid #064e3b;">
    <div style="font-size: 28px; font-weight: 700; color: #111;">${name}</div>
    <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${p.year_level ? "Year " + p.year_level + " Student" : ""}</div>
  </div>
  ${p.summary ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Profile</div><p style="font-size: 13px; color: #374151; line-height: 1.7;">${p.summary}</p></div>` : ""}
  ${(p.skills || []).length ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Skills</div>${(p.skills as string[]).map((s: string) => `<div style="font-size: 13px; color: #374151; padding: 4px 0;"><span style="color: #064e3b; margin-right: 8px; font-weight: 700;">&#8226;</span>${s}</div>`).join("")}</div>` : ""}
  ${(p.work_experience || []).length ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Work Experience</div>${(p.work_experience as Array<{title: string; organisation: string; description?: string; start_date?: string; end_date?: string}>).map((e) => `<div style="margin-bottom: 14px; padding-left: 12px; border-left: 2px solid #e5e7eb;"><div style="font-size: 14px; font-weight: 600; color: #111;">${e.title}</div><div style="font-size: 13px; color: #6b7280;">${e.organisation}</div>${e.description ? `<div style="font-size: 12px; color: #4b5563; margin-top: 3px;">${e.description}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${(p.certifications || []).length ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Certifications</div>${(p.certifications as Array<{name: string; issuer?: string; date?: string}>).map((c) => `<div style="padding: 5px 0;"><span style="font-size: 13px; font-weight: 600; color: #111;">${c.name}</span>${c.issuer ? ` <span style="font-size: 12px; color: #6b7280;">- ${c.issuer}</span>` : ""}${c.date ? ` <span style="font-size: 12px; color: #9ca3af;">${c.date}</span>` : ""}</div>`).join("")}</div>` : ""}
  ${(p.volunteering || []).length ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Volunteering</div>${(p.volunteering as Array<{title: string; organisation: string; description?: string}>).map((v) => `<div style="margin-bottom: 14px; padding-left: 12px; border-left: 2px solid #e5e7eb;"><div style="font-size: 14px; font-weight: 600; color: #111;">${v.title}</div><div style="font-size: 13px; color: #6b7280;">${v.organisation}</div>${v.description ? `<div style="font-size: 12px; color: #4b5563; margin-top: 3px;">${v.description}</div>` : ""}</div>`).join("")}</div>` : ""}
  ${(p.extracurriculars || []).length ? `<div style="margin-bottom: 32px;"><div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #064e3b; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #e5e7eb;">Extracurricular Activities</div>${(p.extracurriculars as Array<{name: string; role?: string; description?: string}>).map((e) => `<div style="margin-bottom: 8px;"><span style="font-size: 13px; font-weight: 600; color: #111;">${e.name}</span>${e.role ? ` <span style="font-size: 12px; color: #6b7280;">- ${e.role}</span>` : ""}${e.description ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">${e.description}</div>` : ""}</div>`).join("")}</div>` : ""}
</div>`
  }

  async function handleExportPortfolio() {
    setExportingPdf(true)
    try {
      const portfolioData = await adminApi.getStudentPortfolio(studentId)
      const p = portfolioData.portfolio
      if (!p) return

      const html2pdf = (await import("html2pdf.js")).default
      const name = portfolioData.student_name || studentData?.profile.full_name || "Student"
      const wrapper = document.createElement("div")
      wrapper.innerHTML = buildPortfolioHtml(p, name)
      wrapper.style.position = "absolute"
      wrapper.style.left = "-9999px"
      document.body.appendChild(wrapper)
      await html2pdf().set({
        margin: [8, 4],
        filename: getPortfolioFilename(),
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(wrapper.firstElementChild as HTMLElement).save()
      document.body.removeChild(wrapper)
    } catch (err) {
      console.error("PDF export error:", err)
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleViewPortfolio() {
    try {
      const portfolioData = await adminApi.getStudentPortfolio(studentId)
      const p = portfolioData.portfolio
      if (!p) return
      const name = portfolioData.student_name || studentData?.profile.full_name || "Student"
      setPortfolioHtml(buildPortfolioHtml(p, name))
      setShowPortfolioPreview(true)
    } catch (err) {
      console.error("Portfolio preview error:", err)
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    setSavingNote(true)
    try {
      const result = await adminApi.addStudentNote(studentId, newNote.trim())
      if (result.note) {
        setAdminNotes(prev => [result.note, ...prev])
      }
      setNewNote("")
    } catch (err) {
      console.error("Failed to add note:", err)
    } finally {
      setSavingNote(false)
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      await adminApi.deleteStudentNote(studentId, noteId)
      setAdminNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error("Failed to delete note:", err)
    }
  }

  async function handleRetakeAction(action: 'approve' | 'deny') {
    if (!studentData?.retake_request) return
    setRetakeActionLoading(true)
    try {
      const requestId = studentData.retake_request.id
      if (action === 'approve') {
        await adminApi.approveRetake(requestId)
      } else {
        await adminApi.denyRetake(requestId)
      }
      setStudentData(prev => prev ? {
        ...prev,
        retake_request: { ...prev.retake_request!, status: action === 'approve' ? 'approved' : 'denied', responded_at: new Date().toISOString() },
      } : prev)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(`Failed to ${action} retake: ${message}`)
    } finally {
      setRetakeActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Back Button + Logout */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/student')}
            className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <nav className="space-y-1 rounded-2xl border border-slate-700/40 bg-slate-900/90 px-2 py-3 shadow-lg ring-1 ring-slate-800/40">
              <div className="px-3 pb-2 text-[11px] tracking-[0.3em] text-slate-500 font-mono">
                ON THIS PAGE
              </div>
              <a href="#retake-request" className={`${sidebarItemClass} ${activeSection === "retake-request" ? "bg-white/20" : ""}`}>
                <RotateCcw className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Retake Request</span>
              </a>
              <a href="#career-matches" className={`${sidebarItemClass} ${activeSection === "career-matches" ? "bg-white/20" : ""}`}>
                <ClipboardCheck className="w-4 h-4 text-teal-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Career Matches</span>
              </a>
              <a href="#teacher-comments" className={`${sidebarItemClass} ${activeSection === "teacher-comments" ? "bg-white/20" : ""}`}>
                <MessageSquare className="w-4 h-4 text-violet-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Teacher Comments</span>
              </a>
              <a href="#subjects-taken" className={`${sidebarItemClass} ${activeSection === "subjects-taken" ? "bg-white/20" : ""}`}>
                <BookOpen className="w-4 h-4 text-teal-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Subjects</span>
              </a>
              <a href="#admin-notes" className={`${sidebarItemClass} ${activeSection === "admin-notes" ? "bg-white/20" : ""}`}>
                <StickyNote className="w-4 h-4 text-violet-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Admin Notes</span>
              </a>
              <a href="#portfolio" className={`${sidebarItemClass} ${activeSection === "portfolio" ? "bg-white/20" : ""}`}>
                <FileText className="w-4 h-4 text-teal-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Portfolio</span>
              </a>
              <a href="#career-aspiration" className={`${sidebarItemClass} ${activeSection === "career-aspiration" ? "bg-white/20" : ""}`}>
                <Briefcase className="w-4 h-4 text-violet-300 shrink-0" />
                <span className="text-sm font-medium text-slate-200">Career Aspirations</span>
              </a>
            </nav>
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
                    <span className="inline-block px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                      Year {studentData.profile.year_level || '—'}
                    </span>
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

            {/* Retake Request */}
            <div id="retake-request" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Retake Request</h2>
              </div>

              {!studentData.retake_request ? (
                <p className="text-sm text-gray-500">No retake request from this student.</p>
              ) : studentData.retake_request.status === 'pending' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-medium text-amber-800 text-sm">Pending Approval</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested on {new Date(studentData.retake_request.requested_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      This student has requested to retake their career assessment. Approving will allow them to complete a new assessment.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={retakeActionLoading}
                      onClick={() => handleRetakeAction('deny')}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer text-sm disabled:opacity-50"
                    >
                      Deny
                    </button>
                    <button
                      type="button"
                      disabled={retakeActionLoading}
                      onClick={() => handleRetakeAction('approve')}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors cursor-pointer text-sm disabled:opacity-50"
                    >
                      {retakeActionLoading ? 'Processing...' : 'Approve Retake'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`p-4 rounded-xl border ${
                  studentData.retake_request.status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
                  studentData.retake_request.status === 'denied' ? 'bg-gray-50 border-gray-200' :
                  'bg-violet-50 border-violet-200'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      studentData.retake_request.status === 'approved' ? 'bg-emerald-500' :
                      studentData.retake_request.status === 'denied' ? 'bg-gray-400' :
                      'bg-violet-500'
                    }`} />
                    <span className={`font-medium text-sm ${
                      studentData.retake_request.status === 'approved' ? 'text-emerald-800' :
                      studentData.retake_request.status === 'denied' ? 'text-gray-600' :
                      'text-violet-800'
                    }`}>
                      Retake {studentData.retake_request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested on {new Date(studentData.retake_request.requested_at).toLocaleString()}
                    {studentData.retake_request.responded_at && (
                      <> &middot; Responded on {new Date(studentData.retake_request.responded_at).toLocaleString()}</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Career Matches */}
            {hasAssessment && ranking.length > 0 && (
              <div id="career-matches" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Career Matches</h2>
                {strengthNarrative ? (
                  <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Profile Summary</h3>
                    <p className="text-xs text-gray-400 mb-2">This is the narrative shown to the student on their dashboard.</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{strengthNarrative}</p>
                  </div>
                ) : (
                  <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">Why These Matches?</h3>
                    <p className="text-sm text-gray-500">
                      These are preliminary matches based on the student&apos;s assessment scores.
                      A personalised profile summary will appear here once the AI analysis has been run.
                    </p>
                  </div>
                )}
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
                      <p className="text-base text-emerald-800">{comment.comment_text}</p>
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

            {/* Admin Notes */}
            <div id="admin-notes" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <StickyNote className="w-5 h-5 text-violet-600" />
                <h2 className="text-xl font-semibold text-gray-900">Admin Notes</h2>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="Add a note about this student..."
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={savingNote || !newNote.trim()}
                    className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {savingNote ? "Saving..." : "Add"}
                  </button>
                </div>
                {adminNotes.length > 0 ? (
                  adminNotes.map((note) => (
                    <div key={note.id} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-800">{note.note_text}</p>
                        {note.created_at && (
                          <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No notes yet.</p>
                )}
              </div>
            </div>

            <div id="portfolio" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-teal-600 shrink-0" />
                <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
              </div>
              {hasPortfolio ? (
                <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm font-medium text-teal-900">{getPortfolioFilename()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleViewPortfolio}
                      className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors"
                      title="View portfolio"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={handleExportPortfolio}
                      disabled={exportingPdf}
                      className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-lg text-teal-700 hover:bg-teal-100 transition-colors disabled:opacity-50"
                      title="Download portfolio"
                    >
                      <Download className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl border border-violet-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-violet-800">Student has not created a portfolio yet</p>
                </div>
              )}
            </div>

            <div id="career-aspiration" className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 scroll-mt-24">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-violet-600" />
                <h2 className="text-xl font-semibold text-gray-900">Career Aspirations</h2>
              </div>
              {careerAspirations.length > 0 ? (
                <div className="space-y-2">
                  {careerAspirations.map((aspiration) => (
                    <div
                      key={aspiration.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{aspiration.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No careers selected.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Preview Modal */}
      {showPortfolioPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowPortfolioPreview(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-medium text-gray-900">{getPortfolioFilename()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPortfolio}
                  disabled={exportingPdf}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors font-medium disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exportingPdf ? "Downloading..." : "Download"}
                </button>
                <button
                  onClick={() => setShowPortfolioPreview(false)}
                  className="cursor-pointer inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6">
              <div dangerouslySetInnerHTML={{ __html: portfolioHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
