"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { studentApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import FollowUpQuestions, { type FollowUpQuestion, type FollowUpAnswer } from "@/components/FollowUpQuestions"

// Import your assessment questions
// Adjust this path to match your actual file location
import { QUESTIONS } from "@/lib/assessmentQuestions"

export default function AssessmentPage() {
  const router = useRouter()

  const [showConfirm, setShowConfirm] = useState(true)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)

  // Follow-up state
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[] | null>(null)

  // Check authentication, role, and retake eligibility
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile) {
        router.push('/login')
        return
      }

      // Only allow students to access this page
      if (profile.role !== 'student') {
        if (profile.role === 'teacher') {
          router.push('/teacher/')
        } else if (profile.role === 'admin') {
          router.push('/admin/')
        } else {
          router.push('/login')
        }
        return
      }

      // Check if student already has an assessment — if so, need approved retake
      const { data: existingAssessment } = await supabase
        .from('assessment_results')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (existingAssessment) {
        // Student already took assessment — check for approved retake
        try {
          const retakeStatus = await studentApi.getRetakeStatus()
          if (retakeStatus.status !== 'approved') {
            setBlockedMessage('You need an approved retake request to retake the assessment. Please request one from your dashboard.')
            setIsLoading(false)
            return
          }
        } catch {
          setBlockedMessage('Unable to verify retake status. Please go back to your dashboard.')
          setIsLoading(false)
          return
        }
      }

      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  // Organise questions by section
  const sections = [
    { title: "Aptitudes", questions: QUESTIONS.filter(q => q.id.startsWith('A')) },
    { title: "Interests", questions: QUESTIONS.filter(q => q.id.startsWith('I')) },
    { title: "Traits", questions: QUESTIONS.filter(q => q.id.startsWith('T')) },
    { title: "Values", questions: QUESTIONS.filter(q => q.id.startsWith('V')) },
    { title: "Work Styles", questions: QUESTIONS.filter(q => q.id.startsWith('W')) },
  ]

  const currentQuestions = sections[currentSection]?.questions || []
  const isLastSection = currentSection === sections.length - 1
  const canProceed = currentQuestions.every(q => answers[q.id] !== undefined)

  const allQuestionsAnswered = QUESTIONS.every(q => answers[q.id] !== undefined)

  async function handleSubmit() {
    if (!allQuestionsAnswered) {
      setError("Please answer all questions before submitting")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Submit the assessment
      await studentApi.submitAssessment(answers)

      // Check if follow-up questions are needed
      try {
        const followUp = await studentApi.checkFollowUp(answers)
        if (followUp.needs_follow_up && followUp.questions?.length > 0) {
          setFollowUpQuestions(followUp.questions)
          setIsSubmitting(false)
          return
        }
      } catch {
        // If follow-up check fails, proceed normally (graceful degradation)
        console.warn('Follow-up check failed, proceeding to dashboard')
      }

      router.push('/student')
    } catch (err: unknown) {
      console.error('Assessment submission error:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to submit assessment')
      } else {
        setError('Failed to submit assessment')
      }
      setIsSubmitting(false)
    }
  }

  async function handleFollowUpComplete(followUpAnswers: FollowUpAnswer[]) {
    setIsSubmitting(true)
    setError(null)

    try {
      await studentApi.submitFollowUp(followUpAnswers)
      router.push('/student')
    } catch (err: unknown) {
      console.error('Follow-up submission error:', err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to submit follow-up answers')
      } else {
        setError('Failed to submit follow-up answers')
      }
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (canProceed && !isLastSection) {
      setCurrentSection(currentSection + 1)
    } else if (isLastSection && allQuestionsAnswered) {
      handleSubmit()
    }
  }

  function handlePrevious() {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-violet-50 to-teal-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Blocked — no retake approval
  if (blockedMessage) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256" className="text-amber-600">
              <path fill="currentColor" d="M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72M120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12a12 12 0 0 1-12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Locked</h2>
          <p className="text-gray-600 text-sm mb-6">{blockedMessage}</p>
          <button
            onClick={() => router.push('/student')}
            className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors cursor-pointer text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Pre-assessment confirmation modal
  if (showConfirm) {
    return (
      <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-100 to-teal-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 256 256" className="text-violet-600">
              <path fill="currentColor" d="M208 32H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16m0 176H48V48h160zm-32-64a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8m0-32a8 8 0 0 1-8 8H88a8 8 0 0 1 0-16h80a8 8 0 0 1 8 8" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Ready to begin?</h2>
          <p className="text-gray-500 text-sm mb-6">Career Assessment</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 text-sm font-semibold">28</span>
              <span className="text-sm text-gray-700">Questions across 5 sections</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 text-sm font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor"><path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88m64-88a8 8 0 0 1-8 8h-56a8 8 0 0 1-8-8V72a8 8 0 0 1 16 0v48h48a8 8 0 0 1 8 8" /></svg>
              </span>
              <span className="text-sm text-gray-700">About 5–10 minutes to complete</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/student")}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              Go back
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors cursor-pointer text-sm"
            >
              Start assessment
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-400">Your progress is not saved until you submit.</p>
        </div>
      </div>
    )
  }

  // Show follow-up questions if needed
  if (followUpQuestions) {
    return (
      <>
        <FollowUpQuestions
          questions={followUpQuestions}
          onComplete={handleFollowUpComplete}
        />
        {error && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full px-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-teal-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Assessment
          </h1>
          <p className="text-gray-600">
            Section {currentSection + 1} of {sections.length}: {sections[currentSection]?.title}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={`text-xs ${
                  idx === currentSection
                    ? 'text-violet-600 font-semibold'
                    : idx < currentSection
                    ? 'text-teal-600'
                    : 'text-gray-400'
                }`}
              >
                {section.title}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-linear-to-r from-violet-500 to-teal-500 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-gray-100">
          <div className="space-y-8">
            {currentQuestions.map((question) => (
              <div key={question.id} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <label className="block mb-4">
                  <span className="text-gray-900 font-medium">{question.text}</span>
                </label>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-gray-400">Strongly Disagree</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setAnswers({ ...answers, [question.id]: value })
                        }
                        className={`
                          w-9 h-9 rounded-full border-2 transition-all cursor-pointer text-sm font-medium
                          ${
                            answers[question.id] === value
                              ? 'border-violet-600 bg-violet-600 text-white shadow-md'
                              : 'border-gray-300 text-gray-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50'
                          }
                        `}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Strongly Agree</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="px-6 py-3 text-gray-700 hover:text-violet-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
          >
            ← Previous
          </button>

          {!isLastSection ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-8 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="px-8 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
