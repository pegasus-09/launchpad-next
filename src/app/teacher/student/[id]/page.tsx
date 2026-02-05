"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { teacherApi } from "@/lib/api"
import { requireRole, UserProfile } from "@/lib/auth/roleCheck"
import LogoutButton from "@/components/auth/LogoutButton"

// Interfaces from both files
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


export default function TeacherStudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  // Combined state from both files
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null)
  
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [commentText, setCommentText] = useState<string>("")
  const [performanceRating, setPerformanceRating] = useState<number | undefined>(undefined)
  const [engagementRating, setEngagementRating] = useState<number | undefined>(undefined)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)


  // Merged useEffect for loading student data
  useEffect(() => {
    async function loadStudentData() {
      if (!studentId) return;
      try {
        const userProfile = await requireRole('teacher')
        setTeacherProfile(userProfile)
        const data = await teacherApi.getStudent(studentId)
        setStudent(data)
        // Initialize selectedClassId once student data is loaded
        if (data.classes && data.classes.length > 0) {
          setSelectedClassId(data.classes[0].id)
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

  // useEffect from comment page to load comment data
  useEffect(() => {
    async function loadCommentData() {
      if (!studentId || !selectedClassId) return;

      // Reset form and messages when switching classes
      setCommentText("")
      setPerformanceRating(undefined)
      setEngagementRating(undefined)
      setError(null)
      setSuccess(null)

      try {
        const comment: Comment | null = await teacherApi.getComment(studentId, selectedClassId)
        if (comment) {
          setCommentText(comment.comment_text)
          setPerformanceRating(comment.performance_rating)
          setEngagementRating(comment.engagement_rating)
        }
      } catch (err) {
        console.error("Failed to fetch comment:", err)
        setError("Could not load existing comment for this class.")
      }
    }
    loadCommentData()
  }, [studentId, selectedClassId])

  // Handler functions from comment page
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !selectedClassId || !commentText) {
      setError("Please select a class and enter a comment.")
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await teacherApi.upsertComment({
        student_id: studentId,
        class_id: selectedClassId,
        comment_text: commentText,
        performance_rating: performanceRating,
        engagement_rating: engagementRating,
      })
      setSuccess(result.message)
    } catch (err: unknown) {
      console.error('Failed to save comment:', err)
      setError(err instanceof Error ? err.message : 'Failed to save comment.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!studentId || !selectedClassId) return

    if (window.confirm("Are you sure you want to delete this comment? This cannot be undone.")) {
      setSubmitting(true)
      setError(null)
      setSuccess(null)
      try {
        await teacherApi.deleteComment(studentId, selectedClassId)
        setSuccess("Comment deleted successfully!")
        setCommentText("")
        setPerformanceRating(undefined)
        setEngagementRating(undefined)
      } catch (err: unknown) {
        console.error('Failed to delete comment:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete comment.')
      } finally {
        setSubmitting(false)
      }
    }
  }


  // Loading and error states from page.tsx
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

  if (error && !student) { // Modified to show error only if student fails to load
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-rose-700 mb-2">Error</h2>
          <p className="text-rose-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-amber-700 mb-2">Student Not Found</h2>
          <p className="text-amber-700">The student you are looking for does not exist or is not assigned to you.</p>
          <button onClick={() => router.push('/teacher')} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  // Combined JSX
  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Details
              </h1>
              <p className="text-gray-600">{student.full_name}</p>
              <p className="text-sm text-gray-500 mt-2">Year {student.year_level} • {student.email}</p>
            </div>
            <LogoutButton />
          </div>
          <div className="mt-6 flex gap-4">
            <button onClick={() => router.push('/teacher')} className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors">
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Student Classes */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Assigned Classes
          </h2>
          {student.classes && student.classes.length > 0 ? (
            <div className="space-y-3">
              {student.classes.map((cls) => (
                <div key={cls.id} className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-semibold text-violet-800">{cls.class_name}</h3>
                  <p className="text-sm text-gray-600">Subject: {cls.subject_name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">This student is not assigned to any of your classes.</p>
          )}
        </div>

        {/* New Comment Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-violet-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Add/Edit Comment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Class to Comment On
              </label>
              <select
                id="class-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm rounded-md shadow-sm"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
                disabled={!student.classes || student.classes.length === 0}
              >
                {student.classes && student.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} ({cls.subject_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Rating (1-5)
              </label>
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={`performance-${rating}`} className="flex items-center">
                    <input id={`performance-rating-${rating}`} name="performance-rating" type="radio" value={rating} checked={performanceRating === rating} onChange={() => setPerformanceRating(rating)} className="focus:ring-violet-500 h-4 w-4 text-violet-600 border-gray-300" />
                    <label htmlFor={`performance-rating-${rating}`} className="ml-2 block text-sm text-gray-900">{rating}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engagement Rating (1-5)
              </label>
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={`engagement-${rating}`} className="flex items-center">
                    <input id={`engagement-rating-${rating}`} name="engagement-rating" type="radio" value={rating} checked={engagementRating === rating} onChange={() => setEngagementRating(rating)} className="focus:ring-violet-500 h-4 w-4 text-violet-600 border-gray-300" />
                    <label htmlFor={`engagement-rating-${rating}`} className="ml-2 block text-sm text-gray-900">{rating}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-2">
                Comment Text
              </label>
              <textarea id="comment-text" rows={5} className="shadow-sm focus:ring-violet-500 focus:border-violet-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Enter your comment here..." value={commentText} onChange={(e) => setCommentText(e.target.value)} required></textarea>
            </div>

            {error && <div className="bg-red-50 p-4 rounded-lg text-rose-700">{error}</div>}
            {success && <div className="bg-green-50 p-4 rounded-lg text-emerald-700">{success}</div>}

            <div className="flex justify-between items-center pt-4">
               <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  disabled={submitting}
                >
                  Delete
                </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400"
                  disabled={submitting || !selectedClassId || !commentText}
                >
                  {submitting ? 'Saving...' : 'Save Comment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}