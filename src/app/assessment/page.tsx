"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { studentApi, guestApi } from "@/lib/api"
import { getCurrentUserProfile } from "@/lib/auth/roleCheck"

// Import your assessment questions
// Adjust this path to match your actual file location
import { QUESTIONS } from "@/lib/assessmentQuestions"

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const profile = await getCurrentUserProfile()
      setIsAuthenticated(!!profile)
      setUserRole(profile?.role || null)
    }
    checkAuth()
  }, [])

  // Organize questions by section
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
      if (isAuthenticated) {
        // Authenticated student - save to database
        await studentApi.submitAssessment(answers)
        router.push('/dashboard')
      } else {
        // Guest - show preview only
        const result = await guestApi.submitAssessment(answers)
        
        // Store result in session storage for preview page
        sessionStorage.setItem('guestAssessmentResult', JSON.stringify(result))
        router.push('/assessment/preview')
      }
    } catch (err: any) {
      console.error('Assessment submission error:', err)
      setError(err.message || 'Failed to submit assessment')
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
                    ? 'text-blue-600 font-semibold'
                    : idx < currentSection
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                {section.title}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-6">
            {currentQuestions.map((question) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                <label className="block mb-4">
                  <span className="text-gray-900 font-medium">{question.text}</span>
                </label>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-500">Strongly Disagree</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setAnswers({ ...answers, [question.id]: value })
                        }
                        className={`
                          w-12 h-12 rounded-full border-2 transition-all cursor-pointer
                          ${
                            answers[question.id] === value
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-300 hover:border-blue-400'
                          }
                        `}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Strongly Agree</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Guest notice */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              📌 You're taking the assessment as a guest. You'll see a preview of your top career matches.
              <a href="/login" className="underline ml-1 font-medium">
                Log in
              </a>
              {" "}to save your full results.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0}
            className="px-6 py-2 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            ← Previous
          </button>

          {!isLastSection ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
