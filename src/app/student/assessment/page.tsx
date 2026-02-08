"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { studentApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"

// Import your assessment questions
// Adjust this path to match your actual file location
import { QUESTIONS } from "@/lib/assessmentQuestions"

export default function AssessmentPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication and role - only students can access this page
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
        // Redirect non-students to their appropriate dashboard
        if (profile.role === 'teacher') {
          router.push('/teacher/')
        } else if (profile.role === 'admin') {
          router.push('/admin/')
        } else {
          router.push('/login')
        }
        return
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
      await studentApi.submitAssessment(answers)
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
