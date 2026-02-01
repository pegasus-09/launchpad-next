"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QUESTIONS } from "@/lib/assessmentQuestions"
import { supabase } from "@/lib/supabase/client"


export default function AssessmentPage() {
    const router = useRouter()

    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [topCareer, setTopCareer] = useState<[string, string, number] | null>(null)
    const [showGuestResult, setShowGuestResult] = useState(false)

    useEffect(() => {
        // Check auth state
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session?.user)
        })
    }, [])

    function setAnswer(questionId: string, value: number) {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }))
    }

    const allAnswered = QUESTIONS.every(
        q => typeof answers[q.id] === "number"
    )

    async function submitAssessment() {
        if (!allAnswered) return

        setSubmitting(true)

        try {
            // Send to Python backend
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/assessment`,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(answers),
                }
            );

            const data = await res.json()
            console.log("Assessment response data:", answers)
            const ranking = data.ranking

            // Check if user is logged in
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                // Guest user - show only top result and store data
                setTopCareer(ranking[0])
                setShowGuestResult(true)
                
                // Store in localStorage for persistence
                localStorage.setItem('guestAssessmentAnswers', JSON.stringify(answers))
                localStorage.setItem('guestAssessmentRanking', JSON.stringify(ranking))
                localStorage.setItem('guestAssessmentDate', new Date().toISOString())
                
                setSubmitting(false)
                return
            }

            // Authenticated user - save to database
            const { error } = await supabase
                .from("assessment_results")
                .upsert({
                    user_id: session.user.id,
                    raw_answers: answers,
                    ranking,
                    updated_at: new Date().toISOString(),
                })

            if (error) {
                throw error
            }

            console.log("Ranking:", ranking)
            router.push("/dashboard")
        } catch (error) {
            console.error("Assessment submission error:", error)
            alert("Failed to submit assessment. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    function handleLogin() {
        // Store answers before redirecting
        localStorage.setItem('guestAssessmentAnswers', JSON.stringify(answers))
        if (topCareer) {
            const ranking = JSON.parse(localStorage.getItem('guestAssessmentRanking') || '[]')
            localStorage.setItem('guestAssessmentRanking', JSON.stringify(ranking))
        }
        router.push('/login?returnUrl=/assessment&message=Log in to see all your career matches')
    }

    // Guest result view
    if (showGuestResult && topCareer) {
        return (
            <div className="mx-auto max-w-3xl px-6 py-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4">
                        Your Top Career Match!
                    </h1>
                    <p className="text-gray-600">
                        Based on your assessment, here's your #1 career recommendation
                    </p>
                </div>

                <div className="rounded-2xl border-2 border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 p-8 mb-8">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-500 text-2xl font-bold text-white">
                            1
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {topCareer[1]}
                            </h2>
                            <p className="text-sm text-gray-500 font-mono mb-3">
                                {topCareer[0]}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="text-3xl font-bold text-violet-600">
                                    {(topCareer[2] * 100).toFixed(0)}%
                                </div>
                                <div className="text-sm text-gray-600">
                                    match
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-700 mt-4 p-4 bg-white/50 rounded-lg">
                        {topCareer[2] >= 0.85 
                            ? "Exceptional match - Your strengths, interests, and values align exceptionally well with this career."
                            : topCareer[2] >= 0.75
                            ? "Strong match - This career aligns well with your profile and natural inclinations."
                            : topCareer[2] >= 0.65
                            ? "Good match - Many aspects of this career suit your abilities and preferences."
                            : "Moderate match - Some elements of this career align with your profile."
                        }
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">
                        Want to see all your career matches?
                    </h3>
                    <p className="text-sm text-blue-800 mb-4">
                        Log in to unlock:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside mb-4">
                        <li>Top 10 career recommendations with detailed reasoning</li>
                        <li>Personalised strengths and development areas</li>
                        <li>University recommendations and roadmaps</li>
                        <li>Portfolio builder with PDF export</li>
                    </ul>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleLogin}
                        className="rounded-lg bg-violet-500 px-8 py-3 font-medium text-white hover:bg-violet-600"
                    >
                        Log in to see all results
                    </button>
                    <button
                        onClick={() => {
                            setShowGuestResult(false)
                            setAnswers({})
                            setTopCareer(null)
                            localStorage.removeItem('guestAssessmentAnswers')
                            localStorage.removeItem('guestAssessmentRanking')
                            localStorage.removeItem('guestAssessmentDate')
                        }}
                        className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Retake assessment
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <h1 className="mb-8 text-3xl font-bold">
                Career Assessment
            </h1>

            <p className="mb-6 text-gray-600">
                Answer all questions honestly to get personalised career recommendations.
                {!isAuthenticated && " You can see your top result immediately, or log in to unlock all features."}
            </p>

            <div className="space-y-6">
                {QUESTIONS.map(q => (
                    <div
                        key={q.id}
                        className="rounded-lg border p-4"
                    >
                        <p className="mb-3 font-medium">
                            {q.text}
                        </p>

                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map(v => (
                                <button
                                    key={v}
                                    onMouseOver={process.env.DEV_MODE === "true" ? () => setAnswer(q.id, v) : undefined}
                                    onClick={() => setAnswer(q.id, v)}
                                    onMouseEnter={() => setAnswer(q.id, v)}
                                    className={`h-10 w-10 rounded-full border text-sm ${
                                        answers[q.id] === v
                                            ? "bg-violet-600 text-white"
                                            : "hover:bg-gray-100"
                                    }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={submitAssessment}
                disabled={!allAnswered || submitting}
                className="mt-10 rounded-lg bg-violet-600 px-6 py-3 text-white hover:bg-violet-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting 
                    ? "Analyzing..." 
                    : isAuthenticated 
                    ? "Submit assessment" 
                    : "See my top career match"
                }
            </button>
        </div>
    )
}


