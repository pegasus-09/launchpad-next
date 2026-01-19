"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

const educationOptions = [
    "Middle school",
    "High school",
    "University",
    "Other",
]

const goalOptions = [
    "Explore careers",
    "Choose a college path",
    "Improve skills",
    "Build a resume",
]

const confidenceOptions = [
    "I have no idea",
    "I have some ideas",
    "I am fairly sure",
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)

    const [education, setEducation] = useState<string | null>(null)
    const [goal, setGoal] = useState<string | null>(null)
    const [confidence, setConfidence] = useState<string | null>(null)

    function nextStep() {
        setStep(step + 1)
    }

    async function finishOnboarding() {
        await supabase.auth.updateUser({
            data: {
                onboarding_complete: true,
                education,
                goal,
                confidence,
            },
        })

    router.push("/dashboard")
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-black">
            <div className="w-full max-w-lg rounded-2xl border bg-white p-8">
                {step === 0 && (
                    <section>
                        <h1 className="text-2xl font-bold">
                            What is your education level?
                        </h1>

                        <div className="mt-6 space-y-2">
                            {educationOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setEducation(option)
                                        nextStep()
                                    }}
                                    className="w-full cursor-pointer rounded-lg border px-4 py-3 text-left hover:bg-gray-100"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 1 && (
                    <section>
                        <h1 className="text-2xl font-bold">
                            What are you here to do?
                        </h1>

                        <div className="mt-6 space-y-2">
                            {goalOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setGoal(option)
                                        nextStep()
                                    }}
                                    className="w-full cursor-pointer rounded-lg border px-4 py-3 text-left hover:bg-gray-100"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section>
                        <h1 className="text-2xl font-bold">
                            How confident do you feel right now?
                        </h1>

                        <div className="mt-6 space-y-2">
                            {confidenceOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        setConfidence(option)
                                        finishOnboarding()
                                    }}
                                    className="w-full cursor-pointer rounded-lg border px-4 py-3 text-left hover:bg-gray-100"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    Step {step + 1} of 3
                </div>
            </div>
        </div>
    )
}
