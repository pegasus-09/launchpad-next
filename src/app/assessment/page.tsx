"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { QUESTIONS } from "@/lib/assessmentQuestions"
import { supabase } from "@/lib/supabase/client"


export default function AssessmentPage() {
    const router = useRouter()

    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [submitting, setSubmitting] = useState(false)

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
            const ranking = data.ranking

            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session?.user) {
                throw new Error("User not authenticated")
            }

            const { error } = await supabase
                .from("assessment_results")
                .upsert({
                    user_id: session.user.id,
                    ranking,
                    updated_at: new Date().toISOString(),
                })

            if (error) {
                throw error
            }

            console.log("Ranking:", ranking)
            router.push("/dashboard")
        } finally {
            setSubmitting(false)
        }
    }


    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="mb-8 text-3xl font-bold">
                Career Assessment
            </h1>

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
                                    onMouseOver={() => setAnswer(q.id, v)} // Delete later
                                    onClick={() => setAnswer(q.id, v)}
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
                className="mt-10 rounded-lg bg-violet-600 px-6 py-3 text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Submit assessment
            </button>
        </div>
    )
}
