"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { teacherApi } from "@/lib/api"
import { requireRole, UserProfile } from "@/lib/auth/roleCheck"
import { ArrowLeft, Trash2, X, Check, Loader2 } from "lucide-react"

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

interface Comment {
  id: string
  comment_text: string
  performance_rating?: number
  engagement_rating?: number
}

export default function TeacherCommentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const classId = params.classId as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null)
  const [currentClass, setCurrentClass] = useState<{ id: string; class_name: string; subject_name: string } | null>(null)

  const [commentText, setCommentText] = useState<string>("")
  const [performanceRating, setPerformanceRating] = useState<number | undefined>(undefined)
  const [engagementRating, setEngagementRating] = useState<number | undefined>(undefined)
  const [hasExistingComment, setHasExistingComment] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!studentId || !classId) return
      try {
        const userProfile = await requireRole('teacher')
        setTeacherProfile(userProfile)

        const data = await teacherApi.getStudent(studentId)
        setStudent(data)

        // Find the current class
        const cls = data.classes?.find((c: { id: string }) => c.id === classId)
        setCurrentClass(cls || null)

        // Load existing comment
        const comment: Comment | null = await teacherApi.getComment(studentId, classId)
        if (comment) {
          setCommentText(comment.comment_text)
          setPerformanceRating(comment.performance_rating)
          setEngagementRating(comment.engagement_rating)
          setHasExistingComment(true)
        } else {
          setHasExistingComment(false)
        }
      } catch (err: unknown) {
        console.error('Teacher comment page error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [studentId, classId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !classId || !commentText) {
      setError("Please enter a comment.")
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await teacherApi.upsertComment({
        student_id: studentId,
        class_id: classId,
        comment_text: commentText,
        performance_rating: performanceRating,
        engagement_rating: engagementRating,
      })
      setSuccess(result.message)
      setHasExistingComment(true)
    } catch (err: unknown) {
      console.error('Failed to save comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to save comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!studentId || !classId) return

    if (window.confirm("Are you sure you want to delete this comment? This cannot be undone.")) {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      try {
        await teacherApi.deleteComment(studentId, classId)
        setSuccess("Comment deleted successfully!")
        setCommentText("")
        setPerformanceRating(undefined)
        setEngagementRating(undefined)
        setHasExistingComment(false)
      } catch (err: unknown) {
        console.error('Failed to delete comment:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete comment.')
      } finally {
        setSubmitting(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!student || !currentClass) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Not Found</h2>
          <p className="text-amber-700">The student or class you are looking for does not exist or is not assigned to you.</p>
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
        <button
          onClick={() => router.push(`/teacher/student/${studentId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-800 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <h1 className="text-2xl font-bold text-emerald-800 mb-1">
            {student.full_name}
          </h1>
          <p className="text-gray-600 mb-4">Year {student.year_level} • {student.email}</p>
          <div className="mt-4 p-4 bg-violet-50 rounded-xl">
            <p className="text-sm text-gray-600">Commenting on</p>
            <h2 className="text-lg font-semibold text-violet-800">{currentClass.class_name}</h2>
            <p className="text-sm text-gray-600">{currentClass.subject_name}</p>
          </div>
        </div>

        {/* Comment Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {hasExistingComment ? "Edit Comment" : "Add Comment"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Performance Rating */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Performance Rating
              </label>
              <div className="flex items-center justify-center gap-10">
                <span className="text-sm text-gray-500 w-32 text-right">Needs Improvement</span>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={`performance-${value}`}
                      type="button"
                      onClick={() => setPerformanceRating(value)}
                      className={`
                        w-12 h-12 rounded-full border-2 transition-all cursor-pointer font-medium
                        inline-flex items-center justify-center
                        ${
                          performanceRating === value
                            ? 'border-violet-600 bg-violet-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500 w-32 text-left">Excellent</span>
              </div>
            </div>

            {/* Engagement Rating */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Engagement Rating
              </label>
              <div className="flex items-center justify-center gap-10">
                <span className="text-sm text-gray-500 w-32 text-right">Disengaged</span>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={`engagement-${value}`}
                      type="button"
                      onClick={() => setEngagementRating(value)}
                      className={`
                        w-12 h-12 rounded-full border-2 transition-all cursor-pointer font-medium
                        inline-flex items-center justify-center
                        ${
                          engagementRating === value
                            ? 'border-violet-600 bg-violet-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500 w-32 text-left">Highly Engaged</span>
              </div>
            </div>

            {/* Comment Text */}
            <div>
              <label htmlFor="comment-text" className="block text-base font-semibold text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                id="comment-text"
                rows={5}
                className="shadow-sm focus:ring-violet-500 focus:border-violet-500 mt-1 block w-full text-base text-emerald-800 border-2 border-gray-300 rounded-md p-3"
                placeholder="Enter your comment here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              ></textarea>
            </div>

            {error && <div className="bg-red-50 p-4 rounded-lg text-rose-700">{error}</div>}
            {success && <div className="bg-green-50 p-4 rounded-lg text-emerald-700">{success}</div>}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleDelete}
                className="p-2.5 rounded-lg text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:hover:bg-transparent transition-colors"
                disabled={submitting || !hasExistingComment}
                title="Delete comment"
              >
                <Trash2 className="w-6 h-6" />
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/teacher/student/${studentId}`)}
                  className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Cancel"
                >
                  <X className="w-6 h-6" />
                </button>
                <button
                  type="submit"
                  className="p-2.5 rounded-lg text-violet-600 hover:bg-violet-50 disabled:text-violet-300 disabled:hover:bg-transparent transition-colors"
                  disabled={submitting || !commentText}
                  title={hasExistingComment ? 'Update comment' : 'Add comment'}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
